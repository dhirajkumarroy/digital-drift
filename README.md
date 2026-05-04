# Digital Drift 🚀

Digital Drift is a lightning-fast, static tech blog focused on Backend Engineering, AI, and Programming. Built entirely with vanilla HTML, CSS, and JavaScript, it guarantees maximum performance, exceptional SEO, and zero build-step overhead.

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

1. **Write the Post**: Open `admin/index.html` in your browser. Fill in the metadata, write your content using the block builder, and click **Generate Output**.
2. **Save the HTML**: Copy the generated "Post HTML" from the admin panel and save it as a new file in the `/post/` directory (e.g., `/post/my-new-article.html`).
3. **Register the Post**: Copy the generated "Registry Entry" from the admin panel and paste it at the *very top* of the `BLOG_POSTS` array inside `js/posts-data.js`.
4. **Update SEO & RSS**: Open your terminal in the project root and run:
   ```bash
   node scripts/build-seo.js
   ```
   This will automatically rebuild your `sitemap.xml` and `feed.xml` to include your new post.

## 🚀 Running Locally

Because the project is purely static, you can use any basic HTTP server to run the site locally.

If you have Node.js installed, you can use `npx`:
```bash
npx serve .
```

Alternatively, if you use Python:
```bash
# Python 3
python -m http.server 3000
```

Then visit `http://localhost:3000` in your browser.

## 👨‍💻 Author

Built and maintained by **Dhiraj Roy**
- GitHub: [@dhirajkumarroy](https://github.com/dhirajkumarroy)
- Blog: [https://blog.dhirajroy.com](https://blog.dhirajroy.com)
