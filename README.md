# Digital Drift 🚀

Digital Drift is a lightning-fast, static tech blog focused on Backend Engineering, AI, and Programming. Built entirely with vanilla HTML, CSS, and JavaScript, it serves static pages with a small publishing script for article listings, routes, and SEO files.

The blog features a custom-built local Admin Dashboard to generate new posts and automated Node.js scripts for production-ready SEO.

## ✨ Features

- **Blazing Fast**: Pure static HTML/CSS/JS with zero framework overhead.
- **Dark/Light Mode**: First-class theme support with no flash-of-unstyled-content (FOUC).
- **Custom Local CMS**: A built-in `/admin` interface to write, preview, and generate static HTML for new posts.
- **Production SEO**: Automated scripts to generate XML Sitemaps and RSS 2.0 Feeds.
- **Rich Metadata**: Comprehensive OpenGraph, Twitter Cards, and Schema.org JSON-LD structured data on all pages.
- **Fully Responsive**: A modern, clean reading experience on all devices.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Custom Properties/Variables), Vanilla JavaScript
- **SEO/Automation**: Node.js (for sitemap and RSS generation)
- **Analytics**: Google Analytics (gtag.js)

## 📂 Project Structure

```text
digital-drift/
├── index.html           # Homepage displaying latest featured posts
├── about.html           # About the author
├── contact.html         # Contact form/info
├── archive.html         # Full searchable history of all posts
├── admin/               
│   └── index.html       # Local Admin Dashboard for writing posts
├── css/
│   └── style.css        # Global stylesheet (variables, components, utilities)
├── js/
│   ├── script.js        # Core logic (theme toggle, search, pagination)
│   └── posts-data.js    # The "Database" - JSON array of all active posts
├── post/                
│   ├── _template.html   # Base template for manual post creation
│   └── *.html           # Individual generated blog posts
├── scripts/
│   └── build-seo.js     # Node.js script to auto-generate sitemap.xml & feed.xml
├── sitemap.xml          # Auto-generated XML sitemap
└── feed.xml             # Auto-generated RSS 2.0 feed
```

## 📝 How to Publish a New Post

Publishing new content is simple and requires no backend servers or databases.

> 📖 **Comprehensive Guide**: For the complete, end-to-end technical standard (System Design roadmap, banner image generation prompts, 10-point technical article blueprint, HTML boilerplate, and quality checklist), see **[BLOG_GUIDELINES.md](BLOG_GUIDELINES.md)**.

### Quick Workflow:
1. **Write the Post**: Copy the template from `BLOG_GUIDELINES.md` or use `admin/index.html`.
2. **Save the HTML**: Save as `/post/<slug>.html`.
3. **Add Banner Image**: Place 16:9 image in `/images/<slug>.jpg`.
4. **Register the Post**: Add entry at the top of `BLOG_POSTS` in `js/posts-data.js`.
5. **Update SEO & RSS**:
   ```bash
   node scripts/build-seo.js
   python3 scripts/check-site.py
   ```
   This rebuilds the static homepage and archive listings, clean URL routes, `sitemap.xml`, and `feed.xml`. Run it after every registry change and commit the generated files so articles remain visible without JavaScript.
6. **Preview & Deploy**:
   ```bash
   node scripts/serve.js
   git add -A && git commit -m "Add new post" && git push origin main
   ```

## 🚀 Running Locally

Use the bundled preview server so clean URLs, canonical redirects, response headers, and missing-page status codes match the hosting configuration:

```bash
node scripts/build-seo.js
python3 scripts/check-site.py
node scripts/serve.js
```

Visit `http://localhost:3456`. The preview server binds to localhost. Set `PORT` to use another port. It supports the clean article URLs used by this site.

Run the build after editing the post registry and commit its generated files. The homepage includes six initial cards and a featured article; the archive includes every post in static HTML. JavaScript adds searching, filtering, and pagination.

Subscriptions currently use RSS. The contact form opens an email draft; users send it from their email app. See [AUDIT.md](AUDIT.md) for findings, validation, and remaining deployment/content work.

Optional browser checks require Google Chrome and development-only audit tools. With the preview server running, install those tools outside the site and run:

```bash
npm install --prefix /tmp/digital-drift-audit playwright@1.63.0 @axe-core/playwright@4.13.0
NODE_PATH=/tmp/digital-drift-audit/node_modules node scripts/check-browser.cjs
```

The browser check blocks external requests, tests five viewport widths and both themes, and writes JSON results and screenshots to the system temporary directory under `digital-drift-audit`. It does not measure production Core Web Vitals.

## 👨‍💻 Author

Built and maintained by **Dhiraj Roy**
- GitHub: [@dhirajkumarroy](https://github.com/dhirajkumarroy)
- Blog: [https://blog.dhirajroy.com](https://blog.dhirajroy.com)

## Validation

Run `node scripts/check.js` to check generated listings, category filtering, and preview routes. Run `node scripts/build-seo.js` before publishing.

Category definitions, icons, and tag aliases live in `js/categories.js`. Add accurate tags to `js/posts-data.js`; the build refreshes category links and filters across all pages and templates. Categories without published articles stay out of the menu. Menus and filters show icons and labels without article counts.

Run `node scripts/check-categories.cjs` for category navigation checks in headless Chrome (no npm dependencies). It starts its own local preview server and checks desktop, mobile, keyboard, filtering, and navigation without JavaScript. Set `CHROME_PATH` if Chrome is installed in a nonstandard location.

The homepage workspace is assembled from `components/hero-workspace.html`, `css/hero-workspace.css`, and `js/hero-workspace.js`. Run `node scripts/build-seo.js` after changing its HTML component to refresh the static homepage. Topic buttons select examples and real tutorial links; response previews are illustrative, and Copy copies the displayed code. Browser checks also cover this component at four screen sizes, both themes, and without JavaScript.
