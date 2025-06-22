// script.js (for index.html)
import { translations } from 'translation.js';

if (document.getElementById('article-list')) {
  // We are on index.html
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      // Sort articles by date (newest first)
      data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

      const articles = data.articles;
      const listEl = document.getElementById('article-list');

      function showArticles(category) {
        // Clear current list
        listEl.innerHTML = '';
        // Filter articles
        const filtered = (category === 'all')
          ? articles
          : articles.filter(a => a.category === category);
        // Populate list
        filtered.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `
          <small>${item.date}</small>
          <a href="${item.pdf}" target="_blank">${item.title}</a>
          <desc>${item.description}</desc>
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
    })
    .catch(err => console.error('Failed to load data.json:', err));

  const setLanguage = lang => {
    document.querySelectorAll('[data-lang]').forEach(el => {
      const text = translations[lang]?.[el.dataset.lang];
      text && (el.innerHTML = text);
    });
    localStorage.setItem('language', lang);
  };

  // Make setLanguage available globally
  window.setLanguage = setLanguage;

  // Load saved language on page load
  document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  });
}
