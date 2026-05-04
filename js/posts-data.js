/**
 * ============================================================
 *  Digital Drift — Post Registry  v3
 * ============================================================
 *
 *  HOW TO ADD A NEW POST (3 steps)
 *  ────────────────────────────────
 *  1. Open  /admin/  in your browser → fill the form → click Generate.
 *  2. Copy the generated HTML → save as  /post/<slug>.html
 *  3. Copy the generated entry below → paste at the TOP of BLOG_POSTS.
 *  That's it — both index and archive update automatically.
 *
 *  Field Reference
 *  ───────────────
 *  id        unique integer — just increment the last one by 1
 *  slug      URL-safe filename without .html  (e.g. "spring-boot-intro")
 *  title     full display title shown on cards
 *  summary   one-sentence excerpt (≤ 160 chars)
 *  date      human-readable  (e.g. "Apr 15, 2026")
 *  dateISO   YYYY-MM-DD — used for sorting & schema.org
 *  url       absolute path to the post file
 *  tags      array of tag strings (keep short, reuse existing tags when possible)
 *  readTime  estimated reading time in minutes (words ÷ 200 is a good estimate)
 *  featured  true → shown as hero card on homepage  (only ONE post at a time)
 */

const BLOG_POSTS = [
  /* ── ADD NEW POSTS AT THE TOP ─────────────────────────────── */

  {
    id: 9,
    slug: "what-is-backend",
    title: "What is Backend Development? The Complete Beginner's Guide",
    summary: "Understand what backend development really is — servers, APIs, databases, authentication, and how all the pieces fit together to power every app you use.",
    date: "Apr 24, 2026",
    dateISO: "2026-04-24",
    url: "/post/what-is-backend",
    tags: ["Backend", "Education", "Roadmap"],
    readTime: 12,
    featured: true
  },
  {
    id: 8,
    slug: "nodejs-backend-development-production-api",
    title: "Node.js Backend Development (2026) – Build a Production-Ready REST API",
    summary: "Learn Node.js backend development from scratch. Master Express.js, async programming, and build a production-ready REST API. Complete 2026 developer guide.",
    date: "Apr 24, 2026",
    dateISO: "2026-04-24",
    url: "/post/nodejs-backend-development-production-api.html",
    tags: ["Node.js backend", "Tech", "Programming"],
    readTime: 20,
    featured: false
  },
  {
    id: 7,
    slug: "docker-complete-guide",
    title: "Docker Complete Guide: From Zero to Production Containers",
    summary: "Master Docker end-to-end — containers vs VMs, Dockerfiles, volumes, networking, Docker Compose, multi-stage builds, and production best practices.",
    date: "Apr 22, 2026",
    dateISO: "2026-04-22",
    url: "/post/docker-complete-guide",
    tags: ["Backend", "Tech", "Productivity"],
    readTime: 16,
    featured: false
  },
  {
    id: 6,
    slug: "git-and-github-complete-guide",
    title: "Git & GitHub Complete Guide: From Zero to Production Workflow",
    summary: "Master Git and GitHub end-to-end — version control fundamentals, essential commands, branching strategies, pull requests, and CI/CD workflows used in real teams.",
    date: "Apr 22, 2026",
    dateISO: "2026-04-22",
    url: "/post/git-and-github-complete-guide",
    tags: ["Backend", "Tech", "Productivity"],
    readTime: 14,
    featured: false
  },
  {
    id: 5,
    slug: "spring-boot-getting-started",
    title: "Getting Started with Spring Boot: Build Your First REST API",
    summary: "A hands-on guide to Spring Boot — project setup, key annotations, controllers, and a working REST API in under 30 minutes.",
    date: "Apr 15, 2026",
    dateISO: "2026-04-15",
    url: "/post/spring-boot-getting-started",
    tags: ["Java", "Spring Boot", "Backend"],
    readTime: 7,
    featured: false
  }
];
