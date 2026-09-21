const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);

module.exports = function buildListings(posts) {
  const sorted = [...posts].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  for (const post of sorted) {
    if (!fs.existsSync(path.join(root, post.url + '.html'))) {
      throw new Error(`Missing article: ${post.url}`);
    }
  }
  function update(file, id, tag, markup) {
    const filename = path.join(root, file);
    const html = fs.readFileSync(filename, 'utf8');
    const pattern = new RegExp(`(<${tag}[^>]*id="${id}"[^>]*>)(?:<!-- generated:start -->[\\s\\S]*?<!-- generated:end -->|[^<]*)(</${tag}>)`);
    if (!pattern.test(html)) throw new Error(`Cannot find listing slot ${file}#${id}`);
    fs.writeFileSync(filename, html.replace(pattern, (_, open, close) => `${open}<!-- generated:start -->${markup}<!-- generated:end -->${close}`));
  }
  const cards = sorted.slice(0, 6).map(p => `<article class="blog-card">
    <a href="${escapeHtml(p.url)}" class="card-image-link"><img src="${escapeHtml(p.image || '/android-chrome-192x192.png')}" alt="${escapeHtml(p.title)}" class="card-image" loading="lazy" /></a>
    <div class="card-body"><div class="card-tags">${p.tags.slice(0, 2).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
    <h3 class="card-title"><a href="${escapeHtml(p.url)}">${escapeHtml(p.title)}</a></h3>
    <p class="card-summary">${escapeHtml(p.summary)}</p><div class="card-footer"><time datetime="${p.dateISO}">${escapeHtml(p.date)}</time><span>${p.readTime} min read</span></div></div>
  </article>`).join('\n');
  update('index.html', 'blog-posts-container', 'div', cards);
  update('index.html', 'posts-count-badge', 'span', `${posts.length} articles`);
  update('archive.html', 'archive-meta', 'div', `Showing ${posts.length} articles`);
  const years = [...new Set(sorted.map(p => p.dateISO.slice(0, 4)))];
  update('archive.html', 'archive-list', 'main', years.map(year => `<section class="archive-year-group"><h2 class="archive-year-badge">${year}</h2><div class="archive-list">${sorted.filter(p => p.dateISO.startsWith(year)).map(p => `<a href="${escapeHtml(p.url)}" class="archive-item"><div class="archive-item-left"><time class="archive-date-pill" datetime="${p.dateISO}">${escapeHtml(p.date)}</time><span class="archive-item-title">${escapeHtml(p.title)}</span></div><span class="archive-read-time">${p.readTime} min read</span></a>`).join('\n')}</div></section>`).join('\n'));

  // Every clean URL needs a rewrite before the final 404 rule.
  const routes = ['about', 'contact', 'archive', 'privacy-policy', 'disclaimer', ...sorted.map(p => p.url.slice(1))];
  fs.writeFileSync(path.join(root, '_redirects'), '/index.html / 301\n' + routes.map(route => `/${route}.html /${route} 301\n/${route} /${route}.html 200`).join('\n') + '\n/* /404.html 404\n');
  console.log(`Generated static listings and routes for ${posts.length} articles`);
};
