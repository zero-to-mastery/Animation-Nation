// Load the cards.json file using Fetch API
fetch('./public/cards.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON file content
  })
  .then((cards) => {
    /* Shuffles cards' order */
    function shuffle(o) {
      for (
        let j, x, i = o.length;
        i;
        j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
      );
      return o;
    }

    /** Creates cards from the array above */
    const getCardContents = (cardList) => {
      return shuffle(cardList).map((c) => [
        `<li class="card">` +
          `<a href='${c.pageLink}'>` +
          `<img class="art-image" src='${c.imageLink}' alt='${c.artName}' />` +
          `</a>` +
          `<a class="art-title" href='${c.pageLink}'><h3 >${c.artName}</h3></a>` +
          `<p class='author'><a href="${c.githubLink}" target="_blank"><i class="fab fa-github"></i> ${c.author}</a> </p>` +
          `</li>`
      ]);
    };

    /* Injects cards list HTML into the DOM */
    let contents = getCardContents(cards);
    document.getElementById('cards').innerHTML = contents;

    /* Adds scroll to top arrow button */
    window.onscroll = function () {
      if (window.scrollY > 100) {
        goToTopBtn.classList.add('active');
      } else {
        goToTopBtn.classList.remove('active');
      }
    };

    // Adds the click event to the button
    const goToTopBtn = document.querySelector('.go-to-top');
    goToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Get element by id "stats" and set the innerHTML to the following
    document.getElementById(
      'stats'
    ).innerHTML = `Showcasing ${cards.length} artworks`;
  })
  .catch((error) => {
    console.error('Error fetching the cards.json file:', error);
  });

// THEME TOGGLE: initialize and wire up theme toggle button
(function () {
  const THEME_KEY = 'site-theme'; // 'dark' or 'light'

  function prefersLight() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('.icon');
    if (theme === 'light') {
      icon.textContent = '🌙';
      btn.setAttribute('aria-pressed', 'true');
      btn.title = 'Switch to dark theme';
    } else {
      icon.textContent = '🌞';
      btn.setAttribute('aria-pressed', 'false');
      btn.title = 'Switch to light theme';
    }
  }

  // Initialize
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (e) {
    // ignore
  }

  const initialTheme = saved || (prefersLight() ? 'light' : 'dark');
  applyTheme(initialTheme);

  // Wire up button
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // ignore
      }
    });
  });
})();

// 🎨 Hacktoberfest Card Data
const cardList = [
  {
    artName: "HACKTOBERFEST",
    pageLink: "index.html",
    imageLink: "hacktoberfest-logo.png",
    author: "Takunda",
    githubLink: "https://github.com/Enock12234"
  }
];

// 🔀 Optional shuffle function (add if not defined)
function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

// 🖼️ Generate HTML cards
const getCardContents = (cardList) => {
  return shuffle(cardList)
    .map((c) => `
      <li class="card">
        <a href='${c.pageLink}'>
          <img class="art-image" src='${c.imageLink}' alt='${c.artName}' />
        </a>
        <a class="art-title" href='${c.pageLink}'>
          <h3>${c.artName}</h3>
        </a>
        <p class='author'>
          <a href="${c.githubLink}" target="_blank">
            <i class="fab fa-github"></i> ${c.author}
          </a>
        </p>
      </li>
    `)
    .join('');
};

// 🧩 Inject into the DOM
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById("cardContainer");
  if (container) {
    container.innerHTML = getCardContents(cardList);
  }
});
