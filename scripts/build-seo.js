const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'https://blog.dhirajroy.com';
const escapeXml = value => String(value).replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
})[char]);
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const write = (file, content) => {
  if (!fs.existsSync(path.join(ROOT, file)) || read(file) !== content) {
    fs.writeFileSync(path.join(ROOT, file), content);
  }
};

// Evaluate only the trusted local registry; browser and build share this data.
const posts = vm.runInNewContext(read('js/posts-data.js') + '\nBLOG_POSTS;', {}, { timeout: 1000 });
const slugs = new Set();
for (const post of posts) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) {
    throw new Error(`Invalid or duplicate post slug: ${post.slug}`);
  }
  slugs.add(post.slug);
  if (post.url !== `/post/${post.slug}` || !/^\d{4}-\d{2}-\d{2}$/.test(post.dateISO) ||
      Number.isNaN(Date.parse(post.dateISO)) || !post.title || !post.summary || !Array.isArray(post.tags)) {
    throw new Error(`Invalid registry entry: ${post.slug}`);
  }
  const html = read(`post/${post.slug}.html`);
  if (!html.includes(`rel="canonical" href="${DOMAIN}${post.url}"`)) {
    throw new Error(`Canonical URL does not match registry: ${post.slug}`);
  }
  const modified = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
  post.modified = modified ? modified[1] : post.dateISO;
}
posts.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
require('./build-navigation')(posts);

for (const post of posts) {
  const file = `post/${post.slug}.html`;
  let html = read(file);
  const crumbs = `<nav class="breadcrumbs" aria-label="Breadcrumb navigation"><a href="/">Home</a><span class="bc-sep" aria-hidden="true">/</span><a href="/archive">Archive</a><span class="bc-sep" aria-hidden="true">/</span><span class="bc-current" aria-current="page">${escapeXml(post.title)}</span></nav>`;
  const markup = `<!-- generated:breadcrumbs:start -->${crumbs}<!-- generated:breadcrumbs:end -->`;
  if (html.includes('<!-- generated:breadcrumbs:start -->')) {
    html = html.replace(/<!-- generated:breadcrumbs:start -->[\s\S]*?<!-- generated:breadcrumbs:end -->/, markup);
  } else {
    html = html.replace('<h1 class="post-title">', markup + '\n        <h1 class="post-title">');
  }
  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: 'Archive', item: DOMAIN + '/archive' },
      { '@type': 'ListItem', position: 3, name: post.title, item: DOMAIN + post.url }
    ]
  };
  const structured = `<script id="breadcrumb-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  html = html.includes('id="breadcrumb-schema"')
    ? html.replace(/<script id="breadcrumb-schema"[\s\S]*?<\/script>/, structured)
    : html.replace('</head>', `  ${structured}\n</head>`);
  write(file, html);
}

const staticPages = ['/', '/about', '/contact', '/archive', '/privacy-policy', '/disclaimer'];
const urls = staticPages.map(url => `  <url><loc>${DOMAIN}${url}</loc></url>`);
for (const post of posts) {
  urls.push(`  <url><loc>${DOMAIN}${escapeXml(post.url)}</loc><lastmod>${post.modified}</lastmod></url>`);
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);

// Rebuilding must not invent a new publication/modification date.
const latestDate = posts.map(post => post.modified).sort().at(-1);
const utcDate = date => new Date(`${date}T00:00:00Z`).toUTCString();
write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Digital Drift</title>
    <link>${DOMAIN}/</link>
    <description>Backend, AI, and programming blogs by Dhiraj Roy.</description>
    <language>en-us</language>
    <lastBuildDate>${utcDate(latestDate)}</lastBuildDate>
    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
${posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${DOMAIN}${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${DOMAIN}${escapeXml(post.url)}</guid>
      <pubDate>${utcDate(post.dateISO)}</pubDate>
      <description>${escapeXml(post.summary)}</description>
${post.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`).join('\n')}
  </channel>
</rss>
`);

// Commit these fragments so discovery and reading also work without JavaScript.
function updateFragment(file, name, content) {
  const start = `<!-- generated:${name}:start -->`;
  const end = `<!-- generated:${name}:end -->`;
  const html = read(file);
  const first = html.indexOf(start);
  const last = html.indexOf(end);
  if (first < 0 || last < first) throw new Error(`Missing ${name} markers in ${file}`);
  write(file, html.slice(0, first + start.length) + '\n' + content + '\n' + html.slice(last));
}
function card(post) {
  return `<article class="blog-card">
  <a href="${post.url}" class="card-image-link" aria-label="${escapeXml(post.title)}"><img src="${escapeXml(post.image || '/android-chrome-512x512.png')}" alt="" class="card-image" width="800" height="500" loading="lazy" decoding="async" /></a>
  <div class="card-body">
    <div class="card-tags">${post.tags.slice(0, 2).map(tag => `<span class="tag">${escapeXml(tag)}</span>`).join('')}</div>
    <h3 class="card-title"><a href="${post.url}">${escapeXml(post.title)}</a></h3>
    <p class="card-summary">${escapeXml(post.summary)}</p>
    <div class="card-footer"><time class="meta-item" datetime="${post.dateISO}">${escapeXml(post.date)}</time><span class="meta-item">${post.readTime} min read</span></div>
  </div>
</article>`;
}
updateFragment('index.html', 'posts', posts.slice(0, 6).map(card).join('\n'));
const featured = posts.find(post => post.featured) || posts[0];
updateFragment('index.html', 'featured', `<div class="section-top-header">
  <h2 class="section-title">Featured Article</h2><a href="/archive" class="section-action-link">View all →</a>
</div>
<article class="featured-card">
  <div class="featured-image-container"><a href="${featured.url}" class="featured-image-link" aria-label="${escapeXml(featured.title)}"><span class="badge-new">FEATURED</span><img src="${escapeXml(featured.image)}" alt="" class="featured-image" width="800" height="500" loading="lazy" decoding="async" /></a></div>
  <div class="featured-text-content">
    <div class="card-tags">${featured.tags.slice(0, 2).map(tag => `<span class="tag">${escapeXml(tag)}</span>`).join('')}</div>
    <h3 class="featured-card-title"><a href="${featured.url}">${escapeXml(featured.title)}</a></h3>
    <p class="featured-card-summary">${escapeXml(featured.summary)}</p>
    <div class="card-author-meta"><span class="author-name">Dhiraj Roy</span><time class="meta-item" datetime="${featured.dateISO}">${escapeXml(featured.date)}</time><span class="meta-item">${featured.readTime} min read</span></div>
  </div>
</article>`);
write('index.html', read('index.html').replace(/(id="posts-count-badge"[^>]*>)[^<]*/, `$1${posts.length} articles`));
const years = [...new Set(posts.map(post => post.dateISO.slice(0, 4)))];
updateFragment('archive.html', 'archive', years.map(year => `<section class="archive-year-group">
  <h2 class="archive-year-badge">${year}</h2>
  <div class="archive-list">${posts.filter(post => post.dateISO.startsWith(year)).map(post => `
    <a href="${post.url}" class="archive-item">
      <div class="archive-item-left"><time class="archive-date-pill" datetime="${post.dateISO}">${escapeXml(post.date)}</time><div class="archive-item-info"><span class="archive-item-title">${escapeXml(post.title)}</span><div class="archive-item-tags">${post.tags.map(tag => `<span class="tag">${escapeXml(tag)}</span>`).join('')}</div></div></div>
      <span class="archive-read-time">${post.readTime} min read</span>
    </a>`).join('')}
  </div>
</section>`).join('\n'));

// Explicit routes avoid wildcard HTML rewrites and soft 404s.
const routes = [
  '# Generated by node scripts/build-seo.js',
  '/index.html / 301',
  '/post/nodejs-complete-guide /post/nodejs-backend-development-production-api 301',
  '/post/nodejs-complete-guide.html /post/nodejs-backend-development-production-api 301',
  '/post/spring-boot-postgresql-crud-guide /post/spring-boot-postgresql-crud-jpa-hibernate 301',
  '/post/spring-boot-postgresql-crud-guide.html /post/spring-boot-postgresql-crud-jpa-hibernate 301'
];
for (const url of [...staticPages.slice(1), ...posts.map(post => post.url)]) {
  routes.push(`${url}.html ${url} 301`, `${url} ${url}.html 200`);
}
routes.push('/* /404.html 404');
write('_redirects', routes.join('\n') + '\n');
console.log(`Generated static listings, ${urls.length} sitemap URLs, ${posts.length} RSS items, and canonical routes.`);
