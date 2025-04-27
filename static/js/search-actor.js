import { createRecommendationSlider } from './slider.js';

window.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchActorBtn");
    const actorInput = document.getElementById("actorInput");
    const loading = document.getElementById("loading");
    const sliderContainer = document.getElementById("movieSlider");

    if (!searchBtn || !actorInput) {
        console.error("searchActorBtn or actorInput not found in DOM.");
        return;
    }

    searchBtn.addEventListener("click", async () => {
        const actor = actorInput.value.trim();

        if (!actor) {
            alert("Please enter an actor's name.");
            return;
        }

        if (!sliderContainer || !loading) {
            console.error("movieSlider or loading element not found.");
            return;
        }

        loading.style.display = "block";
        sliderContainer.innerHTML = ""; // clear previous

        try {
            const response = await fetch("/recommend/actor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `actor=${encodeURIComponent(actor)}`
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch recommendations.");
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                await createRecommendationSlider(data);
            } else {
                sliderContainer.innerHTML = "<p>No recommendations found.</p>";
            }

        } catch (err) {
            console.error("Fetch error:", err);
            sliderContainer.innerHTML = `<p>Error: ${err.message}</p>`;
        } finally {
            loading.style.display = "none";
        }
    });
});
