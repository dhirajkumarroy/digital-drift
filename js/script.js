(function () {
  'use strict';

  /* ============================================================
     Digital Drift — script.js  v3
     Depends on: /js/posts-data.js  (BLOG_POSTS array)
     ============================================================ */

  // ── CONFIG ────────────────────────────────────────────────
  const POSTS_PER_PAGE = 6;

  // ── STATE ─────────────────────────────────────────────────
  let currentPage  = 0;
  let activeTag    = null;
  let searchQuery  = '';

  // ── DOM REFS ──────────────────────────────────────────────
  const postsContainer = document.getElementById('blog-posts-container');
  const loadMoreBtn    = document.getElementById('load-more-btn');
  const tagFilterBar   = document.getElementById('tag-filter-bar');
  const searchInput    = document.getElementById('search-input');
  const searchClear    = document.getElementById('search-clear');
  const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu     = document.getElementById('mobile-menu');
  const themeToggle    = document.getElementById('theme-toggle');
  const moonIcon       = document.getElementById('moon-icon');
  const sunIcon        = document.getElementById('sun-icon');
  const backToTop      = document.getElementById('back-to-top');
  const progressBar    = document.getElementById('reading-progress');
  const featuredEl     = document.getElementById('featured-post');
  const statsBarEl     = document.getElementById('stats-bar');

  // ── HELPERS ───────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function formatReadTime(min) {
    return min + ' min read';
  }

  function getTagHtml(tag) {
    return `<span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ── POST FILTERING ────────────────────────────────────────
  function getFilteredPosts() {
    let filtered = [...BLOG_POSTS];
    if (activeTag) {
      filtered = filtered.filter(p => p.tags.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }

  // ── RENDER FEATURED POST ──────────────────────────────────
  function renderFeatured() {
    if (!featuredEl) return;
    const featured = BLOG_POSTS.find(p => p.featured);
    if (!featured) { featuredEl.style.display = 'none'; return; }

    featuredEl.innerHTML = `
      <div class="featured-section-label">Featured Post</div>
      <article class="featured-card fade-in-section">
        <div class="featured-badge">★ Featured</div>
        <div class="card-tags">${featured.tags.map(getTagHtml).join('')}</div>
        <h2 class="card-title">
          <a href="${escapeHtml(featured.url)}">${escapeHtml(featured.title)}</a>
        </h2>
        <p class="card-summary">${escapeHtml(featured.summary)}</p>
        <div class="card-meta">
          <span>📅 ${escapeHtml(featured.date)}</span>
          <span>⏱ ${formatReadTime(featured.readTime)}</span>
        </div>
        <a href="${escapeHtml(featured.url)}" class="card-link btn-primary" style="text-decoration:none;padding:0.6rem 1.5rem;">
          Read Article →
        </a>
      </article>
    `;
  }

  // ── RENDER STATS BAR ──────────────────────────────────────
  function renderStats() {
    if (!statsBarEl) return;
    const allTags = new Set(BLOG_POSTS.flatMap(p => p.tags));
    statsBarEl.innerHTML = `
      <div class="stat-item"><strong>${BLOG_POSTS.length}</strong> Posts Published</div>
      <div class="stat-item"><strong>${allTags.size}</strong> Topics</div>
      <div class="stat-item"><strong>${BLOG_POSTS.reduce((s, p) => s + p.readTime, 0)}</strong> Min of Reading</div>
    `;
  }

  // ── RENDER POST CARDS ─────────────────────────────────────
  async function renderPosts(append = false) {
    if (!postsContainer) return;

    if (!append) {
      postsContainer.innerHTML = '<div class="skeleton-grid">' +
        Array(3).fill(`
          <div class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium" style="height:1.1rem;margin-top:.5rem"></div>
            <div class="skeleton-line" style="width:55%;margin-top:.25rem"></div>
            <div class="skeleton-line tall" style="margin-top:.75rem"></div>
            <div class="skeleton-line short" style="margin-top:.75rem"></div>
          </div>`).join('') +
        '</div>';
    }

    if (loadMoreBtn) loadMoreBtn.classList.add('loading');

    await new Promise(resolve => setTimeout(resolve, 250));

    const filtered    = getFilteredPosts();
    const end         = POSTS_PER_PAGE * (currentPage + 1);

    if (!append) postsContainer.innerHTML = '';

    if (filtered.length === 0) {
      postsContainer.innerHTML = '<div class="no-results">No posts found. Try a different search or tag.</div>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      if (loadMoreBtn) loadMoreBtn.classList.remove('loading');
      return;
    }

    const startIndex = append ? POSTS_PER_PAGE * currentPage : 0;
    const newPosts   = filtered.slice(startIndex, end);

    newPosts.forEach((post, i) => {
      const card = document.createElement('article');
      card.className = 'blog-card';
      card.style.animationDelay = `${i * 60}ms`;
      card.innerHTML = `
        <div class="card-tags">${post.tags.map(getTagHtml).join('')}</div>
        <h3 class="card-title">
          <a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>
        </h3>
        <div class="card-meta">
          <span>📅 ${escapeHtml(post.date)}</span>
          <span class="read-time-badge">⏱ ${formatReadTime(post.readTime)}</span>
        </div>
        <p class="card-summary">${escapeHtml(post.summary)}</p>
        <a href="${escapeHtml(post.url)}" class="card-link">
          Read More
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clip-rule="evenodd"/>
          </svg>
        </a>
      `;
      // Staggered fade-in
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add('fade-in'), i * 60);
      });
      postsContainer.appendChild(card);
    });

    if (loadMoreBtn) {
      const hasMore = end < filtered.length;
      loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
      loadMoreBtn.classList.remove('loading');
    }
  }

  // ── FILTER BAR ────────────────────────────────────────────
  function buildFilterBar() {
    if (!tagFilterBar) return;
    const allTags   = new Set(BLOG_POSTS.flatMap(p => p.tags));
    const sortedTags = ['All', ...Array.from(allTags).sort()];

    tagFilterBar.innerHTML = '';
    sortedTags.forEach(tag => {
      const a       = document.createElement('a');
      a.href        = '#';
      a.textContent = tag;
      a.dataset.tag = tag === 'All' ? 'all' : tag;
      if (tag === 'All') a.classList.add('active');
      a.addEventListener('click', e => {
        e.preventDefault();
        activeTag    = tag === 'All' ? null : tag;
        currentPage  = 0;
        renderPosts(false);
        document.querySelectorAll('.filter-bar a').forEach(l => l.classList.remove('active'));
        a.classList.add('active');
      });
      tagFilterBar.appendChild(a);
    });
  }

  // ── SEARCH ────────────────────────────────────────────────
  const onSearchInput = debounce(function () {
    searchQuery = searchInput ? searchInput.value : '';
    currentPage = 0;
    renderPosts(false);
    if (searchClear) searchClear.classList.toggle('visible', searchQuery.length > 0);
  }, 280);

  // ── THEME ─────────────────────────────────────────────────
  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    if (moonIcon) moonIcon.style.display = isLight ? 'block' : 'none';
    if (sunIcon)  sunIcon.style.display  = isLight ? 'none'  : 'block';
  }

  function initTheme() {
    const saved     = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved === 'light' || (!saved && !prefersDark));
  }

  function toggleTheme() {
    const isLight = !document.body.classList.contains('light');
    applyTheme(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }

  // ── MOBILE MENU ───────────────────────────────────────────
  function toggleMobileMenu() {
    if (mobileMenu) mobileMenu.classList.toggle('active');
  }

  document.addEventListener('click', e => {
    if (
      mobileMenu && mobileMenu.classList.contains('active') &&
      !mobileMenu.contains(e.target) &&
      mobileMenuBtn && !mobileMenuBtn.contains(e.target)
    ) {
      mobileMenu.classList.remove('active');
    }
  });

  // ── BACK TO TOP ───────────────────────────────────────────
  function initBackToTop() {
    if (!backToTop) return;
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── READING PROGRESS (homepage scroll indicator) ──────────
  function initReadingProgress() {
    if (!progressBar) return;
    window.addEventListener('scroll', () => {
      const doc    = document.documentElement;
      const scroll = doc.scrollTop  || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = height > 0 ? (scroll / height * 100) + '%' : '0%';
      if (backToTop) backToTop.classList.toggle('visible', scroll > 400);
    }, { passive: true });
  }

  // ── INTERSECTION OBSERVER (fade-in sections) ─────────────
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
  }

  // ── KEYBOARD SHORTCUT: "/" to focus search ────────────────
  document.addEventListener('keydown', e => {
    if (
      e.key === '/' &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.value = '';
      searchQuery = '';
      currentPage = 0;
      renderPosts(false);
      if (searchClear) searchClear.classList.remove('visible');
      searchInput.blur();
    }
  });

  // ── ACTIVE NAV LINK ───────────────────────────────────────
  function markActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
      const href = a.getAttribute('href').replace(/\/$/, '') || '/';
      a.classList.toggle('active', href === path);
    });
  }

  // ── COPY CODE BUTTONS (post pages) ───────────────────────
  function initCopyCodeBtns() {
    document.querySelectorAll('pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // ── ARCHIVE PAGE ──────────────────────────────────────────
  function initArchive() {
    const archiveList  = document.getElementById('archive-list');
    const archiveMeta  = document.getElementById('archive-meta');
    const archiveSearch = document.getElementById('archive-search-input');
    if (!archiveList) return;

    function renderArchive(query) {
      let posts = [...BLOG_POSTS];
      if (query) {
        const q = query.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      if (archiveMeta) {
        archiveMeta.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''} total`;
      }

      // Group by year
      const byYear = {};
      posts.forEach(p => {
        const year = p.dateISO ? p.dateISO.substring(0, 4) : 'Other';
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(p);
      });

      archiveList.innerHTML = '';
      const years = Object.keys(byYear).sort((a, b) => b - a);

      if (years.length === 0) {
        archiveList.innerHTML = '<p class="no-results">No posts found.</p>';
        return;
      }

      years.forEach(year => {
        const group = document.createElement('div');
        group.className = 'archive-year-group fade-in-section';
        const items = byYear[year].map(p => `
          <a href="${escapeHtml(p.url)}" class="archive-item">
            <span class="archive-item-date">${escapeHtml(p.date)}</span>
            <div class="archive-item-info">
              <div class="archive-item-title">${escapeHtml(p.title)}</div>
              <div class="archive-item-tags">${p.tags.map(getTagHtml).join('')}</div>
            </div>
            <span class="read-time-badge">⏱ ${formatReadTime(p.readTime)}</span>
          </a>
        `).join('');
        group.innerHTML = `<div class="archive-year">${escapeHtml(year)}</div><div class="archive-list">${items}</div>`;
        archiveList.appendChild(group);
      });

      initFadeIn();
    }

    renderArchive('');

    if (archiveSearch) {
      archiveSearch.addEventListener('input', debounce(function () {
        renderArchive(this.value);
      }, 280));
    }
  }

  // ── EVENT BINDINGS ────────────────────────────────────────
  function bindEvents() {
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderPosts(true);
      });
    }
    if (searchInput) {
      searchInput.addEventListener('input', onSearchInput);
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        currentPage = 0;
        renderPosts(false);
        searchClear.classList.remove('visible');
        searchInput.focus();
      });
    }
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    initTheme();
    markActiveNav();
    initReadingProgress();
    initBackToTop();
    initCopyCodeBtns();

    if (postsContainer) {
      renderFeatured();
      renderStats();
      buildFilterBar();
      bindEvents();
      renderPosts(false);
    }

    initArchive();

    // Dynamic footer year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  init();
})();
