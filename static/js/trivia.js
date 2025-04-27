document.addEventListener("DOMContentLoaded", function () {
    // Select the trivia elements with the new classes
    const triviaPanel = document.querySelector('.trivia-panel');
    const triviaText = document.querySelector('.trivia-text');

    // Array of trivia facts
    const triviaFacts = [
      "The script for The Godfather was only 163 pages long.",
      "Inception had over 500 visual effects shots.",
      "Fight Club's first rule might be broken... but who's counting?",
      "The Jurassic Park T-Rex roar is a mix of dog, penguin, tiger, alligator, and elephant sounds.",
      "Stanley Kubrick shot The Shining over a period of 51 weeks.",
      "Titanic's engine room scenes were filmed in a real decommissioned navy ship.",
      "Heath Ledger kept a Joker diary during the filming of The Dark Knight.",
      "The code in The Matrix comes from sushi recipes scanned from a Japanese cookbook.",
      "In Pulp Fiction, all the clocks are stuck at 4:20.",
      "Mad Max: Fury Road used minimal CGI. Most stunts were done for real.",
      "Lord of the Rings had over 48,000 pieces of armor created by hand.",
      "Interstellar's black hole rendering was so accurate, it resulted in published scientific papers.",
      "The Social Network used body doubles and face mapping to portray the Winklevoss twins.",
      "The Revenant used only natural lighting for almost all of its scenes.",
      "Spirited Away was the first anime to win an Oscar for Best Animated Feature.",
      "The Grand Budapest Hotel used multiple scale models instead of CGI for wide shots.",
      "During The Shining, Jack Nicholson improvised the line “Here's Johnny!”",
      "Alien's chestburster scene was kept a surprise from the cast for genuine reactions.",
      "To create rain in Blade Runner, they used milk to make it show up on camera.",
      "Birdman was edited to appear as a single continuous shot.",
      "Whiplash was filmed in just 19 days.",
      "Forrest Gump's running scenes were mostly done by Tom Hanks' brother, Jim Hanks.",
      "The snow in The Wizard of Oz was actually asbestos.",
      "Get Out was shot in just 23 days on a $4.5 million budget.",
      "The Dark Knight used real IMAX cameras for many of its action scenes.",
      "The booom sound in Inception became a trailer trend called BRAAAM.",
      "Schindler's List was shot mostly in black and white to reflect the era's tone.",
      "Gladiator's lead Oliver Reed died mid-shoot — his scenes were completed using CGI.",
      "The Matrix Reloaded freeway chase was filmed on a custom-built highway.",
      "Avatar took over 10 years to make due to technological limitations at the time.",
      "Back to the Future's DeLorean almost wasn't a DeLorean — it was originally a fridge.",
      "In Her, the entire UI was designed by real futurists.",
      "The Lighthouse was shot with 1930s-style lenses to get its eerie look.",
      "WALL·E has minimal dialogue, relying heavily on sound design to tell the story.",
      "John Wick killed 77 people in the first film. Yes, someone counted.",
      "The hotel in The Shining is based on a real haunted one: The Stanley Hotel.",
      "Jaws' mechanical shark failed so often they had to film it sparingly — making it scarier.",
      "Casablanca was written during production — they didn't know how it would end while filming.",
      "Psycho was the first American movie to show a toilet being flushed on screen.",
      "In La La Land, Gosling learned piano from scratch to avoid using hand doubles.",
      "The musical score for Dunkirk was built entirely around the sound of a ticking watch.",
      "The Irishman used groundbreaking de-aging tech for Robert De Niro and others.",
      "Pan's Labyrinth creature effects were mostly done using practical makeup and suits.",
      "The Thing (1982) used groundbreaking practical effects that still hold up today.",
      "In The Truman Show, the license plate of the escape car says SIRIUS.",
      "Cloverfield's cast didn't know what the monster looked like until the premiere.",
      "Tenet had a real 747 crash — buying a retired one was cheaper than CGI.",
      "Oppenheimer didn't use a single CGI shot for the nuclear explosion scene."
    ];

    let currentIndex = 0;

    // Function to show the trivia panel with fade-in animation
    function showTrivia() {
      triviaPanel.classList.add('show'); // Add the show class to trigger fade-in
    }

    // Function to hide the trivia panel with fade-out animation
    function hideTrivia() {
      triviaPanel.classList.remove('show'); // Remove the show class to trigger fade-out
    }

    setInterval(() => {
      // Change the trivia text
      currentIndex = (currentIndex + 1) % triviaFacts.length;
      triviaText.textContent = triviaFacts[currentIndex]; // Update the text

      // Show the trivia panel (fade-in)
      showTrivia();

      // Hide the trivia panel (fade-out) after 8 seconds
      setTimeout(hideTrivia, 5000); // After 8 seconds, fade out
    }, 7000); // Change trivia every 16 seconds (8 seconds for fade-in + 8 seconds for display)


  });
  