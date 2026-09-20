const fs = require('fs');
const path = require('path');

const postDir = path.join(__dirname, '..', 'post');

const NEW_HEADER = `  <!-- Reading progress bar -->
  <div class="reading-progress" id="reading-progress"></div>

  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header-inner">
        <!-- Brand Logo -->
        <a href="/" class="brand-logo" aria-label="Digital Drift Home">
          <div class="logo-mark">D</div>
          <div class="logo-text-group">
            <span class="logo-title">Digital Drift</span>
            <span class="logo-tagline">Code · Learn · Build · Grow</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-desktop" aria-label="Main Navigation">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <div class="nav-dropdown-item">
            <a href="/#popular-categories">Categories <span class="nav-chevron">⌄</span></a>
          </div>
          <a href="/contact">Contact</a>
          <a href="/archive">Archive</a>
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <button id="theme-toggle" class="theme-toggle" aria-label="Switch theme" title="Toggle theme">
            <svg id="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg id="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.394 2.594a1 1 0 01.707 1.414l-1 1a1 1 0 01-1.414-1.414l1-1a1 1 0 011.414 0zm3.33 5.5a1 1 0 010 2h-1a1 1 0 110-2h1zm-4.394 4.394a1 1 0 01-1.414 1.414l-1-1a1 1 0 011.414-1.414l1 1a1 1 0 010 1.414zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.606 15.406a1 1 0 01-1.414-1.414l1-1a1 1 0 111.414 1.414l-1 1zM2 11a1 1 0 010-2h1a1 1 0 110 2H2zm4.394-4.394a1 1 0 011.414-1.414l1 1a1 1 0 11-1.414 1.414l-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <a href="/#newsletter-section" id="header-subscribe-btn" class="btn-subscribe">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Subscribe
          </a>
          <button id="mobile-menu-btn" class="mobile-menu-toggle" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Mobile Navigation Drawer -->
    <nav id="mobile-menu" class="nav-mobile" aria-label="Mobile navigation">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/#popular-categories">Categories</a>
      <a href="/contact">Contact</a>
      <a href="/archive">Archive</a>
      <a href="/#newsletter-section" class="mobile-subscribe-link">✉ Subscribe to Digest</a>
    </nav>`;

const NEW_FOOTER = `  </div><!-- /.container -->

  <!-- Multi-Column Footer -->
  <footer class="footer-v2">
    <div class="container">
      <div class="footer-top-grid">
        <!-- Col 1: Brand Logo -->
        <div class="footer-col footer-brand-col">
          <a href="/" class="brand-logo" aria-label="Digital Drift Home">
            <div class="logo-mark">D</div>
            <div class="logo-text-group">
              <span class="logo-title">Digital Drift</span>
              <span class="logo-tagline">Code · Learn · Build · Grow</span>
            </div>
          </a>
        </div>

        <!-- Col 2: Quick Links -->
        <div class="footer-col">
          <h4 class="footer-col-title">Quick Links</h4>
          <ul class="footer-link-list">
            <li><a href="/">Home</a></li>
            <li><a href="/#popular-categories">Categories</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/archive">Archive</a></li>
          </ul>
        </div>

        <!-- Col 3: Categories -->
        <div class="footer-col">
          <h4 class="footer-col-title">Categories</h4>
          <ul class="footer-link-list">
            <li><a href="/?category=System%20Design#articles-section" data-tag="System Design">System Design</a></li>
            <li><a href="/#popular-categories" data-tag="Backend">Backend</a></li>
            <li><a href="/#popular-categories" data-tag="Frontend">Frontend</a></li>
            <li><a href="/#popular-categories" data-tag="JavaScript">JavaScript</a></li>
            <li><a href="/#popular-categories" data-tag="DevOps">DevOps</a></li>
            <li><a href="/#popular-categories" data-tag="Database">Database</a></li>
          </ul>
        </div>

        <!-- Col 4: Connect With Me -->
        <div class="footer-col">
          <h4 class="footer-col-title">Connect With Me</h4>
          <div class="footer-social-icons">
            <a href="https://github.com/dhirajkumarroy" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="/feed.xml" target="_blank" rel="noopener" aria-label="RSS Feed">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
            </a>
          </div>
        </div>

        <!-- Col 5: Quote Box -->
        <div class="footer-col footer-quote-col">
          <blockquote class="footer-quote-text">
            "Small steps in the right direction lead to big results."
          </blockquote>
          <span class="footer-quote-author">— Digital Drift</span>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <p class="footer-copyright">&copy; <span id="current-year">2026</span> Digital Drift. All rights reserved.</p>
        <div class="footer-legal-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/contact">Terms of Service</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </div>
  </footer>`;

const files = fs.readdirSync(postDir).filter(f => f.endsWith('.html'));

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(postDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update css and js versions
  content = content.replace(/style\.css\?v=\d+/g, 'style.css?v=5');
  content = content.replace(/posts-data\.js\?v=\d+/g, 'posts-data.js?v=5');
  content = content.replace(/script\.js\?v=\d+/g, 'script.js?v=6');

  // 2. Replace header block
  // From <div class="reading-progress" id="reading-progress"></div> ... <main role="main">
  const headerRegex = /<div class="reading-progress" id="reading-progress"><\/div>[\s\S]*?<main role="main">/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, `${NEW_HEADER}\n\n    <!-- Main Article -->\n    <main role="main">`);
  }

  // 3. Replace footer block
  // From </main> ... </div><!-- \/\.container -->
  const footerRegex = /<\/main>[\s\S]*?<\/footer>[\s\S]*?<\/div><!-- \/\.container -->/;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, `</main>\n${NEW_FOOTER}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
}

console.log(`Successfully updated ${updatedCount} post files with modern header and 5-column footer!`);
