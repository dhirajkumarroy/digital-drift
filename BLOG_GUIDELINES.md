# Digital Drift — Complete Blog Creation & Engineering Guide 📚

This document is the official, comprehensive handbook for researching, writing, generating assets, registering, and publishing technical and **System Design** blog posts on **Digital Drift**. Follow this blueprint whenever creating a new article to ensure maximum technical depth, visual consistency, SEO ranking, and site performance.

---

## 📑 Table of Contents

1. [Architecture & Workflow Overview](#1-architecture--workflow-overview)
2. [Topic Selection & Series Progression](#2-topic-selection--series-progression)
3. [Banner Image Generation & Specs](#3-banner-image-generation--specs)
4. [Anatomy of a High-Performing Post](#4-anatomy-of-a-high-performing-post)
5. [Complete HTML Post Template](#5-complete-html-post-template)
6. [Registering the Post in `posts-data.js`](#6-registering-the-post-in-posts-datajs)
7. [Automated SEO & RSS Feeds](#7-automated-seo--rss-feeds)
8. [Local Testing & Verification](#8-local-testing--verification)
9. [Pre-Publish Quality Checklist](#9-pre-publish-quality-checklist)
10. [Git Workflow & Deployment](#10-git-workflow--deployment)

---

## 1. Architecture & Workflow Overview

Digital Drift is a lightning-fast, zero-build static site powered by vanilla HTML5, modern CSS3 (with custom properties), and vanilla JavaScript.

```text
                                  BLOG PUBLISHING LIFECYCLE
                                  
  +------------------+     +--------------------+     +------------------------+
  | 1. Topic & Plan  | --> | 2. Generate Banner | --> | 3. Author Post HTML    |
  | (Roadmap / Spec) |     | (16:9 /images/*.jpg|     | (/post/<slug>.html)    |
  +------------------+     +--------------------+     +------------------------+
                                                                   |
                                                                   v
  +------------------+     +--------------------+     +------------------------+
  | 6. Git Push      | <-- | 5. Local Preview   | <-- | 4. Register Post Data  |
  | (Deploy to Prod) |     | (scripts/serve.js) |     | (js/posts-data.js) &   |
  +------------------+     +--------------------+     | Rebuild SEO (feed/xml) |
                                                      +------------------------+
```

---

## 2. Topic Selection & Series Progression

### For System Design Articles
Digital Drift follows the **5-Phase System Design Roadmap** established in [`system-design-roadmap-beginner-to-advanced.html`](/post/system-design-roadmap-beginner-to-advanced):

1. **Phase 1: Foundations** — Networking, DNS, TCP/UDP, HTTP/HTTPS, Latency/Throughput, Load Balancing.
2. **Phase 2: Data & Storage** — Relational vs NoSQL, Indexing (B-Trees), Replication, Sharding, Caching (Redis), CAP Theorem.
3. **Phase 3: Distributed Systems** — Microservices, API Gateways, Message Queues (Kafka/RabbitMQ), Event-Driven Architecture, Idempotency.
4. **Phase 4: Reliability & Operations** — Rate Limiting, Circuit Breakers, Observability, Disaster Recovery, Multi-Region.
5. **Phase 5: Classic Interview Case Studies**:
   - ✅ **URL Shortener (TinyURL)** (`/post/system-design-url-shortener-tinyurl`)
   - 🔜 **Distributed API Rate Limiter** (Algorithms, Token Bucket, Sliding Window, Redis Cluster)
   - 🔜 **Scalable Notification Service** (Multi-channel SMS/Email/Push, Priority Queues, Rate limits)
   - 🔜 **Real-Time Chat System** (WebSockets, Connection Managers, Kafka, Cassandra)
   - 🔜 **Twitter/X News Feed** (Fan-out on write vs read, Timeline caching)
   - 🔜 **Distributed File Storage (Dropbox/Google Drive)** (Chunking, Deduplication, S3)
   - 🔜 **E-Commerce Flash Sale / Checkout** (Distributed locks, Inventory reservation, Idempotency)

### For Backend Engineering Articles
- Deep dives into **Java 21 / Spring Boot 3.x** (REST, Security, PostgreSQL, File I/O, WebFlux, Virtual Threads).
- Modern **Node.js / Express** (Authentication, JWT refresh tokens, RBAC, Streams).
- **DevOps & Containers** (Docker multi-stage builds, CI/CD pipelines, reverse proxies).

---

## 3. Banner Image Generation & Specs

Every blog post requires an eye-catching, modern, high-tech banner image saved directly into the `/images/` directory.

### Visual Style Requirements
- **Theme**: Clean dark tech aesthetic. Deep navy/slate background (`#0b0f19` to `#111827`) with glowing neon accents (cyan `#06b6d4`, electric purple `#8b5cf6`, or vibrant blue `#3b82f6`).
- **Art Style**: Isometric 3D vector illustration or crisp architectural schematic.
- **Composition**: Showcase distributed components (load balancers, servers, database clusters, caching tiers, message queues, and clean data flow arrows).
- **Text in Image**: **Avoid embedding text** in the generated image (text often renders distorted or blurry). Let the illustration convey the architecture visually.
- **Format & Aspect Ratio**:
  - Aspect Ratio: **16:9**
  - Resolution: **1376 × 768 px** (or 1280 × 720 px)
  - Format: **JPEG** (`.jpg`), optimized for web under 800 KB.
  - File Naming: `images/<slug>.jpg` (e.g., `images/system-design-rate-limiter.jpg`).

### Image Generation Prompt Formula
Use this prompt template when generating the image:
```text
A modern, premium, high-tech isometric 3D vector illustration for a system design blog post about [TOPIC / e.g. Designing a Distributed Rate Limiter]. Clean dark theme with deep navy background and glowing neon cyan, purple, and electric blue accents. Featuring distributed system architecture: [SPECIFIC COMPONENTS, e.g. an API Gateway, Token Bucket algorithm node, distributed Redis in-memory cache with glowing meters, and database nodes with clean packet flow streams]. Professional tech visual, crisp isometric digital art, no text, clean composition, 16:9 aspect ratio.
```

---

## 4. Anatomy of a High-Performing Post

Every HTML post in `/post/<slug>.html` must contain the following core structural blocks:

### 1. Document Head & Anti-FOUC Script
Prevents theme flashing before initial paint:
```html
<script>try{var __t=localStorage.getItem("theme"),__p=!window.matchMedia("(prefers-color-scheme: dark)").matches;if(__t==="light"||(!__t&&__p)){document.documentElement.classList.add("light");}}catch(e){}</script>
```

### 2. SEO & Open Graph Metadata
- **Title**: `<Primary Keyword> — <Outcome / Angle> | Digital Drift` (Under 65 characters)
- **Description**: Compelling summary containing primary and secondary keywords (140–160 characters).
- **Canonical URL**: `https://blog.dhirajroy.com/post/<slug>` (without `.html`).
- **OpenGraph & Twitter**: Points to `https://blog.dhirajroy.com/images/<slug>.jpg`.

### 3. Schema.org Structured Data
Always include both:
1. `Article`: Enhances search appearance with headline, author, dates, and banner image.
2. `FAQPage`: Powers Google's rich FAQ accordions with 3–4 high-value questions and answers.

### 4. Reading Progress & Post Banner
- `<div class="reading-progress" id="reading-progress"></div>`
- Banner image placed inside `.post-banner-wrapper`:
  ```html
  <div class="post-banner-wrapper">
    <img src="/images/<slug>.jpg" alt="<Full Title>" class="post-banner-img" />
  </div>
  ```

### 5. Standard Article Sections (The 10-Point Technical Blueprint)
To guarantee depth and authority, every technical post should cover:
1. **Introduction & Real-World Context**: Why this system/problem matters.
2. **Requirements Definition**: Clear Functional vs. Non-Functional breakdown.
3. **Back-of-the-Envelope Estimation**: Mathematical sizing for QPS, storage, memory/cache, and bandwidth.
4. **API Interface & Protocols**: REST endpoints, payloads, HTTP status codes, and redirect semantics.
5. **Core Algorithms & Data Structures**: Hashing, encoding, state machines, or token buckets.
6. **Data Storage & Database Schema**: SQL vs NoSQL trade-offs, schemas, indexes, partition keys.
7. **High-Level Architecture**: ASCII architecture diagram and end-to-end request flows.
8. **Distributed Caching & Eviction**: Cache patterns (Cache-Aside, Write-Through), eviction (LRU), stampede protection.
9. **Reliability, Scalability & Operations**: Sharding, replication, failover, rate limiting, and observability.
10. **Interview Defense / Trade-Off Matrix**: Summary comparison table and answers to common follow-up questions.

---

## 5. Complete HTML Post Template

Save new posts as `/post/<slug>.html`. Use this boilerplate:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Prevent dark/light theme flash — runs before any paint -->
  <script>try{var __t=localStorage.getItem("theme"),__p=!window.matchMedia("(prefers-color-scheme: dark)").matches;if(__t==="light"||(!__t&&__p)){document.documentElement.classList.add("light");}}catch(e){}</script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Title Goes Here | Digital Drift</title>
  <meta name="description" content="150-160 character description rich with keywords." />
  <meta name="keywords" content="Keyword1, Keyword2, System Design, Backend" />
  <meta name="author" content="Dhiraj Roy" />
  <link rel="canonical" href="https://blog.dhirajroy.com/post/your-post-slug" />

  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

  <!-- Open Graph -->
  <meta property="og:title" content="Title Goes Here" />
  <meta property="og:description" content="150-160 character description rich with keywords." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://blog.dhirajroy.com/post/your-post-slug" />
  <meta property="og:image" content="https://blog.dhirajroy.com/images/your-post-slug.jpg" />
  <meta property="og:site_name" content="Digital Drift" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Title Goes Here" />
  <meta name="twitter:description" content="150-160 character description rich with keywords." />
  <meta name="twitter:image" content="https://blog.dhirajroy.com/images/your-post-slug.jpg" />

  <!-- Structured Data (Article) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Title Goes Here",
    "image": "https://blog.dhirajroy.com/images/your-post-slug.jpg",
    "description": "150-160 character description rich with keywords.",
    "author": { "@type": "Person", "name": "Dhiraj Roy" },
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD",
    "url": "https://blog.dhirajroy.com/post/your-post-slug",
    "keywords": ["Keyword1", "Keyword2", "System Design", "Backend"],
    "publisher": {
      "@type": "Organization",
      "name": "Digital Drift",
      "logo": { "@type": "ImageObject", "url": "https://blog.dhirajroy.com/apple-touch-icon.png" }
    }
  }
  </script>

  <!-- Structured Data (FAQ) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Primary technical question?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Clear, concise, authoritative answer."
        }
      }
    ]
  }
  </script>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VN488V6MP5"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-VN488V6MP5');
  </script>

  <!-- CSS -->
  <link rel="stylesheet" href="/css/style.css?v=5" />

  <!-- RSS Feed -->
  <link rel="alternate" type="application/rss+xml" title="Digital Drift RSS Feed" href="/feed.xml" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8526944296509002" crossorigin="anonymous"></script>
</head>
<body>
  <!-- Reading progress bar -->
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
    </nav>

    <!-- Main Article -->
    <main role="main">
      <article class="blog-post">
        <!-- Tags -->
        <div class="tags">
          <span class="tag" data-tag="System Design">System Design</span>
          <span class="tag" data-tag="Architecture">Architecture</span>
          <span class="tag" data-tag="Backend">Backend</span>
        </div>

        <!-- Title -->
        <h1 class="post-title">Your Full Title Here</h1>

        <!-- Meta -->
        <div class="post-meta">
          <span>📅 Sep 21, 2026</span>
          <span>⏱ 15 min read</span>
          <span>✍ Dhiraj Roy</span>
        </div>

        <!-- Post Banner Image -->
        <div class="post-banner-wrapper">
          <img src="/images/your-post-slug.jpg" alt="Your Full Title Here" class="post-banner-img" />
        </div>

        <!-- Post Content -->
        <div class="post-content">
          <p>Compelling introductory paragraph explaining the motivation, context, and what the reader will master...</p>

          <!-- Table of Contents -->
          <div style="background: var(--color-card); padding: 1.5rem; border-radius: var(--radius); margin: 2rem 0; border: 1px solid var(--color-border);">
            <strong>Table of Contents</strong>
            <ul style="margin-top: 1rem; columns: 2; -webkit-columns: 2; -moz-columns: 2; line-height: 1.8;">
              <li><a href="#section-1">1. Section One</a></li>
              <li><a href="#section-2">2. Section Two</a></li>
              <li><a href="#faq">3. Frequently Asked Questions</a></li>
              <li><a href="#conclusion">4. Conclusion</a></li>
            </ul>
          </div>

          <h2 id="section-1">1. Section One</h2>
          <p>Detailed technical content with code blocks, tables, and diagrams...</p>

          <h2 id="faq">3. Frequently Asked Questions</h2>
          <p><strong>Question?</strong><br />Answer...</p>

          <h2 id="conclusion">4. Conclusion</h2>
          <p>Wrap-up and links to related articles...</p>
        </div>
      </article>
    </main>

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
              <li><a href="/#popular-categories" data-tag="Architecture">Architecture</a></li>
              <li><a href="/#popular-categories" data-tag="Backend">Backend</a></li>
              <li><a href="/#popular-categories" data-tag="Java">Java</a></li>
              <li><a href="/#popular-categories" data-tag="Node.js">Node.js</a></li>
            </ul>
          </div>

          <!-- Col 4: Connect With Me -->
          <div class="footer-col">
            <h4 class="footer-col-title">Connect With Me</h4>
            <div class="footer-social-icons">
              <a href="https://github.com/dhirajkumarroy" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="/feed.xml" target="_blank" rel="noopener" aria-label="RSS Feed"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg></a>
            </div>
          </div>

          <!-- Col 5: Quote Box -->
          <div class="footer-col footer-quote-col">
            <blockquote class="footer-quote">
              <p class="quote-text">"Small steps in the right direction lead to big results."</p>
              <cite class="quote-author">— Digital Drift</cite>
            </blockquote>
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
    </footer>
  </div>

  <button class="back-to-top" id="back-to-top" aria-label="Back to top">↑</button>
  <script src="/js/posts-data.js?v=5"></script>
  <script src="/js/script.js?v=6"></script>
</body>
</html>
```

---

## 6. Registering the Post in `posts-data.js`

Open [`js/posts-data.js`](/js/posts-data.js). Paste the new post object at the **very top** of the `BLOG_POSTS` array:

```javascript
  {
    id: 22,                                           // Increment highest ID by 1
    slug: "your-post-slug",                           // URL-safe slug matching HTML filename
    title: "Full Display Title for Cards",            // Display title on cards
    summary: "1-2 sentence excerpt under 160 chars.", // Card summary / SEO excerpt
    date: "Sep 25, 2026",                             // Human readable date
    dateISO: "2026-09-25",                            // YYYY-MM-DD for sorting & sitemap
    url: "/post/your-post-slug",                      // Clean URL path without .html
    image: "/images/your-post-slug.jpg",              // Path to banner image
    tags: ["System Design", "Architecture", "Backend"],// 2-3 relevant tags
    readTime: 16,                                     // Read time in minutes
    featured: false                                   // true = Hero card (only ONE post)
  },
```

### Field Requirements
- `id`: Must be an integer strictly greater than the previous top post.
- `url`: Must be clean (e.g., `/post/system-design-url-shortener-tinyurl` without `.html`).
- `tags`: Keep consistent with existing categories (`System Design`, `Architecture`, `Backend`, `Java`, `Spring Boot`, `Node.js`, `Security`, `DevOps`).

---

## 7. Automated SEO & RSS Feeds

Every time a post is added to `posts-data.js`, run the automated SEO build script from the project root:

```bash
node scripts/build-seo.js
```

### What this script does:
1. Parses `js/posts-data.js`.
2. Generates [`sitemap.xml`](/sitemap.xml) with static pages and all blog post URLs (priority `0.9`, last modified date).
3. Generates [`feed.xml`](/feed.xml) with standard RSS 2.0 channels and XML-escaped descriptions.

---

## 8. Local Testing & Verification

Digital Drift includes a built-in preview server with clean URL resolution:

```bash
# Start local preview server
node scripts/serve.js
```

Then visit:
- **Homepage**: `http://localhost:3456/` — Confirm the new post appears as the latest card with thumbnail, title, read time, and tags.
- **Article Page**: `http://localhost:3456/post/your-post-slug` — Confirm the banner image, table of contents, code snippets, and footer render properly.
- **Archive Page**: `http://localhost:3456/archive` — Confirm the article appears under the current year and category filter.

---

## 9. Pre-Publish Quality Checklist

Before committing and deploying, verify:

- [ ] **SEO**: Title has primary keyword; meta description is 140–160 chars.
- [ ] **Structured Data**: Schema `Article` and `FAQPage` JSON-LD are syntactically valid JSON.
- [ ] **Banner Image**: 16:9 JPEG saved in `/images/` and loads properly on both light and dark themes.
- [ ] **Clean URLs**: Canonical link and `url` in `posts-data.js` do NOT end in `.html`.
- [ ] **Theme Switching**: Tested light mode and dark mode; text contrast and code blocks look clean.
- [ ] **SEO Scripts**: `node scripts/build-seo.js` ran without errors.
- [ ] **Posts Data Syntax**: Verified array syntax using `node -e "eval(require('fs').readFileSync('js/posts-data.js','utf8'))"`.

---

## 10. Git Workflow & Deployment

Once all checklist items pass, commit and deploy to production:

```bash
# 1. Check status
git status

# 2. Stage all updated and new files
git add -A

# 3. Commit with a descriptive conventional message
git commit -m "Add [Topic] complete architecture guide and banner image"

# 4. Push to production
git push origin main
```

Cloudflare Pages / Netlify will automatically detect the push and deploy your new blog post globally within seconds! 🚀
