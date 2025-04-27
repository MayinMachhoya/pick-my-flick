document.getElementById('searchTitleBtn').addEventListener('click', function () {
  const title = document.getElementById('titleInput').value;

  // Make sure title is provided
  if (!title) {
      alert("Please enter a title to get recommendations!");
      return;
  }

  fetch('/recommend/title', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title })  // Send title as JSON
  })
  .then(response => response.json())  // Expecting JSON response
  .then(data => {
      displayRecommendations(data);  // Call function to display recommendations
  })
  .catch(error => {
      console.log("Error:", error);  // Log any errors to the console
      alert("An error occurred while fetching recommendations.");
  });
});

function displayRecommendations(movies) {
  const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) {
        console.warn("No #recommendations-container found. Skipping legacy display.");
        return;
    }
  recommendationsContainer.innerHTML = '';  // Clear previous recommendations

  if (movies.length === 0) {
      recommendationsContainer.innerHTML = '<p>No recommendations found!</p>';
      return;
  }

  // Loop through the movie data and create HTML elements for each movie
  movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.classList.add('movie');
      movieElement.innerHTML = `
          <h4>${movie.title}</h4>
          <p><strong>Genres:</strong> ${movie.genres}</p>
          <p><strong>Actors:</strong> ${movie.actors}</p>
      `;
      recommendationsContainer.appendChild(movieElement);  // Add the movie to the container
  });
}

import { createRecommendationSlider } from './slider.js';

document.getElementById('searchTitleBtn').addEventListener('click', function () {
    const title = document.getElementById('titleInput').value;
  
    if (!title) {
      alert("Please enter a title to get recommendations!");
      return;
    }
  
    // Optional: Show loading indicator
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
    
    document.getElementById('loading').style.display = 'block';
    fetch('/recommend/title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title })
    })
    
    
    .then(async response => {
        if (!response.ok) {
          const text = await response.text();
          console.error("Non-OK response body:", text);
          throw new Error(`Server responded with status ${response.status}`);
        }
      
        const text = await response.text();
        console.log("Raw response text:", text);
      
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse JSON:", e, "Response text was:", text);
          throw new Error("Invalid JSON format received from server.");
        }
      
        // Optional: Hide loading
        if (loading) loading.style.display = 'none';
      
        createRecommendationSlider(data);
        document.getElementById('loading').style.display = 'none';
      })
      
    .catch(error => {
      console.error("Fetch error:", error);
      document.getElementById('loading').style.display = 'none';
      alert("Oops! Something went wrong. Please try again.");
    });
  });
  