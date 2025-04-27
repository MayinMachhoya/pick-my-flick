from flask import Flask, render_template, request, jsonify
from src.movie_recommender import MovieRecommender 
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

print("Templates found in /templates:")
print(os.listdir("templates"))

app = Flask(__name__)

# Load the model once when the app starts
recommender = MovieRecommender.load_model('models/movie_recommender.pkl')

# Homepage route
@app.route('/')
def index():
    return render_template('index.html')

# About page route
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/search-title')
def search_title():
    return render_template('search-title.html')

@app.route('/search-actor')
def search_actor():
    return render_template('search-actor.html')

@app.route('/search-genre')
def search_genre():
    return render_template('search-genre.html')

@app.route('/search-director')
def search_director():
    return render_template('search-director.html')

# Recommendation: Title
@app.route('/recommend/title', methods=['POST'])
def recommend_by_title():
    data = request.get_json()
    title = data.get('title')

    if not title:
        return jsonify({'error': 'No title provided'}), 400

    matches = recommender.fuzzy_search(title)
    if matches:
        movie_id = matches[0]['id']
        recommendations = recommender.get_recommendations(int(movie_id))
        
        # Check if an error was returned
        if isinstance(recommendations, dict) and 'error' in recommendations:
            return jsonify({'error': recommendations['error']}), 404
        
        # Debug: Check what's in recommendations
        print("Recommendations:", recommendations)
        
        return jsonify(recommendations)
    else:
        # If no matches were found, return a more specific error
        return jsonify({'error': 'Title not found in dataset'}), 404

# Reset recommendation variability for a specific title
@app.route('/reset/title', methods=['POST'])
def reset_title_recommendations():
    data = request.get_json()
    title = data.get('title')
    
    if not title:
        return jsonify({'error': 'No title provided'}), 400
    
    matches = recommender.fuzzy_search(title)
    if matches:
        movie_id = matches[0]['id']
        recommender.reset_recommendation_history(int(movie_id))
        return jsonify({'status': 'success', 'message': f'Reset recommendations for {title}'})
    else:
        return jsonify({'error': 'Title not found in dataset'}), 404

# Reset all recommendation variability
@app.route('/reset/all', methods=['POST'])
def reset_all_recommendations():
    recommender.reset_recommendation_history()
    return jsonify({'status': 'success', 'message': 'Reset all recommendation history'})

# Recommendation: Genre
@app.route('/recommend/genre', methods=['POST'])
def recommend_by_genre():
    genres_string = request.form.get('genres')
    
    if genres_string:
        genres = genres_string.split(",")
        logging.debug(f"Genres received: {genres}")  # Log received genres
        
        try:
            recommendations = recommender.multi_field_search(genres)  # Get recommendations based on genres
            logging.debug(f"Recommendations found: {recommendations}")  # Log the recommendations
            
            # Return the recommendations as JSON
            return jsonify(recommendations)
        
        except Exception as e:
            logging.error(f"Error occurred in recommend_by_genre: {e}")  # Log the error
            return jsonify({"error": f"Error occurred: {str(e)}"}), 500  # Return a 500 error with error details

    else:
        logging.error("No genres selected")  # Log error if no genres are selected
        return jsonify({"error": "No genres selected"}), 400  # Return a 400 error if no genres provided

# Recommendation: Actor
@app.route('/recommend/actor', methods=['POST'])
def recommend_actor():
    actor_name = request.form.get('actor')
    
    if actor_name:
        # Call the method in movie_recommender.py to get recommendations
        recommendations = recommender.get_movies_by_actor(actor_name)  # Correct function call
        
        if recommendations:
            return jsonify(recommendations)  # Send the recommendations as JSON
        else:
            return jsonify({"error": "No recommendations found"}), 400
    return jsonify({"error": "Actor name is missing"}), 400

# Recommendation: Director
@app.route('/recommend/director', methods=['POST'])
def recommend_by_director():
    data = request.get_json()
    director = data.get('director')

    if not director:
        return jsonify({"error": "Director name is required."}), 400

    recommendations = recommender.get_movies_by_director(director)
    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True)