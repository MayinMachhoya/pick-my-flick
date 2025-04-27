import { createRecommendationSlider } from './slider.js';

document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchDirectorBtn");
    const directorInput = document.getElementById("directorInput");

    if (!searchBtn || !directorInput) {
        console.error("searchBtn or directorInput not found in DOM.");
        return;
    }

    searchBtn.addEventListener("click", async () => {
        const directorName = directorInput.value.trim();

        if (!directorName) {
            alert("Please enter a director's name.");
            return;
        }

        const loadingDiv = document.getElementById("loading");
        const sliderContainer = document.getElementById("movieSlider");

        if (sliderContainer) sliderContainer.innerHTML = "";
        if (loadingDiv) loadingDiv.style.display = "block";

        try {
            const response = await fetch("/recommend/director", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ director: directorName })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const data = await response.json();
            await createRecommendationSlider(data, "movieSlider", "loading");

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to fetch recommendations. Please try again.");
        }
    });
});
