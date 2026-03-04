/**
 * Shuffles an array's elements into a random order without mutating the original.
 * @param {Array} array The array to shuffle.
 * @returns {Array} A new array containing the same elements in a random order.
 */
function shuffle(array) {
  const newArray = [...array];
  for (
    let j, x, i = newArray.length;
    i;
    j = parseInt(Math.random() * i),
      (x = newArray[--i]),
      (newArray[i] = newArray[j]),
      (newArray[j] = x)
  );
  return newArray;
}

/**
 * Returns a function that delays invoking its callback until after a specified delay.
 * @param {Function} func The function to debounce.
 * @param {number} [delay=300] The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Renders a generic message (e.g., "No results") into a specified container.
 * @param {HTMLElement} container The DOM element to render the message into.
 * @param {string} message The text content of the message.
 */
function renderNoResultsMessage(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="no-results">${message}</p>`;
}

/**
 * Renders a list of card objects into the main card container.
 * @param {HTMLElement} container The DOM element to render the cards into.
 * @param {Array} cardList The array of card objects to display.
 */
function renderCards(container, cardList) {
  if (!container) return;
  if (cardList.length === 0) {
    renderNoResultsMessage(container, "No artworks found.");
    return;
  }
  const html = cardList
    .map((card) => `
      <li class="card">
        <a href='${card.pageLink || "#"}'>
          <img class="art-image" src='${card.imageLink || ""}' alt='${card.artName || "Untitled"}' />
        </a>
        <a class="art-title" href='${card.pageLink || "#"}'>
          <h3>${card.artName || "Untitled"}</h3>
        </a>
        <p class='author'>
          <a href="${card.githubLink || "#"}" target="_blank">
            <i class="fab fa-github"></i> ${card.author || "Unknown"}
          </a>
        </p>
      </li>
    `)
    .join("");
  container.innerHTML = html;
}

/**
 * Updates the stats text with the total and optionally the filtered count.
 * @param {HTMLElement} statsElement The DOM element for the stats text.
 * @param {number} totalCount The total number of artworks.
 * @param {number} [filteredCount] The optional number of found artworks.
 */
function updateStats(statsElement, totalCount, filteredCount) {
  let message = `Showcasing ${totalCount} artworks`;
  if (filteredCount !== undefined) {
    message += ` | ${filteredCount} found`;
  }
  statsElement.innerHTML = message;
}

/**
 * Filters cards, updates stats, and triggers re-renders based on search input.
 * @param {object} elements An object containing the required DOM elements.
 * @param {Array} masterCardList The complete, unfiltered list of cards.
 */
function handleSearch(elements, masterCardList) {
  const { searchInput, cardsContainer, statsElement, clearBtn } = elements;
  const query = searchInput.value.toLowerCase().trim();

  clearBtn.classList.toggle("visible", query.length > 0);

  if (query === "") {
    updateStats(statsElement, masterCardList.length);
    renderCards(cardsContainer, shuffle(masterCardList));
  } else {
    const filteredList = masterCardList.filter((card) => {
      if (!card) return false;
      const artName = (card.artName || "").toLowerCase();
      const author = (card.author || "").toLowerCase();
      return artName.includes(query) || author.includes(query);
    });
    updateStats(statsElement, masterCardList.length, filteredList.length);
    renderCards(cardsContainer, filteredList);
  }
}

/**
 * Fetches initial data and sets up all application event listeners.
 */
async function initApp() {
  const elements = {
    searchInput: document.getElementById("search-input"),
    cardsContainer: document.getElementById("cards"),
    statsElement: document.getElementById("stats"),
    goToTopBtn: document.querySelector(".go-to-top"),
    clearBtn: document.getElementById("clear-btn"),
  };

  try {
    const response = await fetch("./public/cards.json");
    if (!response.ok) throw new Error("Failed to fetch cards.json");
    const data = await response.json();
    
    const masterCardList = data;

    const debouncedSearch = debounce(() => handleSearch(elements, masterCardList), 300);
    elements.searchInput.addEventListener("input", debouncedSearch);

    elements.clearBtn.addEventListener("click", () => {
      elements.searchInput.value = "";
      handleSearch(elements, masterCardList); 
      elements.searchInput.blur();
    });

    // Manages the initial render, including handling the browser back button state.
    handleSearch(elements, masterCardList);

    // Sets up the go-to-top button functionality.
    window.onscroll = () => {
      elements.goToTopBtn.classList.toggle("active", window.scrollY > 100);
    };
    elements.goToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  } catch (error) {
    console.error("Error initializing app:", error);
    renderNoResultsMessage(elements.cardsContainer, "Error: Could not load artworks.");
  }
}

// Kicks off the application once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", initApp);