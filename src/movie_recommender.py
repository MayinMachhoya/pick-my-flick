import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import process
from gensim.models import Word2Vec
import scipy.sparse
import pickle
import os
import re
import random

class MovieRecommender:
    def __init__(self, csv_path):
        """Initialize the recommender with dataset path."""
        self.movies_df = pd.read_csv(csv_path)
        self.movies_df['tags'] = self.movies_df['tags'].fillna('').apply(lambda x: x.lower())

        # Initialize Word2Vec placeholders
        self.word2vec_model = None
        self.movie_vectors = None

        # Clustering placeholders
        self.kmeans = None
        self.movie_clusters = None

        # Title list for fuzzy search
        self.titles = self.movies_df['title'].tolist()

        # Feedback memory (movie_id: +1/-1 adjustments)
        self.feedback = {}
        
        # Session variability tracking
        self._recommendation_history = {}
        self._variation_pool = {}

    def preprocess_tags(self):
        """Tokenize and clean tags for Word2Vec."""
        return [re.findall(r"\b\w+\b", tag) for tag in self.movies_df['tags']]

    def vectorize_movies(self):
        """Convert each movie's tags into a mean Word2Vec vector."""
        vectors = []
        for tokens in self.preprocess_tags():
            vecs = [self.word2vec_model.wv[word] for word in tokens if word in self.word2vec_model.wv]
            if vecs:
                vectors.append(np.mean(vecs, axis=0))
            else:
                vectors.append(np.zeros(self.word2vec_model.vector_size))
        return np.array(vectors)

    def train(self, num_clusters=20):
        """Train Word2Vec model and perform clustering."""
        tokenized_tags = self.preprocess_tags()

        # Train Word2Vec model
        self.word2vec_model = Word2Vec(sentences=tokenized_tags, vector_size=100, window=5, min_count=1, workers=4, epochs=30)

        # Create vector for each movie
        self.movie_vectors = self.vectorize_movies()

        # Cluster movie vectors
        self.kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        self.movie_clusters = self.kmeans.fit_predict(self.movie_vectors)
        self.movies_df['cluster'] = self.movie_clusters

    def fuzzy_search(self, query, limit=5, min_score=70):
        """Perform fuzzy title search with minimum score threshold."""
        matches = process.extract(query, self.titles, limit=limit)
        results = []
        for match, score in matches:
            if score >= min_score:
                movie = self.movies_df[self.movies_df['title'] == match].iloc[0]
                results.append({
                    'title': movie['title'],
                    'id': movie.name,
                    'score': score
                })
        return results

    def get_recommendations(self, movie_id, n_recommendations=10):
        """Get recommendations using cluster filtering + cosine + feedback."""
        if self.movie_vectors is None:
            raise ValueError("Model not trained. Call train() first.")
            
        # Check if movie_id exists in dataset
        if isinstance(movie_id, str):
            # If movie_id is a string, assuming it's a movie title
            search_results = self.fuzzy_search(movie_id, limit=1)
            if not search_results:
                return {"error": "Title not found in dataset"}
            movie_id = search_results[0]['id']
            
        if movie_id not in self.movies_df.index:
            return {"error": "Movie ID not found in dataset"}

        query_vec = self.movie_vectors[movie_id].reshape(1, -1)
        cluster_id = self.movie_clusters[movie_id]

        # Get all movies in same cluster
        same_cluster_indices = np.where(self.movie_clusters == cluster_id)[0]
        cluster_vectors = self.movie_vectors[same_cluster_indices]

        # Compute cosine similarities
        similarities = cosine_similarity(query_vec, cluster_vectors).flatten()

        # Adjust with feedback
        adjusted_scores = []
        for idx, sim in zip(same_cluster_indices, similarities):
            adjustment = self.feedback.get(idx, 0)
            adjusted_scores.append((idx, sim + adjustment))

        # Sort by similarity score
        sorted_indices = sorted(adjusted_scores, key=lambda x: x[1], reverse=True)
        
        # Create variability in recommendations
        top_indices = self._apply_recommendation_variability(movie_id, sorted_indices, n_recommendations)
        
        # Filter out the input movie itself
        top_movie_indices = [idx for idx, _ in top_indices if idx != movie_id][:n_recommendations]

        return self.movies_df.iloc[top_movie_indices].to_dict('records')

    def _apply_recommendation_variability(self, movie_id, sorted_indices, n_recommendations):
        """
        Apply variability to recommendations while maintaining quality.
        This function introduces controlled randomness to prevent showing 
        the exact same recommendations each time.
        """
        # If this is the first time recommending for this movie, initialize history
        if movie_id not in self._recommendation_history:
            self._recommendation_history[movie_id] = set()
            
        # If we don't have a variation pool for this movie, create one
        if movie_id not in self._variation_pool:
            # We'll take a pool of top candidates (2x the requested number)
            pool_size = min(n_recommendations * 2, len(sorted_indices))
            self._variation_pool[movie_id] = sorted_indices[:pool_size]
        
        # Extract the top n + some buffer for variation
        top_n = n_recommendations + 5  # Add buffer for variation
        candidates = sorted_indices[:top_n]
        
        # Keep the top recommendations consistent (70%)
        stable_count = int(n_recommendations * 0.7)
        result = candidates[:stable_count]
        
        # For the remaining slots, introduce variation from our pool
        variation_candidates = [idx for idx, _ in self._variation_pool[movie_id] 
                               if idx not in [i for i, _ in result]]
        
        # Shuffle the variation candidates to introduce randomness
        random.shuffle(variation_candidates)
        
        # Select additional recommendations from the shuffled pool
        remaining_slots = n_recommendations - stable_count
        for idx in variation_candidates[:remaining_slots]:
            # Find the score for this index
            for index, score in sorted_indices:
                if index == idx:
                    result.append((idx, score))
                    break
                    
        # Update history
        for idx, _ in result:
            self._recommendation_history[movie_id].add(idx)
            
        return result

    def reset_recommendation_history(self, movie_id=None):
        """Reset the recommendation history for a specific movie or all movies."""
        if movie_id is not None:
            if movie_id in self._recommendation_history:
                del self._recommendation_history[movie_id]
            if movie_id in self._variation_pool:
                del self._variation_pool[movie_id]
        else:
            self._recommendation_history = {}
            self._variation_pool = {}

    def multi_field_search(self, genres=None, n_recommendations=10):
        """Search movies by multiple genres with prioritization for exact matches (all selected genres)."""
        if genres:
            # Create a regular expression pattern to match movies that contain all selected genres
            genre_pattern = '^(?=.*' + ')(?=.*'.join([re.escape(genre) for genre in genres]) + ')'
            
            # Filter movies that match all selected genres (exact match)
            exact_match_movies = self.movies_df[
                self.movies_df['genres'].str.contains(genre_pattern, case=False, na=False)
            ]
            
            # Filter movies for each individual genre as a fallback
            genre_movies = []
            for genre in genres:
                genre_movies.append(self.movies_df[self.movies_df['genres'].str.contains(genre, case=False, na=False)])
            
            # Combine the exact match results with other results, ensuring no duplicates
            combined_movies = pd.concat([exact_match_movies] + genre_movies).drop_duplicates()
            
            # Return the top 'n_recommendations' movies
            return combined_movies.head(n_recommendations).to_dict('records')
        
        return []

    def get_movies_by_actor(self, actor, n_movies=10):
        """Get top movies for a specific actor."""
        actor_movies = self.movies_df[self.movies_df['cast'].str.contains(actor, case=False, na=False)]
        return actor_movies.head(n_movies).to_dict('records')

    def get_movies_by_director(self, director, n_movies=10):
        """Get top movies for a specific director."""
        director_movies = self.movies_df[self.movies_df['director'].str.contains(director, case=False, na=False)]
        return director_movies.head(n_movies).to_dict('records')

    def save_model(self, filename='movie_recommender.pkl'):
        """Save model components and data."""
        with open(filename, 'wb') as f:
            pickle.dump({
                'movies_df': self.movies_df,
                'word2vec_model': self.word2vec_model,
                'movie_vectors': self.movie_vectors,
                'kmeans': self.kmeans,
                'movie_clusters': self.movie_clusters,
                'feedback': self.feedback,
                'recommendation_history': self._recommendation_history,
                'variation_pool': self._variation_pool
            }, f)

    @classmethod
    def load_model(cls, filename='movie_recommender.pkl'):
        """Load model components and data."""
        if not os.path.exists(filename):
            return None

        with open(filename, 'rb') as f:
            data = pickle.load(f)

        recommender = cls.__new__(cls)
        recommender.movies_df = data['movies_df']
        recommender.word2vec_model = data['word2vec_model']
        recommender.movie_vectors = data['movie_vectors']
        recommender.kmeans = data['kmeans']
        recommender.movie_clusters = data['movie_clusters']
        recommender.feedback = data['feedback']
        recommender.titles = recommender.movies_df['title'].tolist()
        
        # Load variability tracking if it exists in saved data
        recommender._recommendation_history = data.get('recommendation_history', {})
        recommender._variation_pool = data.get('variation_pool', {})

        return recommender

if __name__ == "__main__":
    recommender = MovieRecommender("movies_tags.csv")
    recommender.train()
    recommender.save_model()