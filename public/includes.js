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

function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function renderMessage(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="no-results">${message}</p>`;
}

function renderCards(container, cardList) {
  if (!container) return;
  if (cardList.length === 0) {
    renderMessage(container, "No artworks found.");
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

function handleSearch(elements, masterCardList) {
  const { searchInput, cardsContainer, statsElement, clearBtn } = elements;
  const query = searchInput.value.toLowerCase().trim();

  clearBtn.classList.toggle("visible", query.length > 0);

  if (query === "") {
    statsElement.innerHTML = `Showcasing ${masterCardList.length} artworks`;
    renderCards(cardsContainer, shuffle(masterCardList));
  } else {
    const filteredList = masterCardList.filter((card) => {
      if (!card) return false;
      const artName = (card.artName || "").toLowerCase();
      const author = (card.author || "").toLowerCase();
      return artName.includes(query) || author.includes(query);
    });
    statsElement.innerHTML = `Showcasing ${masterCardList.length} artworks | ${filteredList.length} found`;
    renderCards(cardsContainer, filteredList);
  }
}

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

    handleSearch(elements, masterCardList);
    window.onscroll = () => {
      elements.goToTopBtn.classList.toggle("active", window.scrollY > 100);
    };
    elements.goToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  } catch (error) {
    console.error("Error initializing app:", error);
    renderMessage(elements.cardsContainer, "Error: Could not load artworks.");
  }
}

document.addEventListener("DOMContentLoaded", initApp);