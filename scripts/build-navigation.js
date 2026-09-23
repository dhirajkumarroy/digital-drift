const fs = require('node:fs');
const path = require('node:path');
const categories = require('../js/categories');
const root = path.resolve(__dirname, '..');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const categoryUrl = id => '/archive' + (id ? '?category=' + encodeURIComponent(id) : '');

// Generate real links in every shared header; JavaScript enhances native disclosures.
module.exports = function buildNavigation(posts) {
  const topics = categories.available(posts);
  const items = [{ id: '', label: 'All articles', count: posts.length }, ...topics];
  const menu = `<details class="nav-categories">
            <summary>Categories <svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="category-menu">${items.map(category => `
              <a href="${categoryUrl(category.id)}" data-category="${escapeHtml(category.id)}">${categories.icon(category.id)}<span>${escapeHtml(category.label)}</span></a>`).join('')}
            </div>
          </details>`;
  const files = [
    ...fs.readdirSync(root).filter(file => file.endsWith('.html')),
    ...fs.readdirSync(path.join(root, 'post')).filter(file => file.endsWith('.html')).map(file => 'post/' + file),
    'admin/index.html', 'BLOG_GUIDELINES.md'
  ];
  for (const file of files) {
    const filename = path.join(root, file);
    const original = fs.readFileSync(filename, 'utf8');
    let html = original.replace(/<nav\b[^>]*class="[^"]*\bnav-(?:desktop|mobile)\b[^"]*"[^>]*>[\s\S]*?<\/nav>/g, nav => {
      if (nav.includes('class="nav-categories"')) {
        return nav.replace(/<details class="nav-categories">[\s\S]*?<\/details>/, menu);
      }
      const oldDesktop = /<div class="nav-dropdown-item">[\s\S]*?<\/div>/;
      if (oldDesktop.test(nav)) return nav.replace(oldDesktop, menu);
      const oldMobile = /<a href="[^"]*">Categories<\/a>/;
      if (oldMobile.test(nav)) return nav.replace(oldMobile, menu);
      // The admin's generated article template uses a smaller header.
      return nav.replace(/<a href="\/archive"/, menu + '\n          <a href="/archive"');
    });
    // Footer category links should select a topic, not just scroll to the filter bar.
    html = html.replace(/<a href="[^"]*" data-tag="([^"]+)">/g, (_, tag) => `<a href="${categoryUrl(tag)}" data-tag="${tag}">`);
    html = html.replace(/(style\.css|posts-data\.js|script\.js|categories\.js)\?v=\d+/g, '$1?v=9');
    html = html.replace(/<noscript><style>\.nav-mobile\{display:flex\}/g, '<noscript><style>@media(max-width:992px){.nav-mobile{display:flex}}');
    // Both ordinary HTML and the admin's escaped HTML template need this dependency.
    html = html.replace(/(?:[ \t]*<script src="\/js\/categories\.js[^"\n]*"><\\?\/script>\r?\n)?([ \t]*)<script src="\/js\/script\.js\?v=9">(<\\?\/script>)/g,
      (_, indent, close) => `${indent}<script src="/js/categories.js?v=9">${close}\n${indent}<script src="/js/script.js?v=9">${close}`);
    if (file === 'index.html') {
      const links = items.map(category => `<a class="category-pill${category.id ? '' : ' active'}" href="${categoryUrl(category.id)}" data-tag="${escapeHtml(category.id || 'all')}">${categories.icon(category.id)}<span class="pill-label">${category.id ? escapeHtml(category.label) : 'All'}</span></a>`).join('\n');
      html = html.replace(/(<div id="tag-filter-bar"[^>]*>)[\s\S]*?(<\/div>)/, (_, open, close) => open + links + close);
    }
    if (file === 'archive.html') {
      const links = items.map(category => `<a class="archive-chip${category.id ? '' : ' active'}" href="${categoryUrl(category.id)}" data-tag="${escapeHtml(category.id)}">${categories.icon(category.id)}<span>${category.id ? escapeHtml(category.label) : 'All Topics'}</span></a>`).join('\n');
      html = html.replace(/(<div class="archive-filters-row">)[\s\S]*?(<\/div>)/, (_, open, close) => `${open}<span class="archive-filter-label">Filter:</span>\n${links}${close}`);
    }
    if (html !== original) fs.writeFileSync(filename, html);
  }
};
