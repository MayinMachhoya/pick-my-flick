// slider.js
const TMDB_API_KEY = 'aa8eda4c5575aaa365e858c873310666'; // Replace with your actual TMDB key
const BASE_URL = "https://api.themoviedb.org/3";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

export async function createRecommendationSlider(movies, containerId = "movieSlider", loadingId = "loading") {
    const sliderElement = document.getElementById(containerId);
    const loadingElement = document.getElementById(loadingId);

    sliderElement.innerHTML = ""; // Clear previous results
    loadingElement.style.display = "block";

    for (const movie of movies.slice(0, 10)) {
        try {
            const response = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`);
            const movieDetails = await response.json();

            const sliderItem = document.createElement('div');
            sliderItem.className = 'slider-item';

            const posterImg = document.createElement('img');
            posterImg.className = 'poster-img';
            posterImg.src = POSTER_BASE_URL + movieDetails.poster_path;
            posterImg.alt = movieDetails.title;

            const titleElement = document.createElement('div');
            titleElement.className = 'movie-title';
            titleElement.textContent = movieDetails.title;

            const ratingElement = document.createElement('div');
            ratingElement.className = 'movie-rating';
            ratingElement.textContent = `★ ${movieDetails.vote_average}`;

            sliderItem.appendChild(posterImg);
            sliderItem.appendChild(titleElement);
            sliderItem.appendChild(ratingElement);

            // sliderItem.addEventListener('click', () => {
            //     // Navigate or open modal
            //     alert(`Navigate to: ${movieDetails.title}`);
            //     // window.location.href = `/movie/${movieDetails.id}`;
            // });

            sliderElement.appendChild(sliderItem);
        } catch (err) {
            console.error("Error loading movie details:", err);
        }
    }

    loadingElement.style.display = "none";
}