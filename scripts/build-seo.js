const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://blog.dhirajroy.com';

// 1. Read the posts data
const postsDataPath = path.join(__dirname, '../js/posts-data.js');
const content = fs.readFileSync(postsDataPath, 'utf-8');

// Extract the array using substring to avoid the variable declaration
const arrayStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);

let posts = [];
try {
  // Use eval to parse the JS array (since it has unquoted keys it's not valid JSON)
  posts = eval('(' + arrayStr + ')');
} catch (err) {
  console.error("Failed to parse posts array", err);
  process.exit(1);
}

// 2. Generate sitemap.xml
function generateSitemap() {
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/archive', priority: '0.7', changefreq: 'weekly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

  // Add static pages
  const today = new Date().toISOString().split('T')[0];
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n\n`;
  }

  // Add blog posts
  for (const post of posts) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${post.url}</loc>\n`;
    xml += `    <lastmod>${post.dateISO}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n\n`;
  }

  xml += `</urlset>\n`;

  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`✅ Generated sitemap.xml with ${staticPages.length + posts.length} URLs`);
}

// 3. Generate feed.xml (RSS 2.0)
function generateRSS() {
  const pubDate = new Date().toUTCString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>Digital Drift</title>\n`;
  xml += `    <link>${DOMAIN}</link>\n`;
  xml += `    <description>Backend, AI, and programming blogs by Dhiraj Roy.</description>\n`;
  xml += `    <language>en-us</language>\n`;
  xml += `    <pubDate>${pubDate}</pubDate>\n`;
  xml += `    <lastBuildDate>${pubDate}</lastBuildDate>\n`;
  xml += `    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />\n\n`;

  for (const post of posts) {
    const postDate = new Date(post.dateISO + 'T00:00:00').toUTCString();
    // Escape special characters in XML
    const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
        }
    });

    xml += `    <item>\n`;
    xml += `      <title>${escapeXml(post.title)}</title>\n`;
    xml += `      <link>${DOMAIN}${post.url}</link>\n`;
    xml += `      <guid>${DOMAIN}${post.url}</guid>\n`;
    xml += `      <pubDate>${postDate}</pubDate>\n`;
    xml += `      <description>${escapeXml(post.summary)}</description>\n`;
    // Add categories/tags
    if (post.tags && post.tags.length > 0) {
      for (const tag of post.tags) {
        xml += `      <category>${escapeXml(tag)}</category>\n`;
      }
    }
    xml += `    </item>\n\n`;
  }

  xml += `  </channel>\n`;
  xml += `</rss>\n`;

  const feedPath = path.join(__dirname, '../feed.xml');
  fs.writeFileSync(feedPath, xml, 'utf-8');
  console.log(`✅ Generated feed.xml (RSS) with ${posts.length} items`);
}

generateSitemap();
generateRSS();
