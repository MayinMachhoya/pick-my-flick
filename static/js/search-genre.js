import { createRecommendationSlider } from './slider.js';

document.addEventListener("DOMContentLoaded", function () {
    const genres = [
        "Action", "Adventure", "Animation", "Comedy", "Crime",
        "Documentary", "Drama", "Family", "Fantasy", "Foreign",
        "History", "Horror", "Music", "Mystery", "Romance",
        "Science Fiction", "TV Movie", "Thriller", "War", "Western"
    ];

    const dropdown = document.getElementById("genreCheckboxDropdown");

    // Create genre checkboxes
    genres.forEach((genre) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${genre}" id="genre-${genre}">
                <label class="form-check-label" for="genre-${genre}">
                    ${genre}
                </label>
            </div>
        `;
        dropdown.appendChild(li);
    });

    // Handle button click to get selected genres
    document.getElementById("searchGenreBtn").addEventListener("click", function () {
        const selectedGenres = Array.from(document.querySelectorAll("#genreCheckboxDropdown input:checked"))
            .map(input => input.value);  // Get selected genres as array

        console.log("Selected Genres:", selectedGenres);

        if (selectedGenres.length === 0) {
            alert("Please select at least one genre.");
            return;
        }

        const genresString = selectedGenres.join(",");

        fetch('/recommend/genre', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ 'genres': genresString })  // Send as form-urlencoded
        })
        .then(response => response.json())
        .then(movies => {
            const target = document.getElementById("movieSlider");
            if (Array.isArray(movies) && movies.length > 0) {
                createRecommendationSlider(movies);  // Uses your shared slider layout
            } else {
                target.innerHTML = `<p class="text-warning">No recommendations found for these genres.</p>`;
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.getElementById("movieSlider").innerHTML = `<p class="text-danger">Something went wrong. Try again later.</p>`;
        });
    });
});
