// script.js (for index.html)
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
}


// script.js (for article.html)
if (document.getElementById('article-content')) {
  // Get the slug from URL query
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    document.getElementById('article-content').textContent = 'Error: article not specified.';
  } else {
    // Load metadata to fill title, date, description
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const item = data.articles.find(a => a.slug === slug);
        if (item) {
          document.getElementById('article-title').textContent = item.title;
          document.getElementById('article-meta').textContent =
            `${item.date} — Category: ${item.category}`;
          const pdfLink = document.getElementById('pdf-link');
          pdfLink.href = item.pdf;
        }
      });
// ---- in script.js, inside your `if (document.getElementById('article-content')) {` block ----

// Load and display the .tex content, but strip preamble:
fetch(`articles/${slug}.tex`)
  .then(res => {
    if (!res.ok) throw new Error('Article not found');
    return res.text();
  })
  .then(tex => {
    // 1. Find the part between \begin{document} and \end{document}
    const begin = tex.indexOf('\\begin{document}');
    const end   = tex.indexOf('\\end{document}');
    let body = begin !== -1 && end !== -1
      ? tex.slice(begin + '\\begin{document}'.length, end)
      : tex;

    // 2. Remove any remaining \documentclass or \usepackage lines
    body = body
      .split('\n')
      .filter(line => !line.match(/^\s*\\(documentclass|usepackage|title|author|date)\b/))
      .join('\n');

    // 3. Insert into the page as text (so HTML-safe), then typeset
    const contentEl = document.getElementById('article-content');
    contentEl.textContent = body;

    // 4. Tell MathJax to render the newly inserted math
    MathJax.typeset();
  })
  .catch(err => {
    const contentEl = document.getElementById('article-content');
    contentEl.textContent = 'Could not load article content.';
    console.error(err);
  });
  }
}
