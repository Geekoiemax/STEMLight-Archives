// script.js (for index.html)
let translations;

// Dynamically determine the path for translation.js
const getTranslationPath = () => {
  // If running on GitHub Pages, the pathname starts with /STEMLight-Archives
  if (window.location.hostname.endsWith('github.io')) {
    return '/STEMLight-Archives/translation.js';
  }
  // Otherwise, assume local root
  return './translation.js';
};

const loadTranslations = async () => {
  const module = await import(getTranslationPath());
  translations = module.translations;
};

const setLanguage = lang => {
  document.querySelectorAll('[data-lang]').forEach(el => {
    const text = translations[lang]?.[el.dataset.lang];
    text && (el.innerHTML = text);
  });
  localStorage.setItem('language', lang);

  // Update .active class for language buttons
  const langSwitch = document.getElementById('lang-switch');
  if (langSwitch) {
    langSwitch.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.trim().toLowerCase() === lang) {
        btn.classList.add('active');
      }
    });
  }
};

// Make setLanguage available globally
window.setLanguage = setLanguage;

// Load saved language and translations on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTranslations();
  const savedLang = localStorage.getItem('language') || 'en';
  setLanguage(savedLang);
});

if (document.getElementById('article-list')) {
  // We are on index.html
    import('./data.js')
      .then(module => {
      // Sort articles by date (newest first)
      module.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

      const articles = module.articles;
      const listEl = document.getElementById('article-list');

      // Store current language
      let currentLang = localStorage.getItem('language') || 'en';

      function showArticles(category) {
        // Clear current list
        listEl.innerHTML = '';
        // Filter articles
        const filtered = (category === 'all')
          ? articles
          : articles.filter(a => a.category === category);
        // Populate list
        filtered.forEach(item => {
          const title = item[`title_${currentLang}`] || item.title_en || item.title;
          const desc = item[`description_${currentLang}`] || item.description_en || item.description || '';
          const li = document.createElement('li');
          li.innerHTML = `
            <small>${item.date}</small>
            <a href="${item.pdf}" target="_blank">${title}</a>
            <desc>${desc}</desc>
          `;
          listEl.appendChild(li);
        });
      }

      // Initially show all articles
      showArticles('all');

      // After rendering the buttons, mark "all" as active
      const allBtn = document.querySelector('#category-filters button[data-category="all"]');
      if (allBtn) allBtn.classList.add('active');

      // Setup category filter buttons
      const filterContainer = document.getElementById('category-filters');
      filterContainer.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
          const btns = filterContainer.querySelectorAll('button');
          // Remove .active from all
          btns.forEach(b => b.classList.remove('active'));
          // Add to the clicked one
          e.target.classList.add('active');

          // Now filter the list as before
          const cat = e.target.getAttribute('data-category');
          showArticles(cat);
        }
      });

      // Listen for language changes and re-render articles
      window.setLanguage = lang => {
        document.querySelectorAll('[data-lang]').forEach(el => {
          const text = translations[lang]?.[el.dataset.lang];
          text && (el.innerHTML = text);
        });
        localStorage.setItem('language', lang);
        currentLang = lang;
        // Update .active class for language buttons
        const langSwitch = document.getElementById('lang-switch');
        if (langSwitch) {
          langSwitch.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.trim().toLowerCase() === lang) {
              btn.classList.add('active');
            }
          });
        }
        // Re-render articles in new language
        const activeBtn = document.querySelector('#category-filters button.active');
        const cat = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
        showArticles(cat);
      };

      // On page load, set language and render articles
      const savedLang = localStorage.getItem('language') || 'en';
      currentLang = savedLang;
      // Re-render articles in saved language
      const activeBtn = document.querySelector('#category-filters button.active');
      const cat = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
      showArticles(cat);
    })
    .catch(err => console.error('Failed to load data.json:', err));

}
