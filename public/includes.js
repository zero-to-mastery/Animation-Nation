document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const cardsContainer = document.getElementById("cards");
  const statsElement = document.getElementById("stats");
  const goToTopBtn = document.querySelector(".go-to-top");
  const clearBtn = document.getElementById("clearBtn");

  let masterCardList = [];

  function shuffle(o) {
    const array = [...o];
    for (
      let j, x, i = array.length;
      i;
      j = parseInt(Math.random() * i), (x = array[--i]), (array[i] = array[j]), (array[j] = x)
    );
    return array;
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

  const renderCards = (cardsToRender) => {
    if (cardsToRender.length === 0 && searchInput.value !== "") {
      cardsContainer.innerHTML = '<p class="no-results">No artworks found.</p>';
      return;
    }
    const html = cardsToRender
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
    cardsContainer.innerHTML = html;
  };

  const handleSearch = () => {
    const query = searchInput.value.toLowerCase().trim();

    if (query.length > 0) {
      clearBtn.classList.add("visible");
    } else {
      clearBtn.classList.remove("visible");
    }

    const filteredList = masterCardList.filter((card) => {
      if (!card) return false;
      const artName = (card.artName || "").toLowerCase();
      const author = (card.author || "").toLowerCase();
      return artName.includes(query) || author.includes(query);
    });

    if (query === "") {
      statsElement.innerHTML = `Showcasing ${masterCardList.length} artworks`;
    } else {
      statsElement.innerHTML = `Showcasing ${masterCardList.length} artworks | ${filteredList.length} found`;
    }
    renderCards(filteredList);
  };

  fetch("./public/cards.json")
    .then((response) => response.json())
    .then((data) => {
      masterCardList = data.filter((card) => card);
      statsElement.innerHTML = `Showcasing ${masterCardList.length} artworks`;

      if (searchInput.value.trim() !== "") {
        handleSearch();
      } else {
        renderCards(shuffle(masterCardList));
      }

      searchInput.addEventListener("input", debounce(handleSearch));

      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        renderCards(shuffle(masterCardList)); 
        handleSearch();
        searchInput.blur();
      });
    })
    .catch((error) => {
      console.error("Error loading artworks:", error);
      cardsContainer.innerHTML =
        '<p class="no-results">Error: Could not load artworks.</p>';
    });

  window.onscroll = function () {
    if (window.scrollY > 100) {
      goToTopBtn.classList.add("active");
    } else {
      goToTopBtn.classList.remove("active");
    }
  };

  goToTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});