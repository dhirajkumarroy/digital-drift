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
    id: 5,
    slug: "spring-boot-getting-started",
    title: "Getting Started with Spring Boot: Build Your First REST API",
    summary: "A hands-on guide to Spring Boot — project setup, key annotations, controllers, and a working REST API in under 30 minutes.",
    date: "Apr 15, 2026",
    dateISO: "2026-04-15",
    url: "/post/spring-boot-getting-started.html",
    tags: ["Java", "Spring Boot", "Backend"],
    readTime: 7,
    featured: false
  },
  {
    id: 4,
    slug: "python-roadmap",
    title: "Python Learning Roadmap",
    summary: "A step-by-step roadmap that helps learners move from Python basics to advanced concepts and real-world projects.",
    date: "Apr 2, 2026",
    dateISO: "2026-04-02",
    url: "/post/python-roadmap.html",
    tags: ["Programming", "Python", "Roadmap"],
    readTime: 10,
    featured: true
  },
  {
    id: 3,
    slug: "how-gpt-5-is-helpful-for-college-students",
    title: "5 Ways GPT-5 Helps College Students & Professionals",
    summary: "A practical look at how GPT-5 can help with learning, research, productivity, and career development.",
    date: "Aug 9, 2025",
    dateISO: "2025-08-09",
    url: "/post/how-gpt-5-is-helpful-for-college-students.html",
    tags: ["AI", "Education", "Productivity"],
    readTime: 6,
    featured: false
  },
  {
    id: 2,
    slug: "chatGpt5",
    title: "ChatGPT-5: What to Expect from OpenAI's Next Breakthrough",
    summary: "A deep dive into the rumoured capabilities and real-world implications of ChatGPT-5 for developers and everyday users.",
    date: "Aug 6, 2025",
    dateISO: "2025-08-06",
    url: "/post/chatGpt5.html",
    tags: ["AI", "Tech"],
    readTime: 5,
    featured: false
  },
  {
    id: 1,
    slug: "python",
    title: "Python Programming: A Complete Beginner's Guide",
    summary: "A beginner-friendly introduction to Python covering the basics, project ideas, and career directions.",
    date: "Aug 4, 2025",
    dateISO: "2025-08-04",
    url: "/post/python.html",
    tags: ["Programming", "Python"],
    readTime: 8,
    featured: false
  }
];
