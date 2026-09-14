(function () {
  'use strict';

  /* ============================================================
     Digital Drift — script.js  v3.1
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
  const paginationEl   = document.getElementById('pagination');
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
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;" }[m];
    });
  }

  function formatReadTime(min) { return min + ' min read'; }

  function getTagHtml(tag) {
    return `<span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
  }

  // ── POST FILTERING ────────────────────────────────────────
  function getFilteredPosts() {
    let filtered = [...BLOG_POSTS];
    if (activeTag) {
      if (activeTag === 'Backend') {
        filtered = filtered.filter(p => p.tags.some(t => /backend|java|spring|node|api/i.test(t)));
      } else if (activeTag === 'Frontend') {
        filtered = filtered.filter(p => p.tags.some(t => /frontend|react|ui|web|css|html/i.test(t)) || p.summary.toLowerCase().includes('frontend') || p.title.toLowerCase().includes('frontend'));
        if (filtered.length === 0) filtered = BLOG_POSTS.slice(0, 4);
      } else if (activeTag === 'JavaScript') {
        filtered = filtered.filter(p => p.tags.some(t => /javascript|js|node|tech/i.test(t)) || p.title.toLowerCase().includes('javascript') || p.summary.toLowerCase().includes('javascript'));
      } else if (activeTag === 'Node.js') {
        filtered = filtered.filter(p => p.tags.some(t => /node/i.test(t)));
      } else if (activeTag === 'Laravel') {
        filtered = filtered.filter(p => p.tags.some(t => /laravel|backend/i.test(t)) || p.title.toLowerCase().includes('laravel'));
        if (filtered.length === 0) filtered = BLOG_POSTS.slice(0, 4);
      } else if (activeTag === 'Database') {
        filtered = filtered.filter(p => p.tags.some(t => /database|sql|postgres/i.test(t)) || p.title.toLowerCase().includes('postgresql') || p.summary.toLowerCase().includes('database'));
      } else if (activeTag === 'DevOps') {
        filtered = filtered.filter(p => p.tags.some(t => /devops|docker|git|cloud/i.test(t)) || p.title.toLowerCase().includes('docker') || p.title.toLowerCase().includes('git'));
      } else {
        filtered = filtered.filter(p => p.tags.includes(activeTag));
      }
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
    const featured = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];
    if (!featured) { featuredEl.style.display = 'none'; return; }

    featuredEl.innerHTML = `
      <div class="section-top-header">
        <div class="section-title-wrap-row">
          <span class="section-star">⭐</span>
          <h2 class="section-title">Featured Article</h2>
        </div>
        <a href="/archive" class="section-action-link">View all <span class="arrow">→</span></a>
      </div>
      <article class="featured-card fade-in-section">
        <div class="featured-image-container">
          <a href="${escapeHtml(featured.url)}" class="featured-image-link" aria-label="${escapeHtml(featured.title)}">
            <span class="badge-new">NEW</span>
            <img src="${escapeHtml(featured.image || '/android-chrome-512x512.png')}" alt="${escapeHtml(featured.title)}" class="featured-image" loading="eager" />
          </a>
        </div>
        <div class="featured-text-content">
          <div class="card-tags">
            <span class="tag tag-pill tag-blue">Frontend</span>
            <span class="tag tag-pill tag-subtle">${escapeHtml(featured.tags[0] || 'React')}</span>
          </div>
          <h3 class="featured-card-title">
            <a href="${escapeHtml(featured.url)}">${escapeHtml(featured.title)}</a>
          </h3>
          <p class="featured-card-summary">${escapeHtml(featured.summary)}</p>
          <div class="card-author-meta">
            <div class="author-avatar-group">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Dhiraj Roy" class="author-avatar-img" />
              <span class="author-name">Dhiraj Roy</span>
            </div>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${escapeHtml(featured.date)}
            </span>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${formatReadTime(featured.readTime)}
            </span>
          </div>
        </div>
      </article>
    `;
    initFadeIn();
  }

  // ── RENDER POPULAR POSTS (SIDEBAR) ────────────────────────
  function renderPopularPosts() {
    const popularEl = document.getElementById('popular-posts-list');
    if (!popularEl) return;

    const POPULAR_ITEMS = [
      {
        title: "React 18 Complete Guide",
        readTime: "12 min read",
        image: "/images/pop-react.svg",
        url: BLOG_POSTS[0] ? BLOG_POSTS[0].url : "/post/what-is-backend"
      },
      {
        title: "Laravel 11 Guide",
        readTime: "11 min read",
        image: "/images/pop-laravel.svg",
        url: BLOG_POSTS[1] ? BLOG_POSTS[1].url : "/post/spring-boot-pagination-sorting-complete-guide"
      },
      {
        title: "Node.js Backend Guide",
        readTime: "16 min read",
        image: "/images/pop-node.svg",
        url: "/post/nodejs-backend-development-production-api"
      },
      {
        title: "MySQL Indexing Explained",
        readTime: "9 min read",
        image: "/images/pop-mysql.svg",
        url: "/post/spring-boot-postgresql-crud-jpa-hibernate"
      },
      {
        title: "Deploy Laravel on VPS",
        readTime: "14 min read",
        image: "/images/pop-vps.svg",
        url: "/post/docker-complete-guide"
      }
    ];

    popularEl.innerHTML = POPULAR_ITEMS.map((p, idx) => `
      <a href="${escapeHtml(p.url)}" class="popular-post-row">
        <span class="pop-rank-circle">${idx + 1}</span>
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="pop-thumb" width="42" height="42" />
        <div class="pop-content">
          <h4 class="pop-title">${escapeHtml(p.title)}</h4>
          <span class="pop-time">${escapeHtml(p.readTime)}</span>
        </div>
        <span class="pop-chevron">›</span>
      </a>
    `).join('');
  }

  // ── RENDER POST CARDS ─────────────────────────────────────
  async function renderPosts() {
    if (!postsContainer) return;

    // Skeleton loader matching cards
    postsContainer.innerHTML = '<div class="skeleton-grid">' +
      Array(Math.min(POSTS_PER_PAGE, 6)).fill(`
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-body">
            <div class="skeleton-line" style="width:30%"></div>
            <div class="skeleton-line" style="height:1.2rem;width:85%"></div>
            <div class="skeleton-line" style="width:95%"></div>
            <div class="skeleton-line" style="width:70%"></div>
            <div class="skeleton-line" style="width:40%;margin-top:0.5rem"></div>
          </div>
        </div>`).join('') + '</div>';

    await new Promise(r => setTimeout(r, 140));

    const filtered = getFilteredPosts();
    const total    = filtered.length;
    const start    = currentPage * POSTS_PER_PAGE;
    const end      = start + POSTS_PER_PAGE;
    const toRender = filtered.slice(start, end);

    // Update count badge
    const countBadge = document.getElementById('posts-count-badge');
    if (countBadge) {
      countBadge.textContent = `${total} article${total === 1 ? '' : 's'}`;
    }

    postsContainer.innerHTML = '';

    if (total === 0) {
      postsContainer.innerHTML = `
        <div class="no-results-card">
          <div class="no-results-icon">🔍</div>
          <h3 class="no-results-title">No articles found</h3>
          <p class="no-results-text">Try another keyword or different category filter.</p>
          <button id="clear-filters-btn" class="btn-clear-filters">Clear filters</button>
        </div>
      `;
      const clearBtn = postsContainer.querySelector('#clear-filters-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          activeTag = null;
          currentPage = 0;
          document.querySelectorAll('.filter-bar a').forEach(l => {
            l.classList.toggle('active', l.dataset.tag === 'all');
          });
          renderPosts();
        });
      }
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    toRender.forEach((post, i) => {
      const card = document.createElement('article');
      card.className = 'blog-card';
      const tagPills = post.tags.slice(0, 2).map((t, idx) => `
        <span class="tag tag-pill ${idx === 0 ? 'tag-primary-pill' : 'tag-subtle'}">${escapeHtml(t)}</span>
      `).join('');

      card.innerHTML = `
        <a href="${escapeHtml(post.url)}" class="card-image-link" aria-label="${escapeHtml(post.title)}">
          <img src="${escapeHtml(post.image || '/android-chrome-192x192.png')}" alt="${escapeHtml(post.title)}" class="card-image" loading="lazy" />
        </a>
        <div class="card-body">
          <div class="card-tags">${tagPills}</div>
          <h3 class="card-title">
            <a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>
          </h3>
          <p class="card-summary">${escapeHtml(post.summary)}</p>
          <div class="card-footer">
            <div class="author-avatar-group">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Dhiraj Roy" class="author-avatar-img" />
              <span class="author-name">Dhiraj Roy</span>
            </div>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${escapeHtml(post.date)}
            </span>
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${formatReadTime(post.readTime)}
            </span>
          </div>
        </div>
      `;
      setTimeout(() => card.classList.add('fade-in'), i * 35);
      postsContainer.appendChild(card);
    });

    renderPagination(total);
  }

  // ── PAGINATION ────────────────────────────────────────────
  function renderPagination(totalPosts) {
    if (!paginationEl) return;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    const pages = getPageNumbers(currentPage, totalPages);
    let html = '';

    // Prev
    html += `<button class="page-btn page-arrow" id="pg-prev" aria-label="Previous page" ${currentPage === 0 ? 'disabled' : ''}>&lsaquo;</button>`;

    // Page numbers
    pages.forEach(p => {
      if (p === '…') {
        html += `<span class="page-ellipsis">…</span>`;
      } else {
        html += `<button class="page-btn${p === currentPage ? ' active' : ''}" data-page="${p}" aria-label="Page ${p+1}" aria-current="${p === currentPage ? 'page' : 'false'}">${p + 1}</button>`;
      }
    });

    // Next
    html += `<button class="page-btn page-arrow" id="pg-next" aria-label="Next page" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>&rsaquo;</button>`;

    paginationEl.innerHTML = html;

    // Bind events
    paginationEl.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => goToPage(Number(btn.dataset.page)));
    });
    const prevBtn = paginationEl.querySelector('#pg-prev');
    const nextBtn = paginationEl.querySelector('#pg-next');
    if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
  }

  function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current < 3)          return [0, 1, 2, 3, '…', total - 1];
    if (current > total - 4)  return [0, '…', total - 4, total - 3, total - 2, total - 1];
    return [0, '…', current - 1, current, current + 1, '…', total - 1];
  }

  function goToPage(page) {
    const filtered = getFilteredPosts();
    const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    if (page < 0 || page >= totalPages) return;
    currentPage = page;
    renderPosts();
    const anchor = document.getElementById('articles-section');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── FILTER BAR ────────────────────────────────────────────
  function buildFilterBar() {
    if (!tagFilterBar) return;

    const CATEGORIES = [
      { id: 'all', label: 'All', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>' },
      { id: 'Backend', label: 'Backend', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>' },
      { id: 'Frontend', label: 'Frontend', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
      { id: 'JavaScript', label: 'JavaScript', icon: '<span class="icon-badge-js">JS</span>' },
      { id: 'Node.js', label: 'Node.js', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M12 2l8 4.5v9l-8 4.5-8-4.5v-9z"/></svg>' },
      { id: 'Laravel', label: 'Laravel', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5zm9 5v10l-9 5V12l9-5zm-9 10L3 12V7l9 5v10z"/></svg>' },
      { id: 'Database', label: 'Database', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>' },
      { id: 'DevOps', label: 'DevOps', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.356-8-5.096 0-5.096 8 0 8 5.09 0 7.26-8 12.356-8z"/></svg>' }
    ];

    tagFilterBar.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'category-pill' + (cat.id === 'all' ? ' active' : '');
      a.dataset.tag = cat.id;
      a.innerHTML = `<span class="pill-icon">${cat.icon}</span><span class="pill-label">${escapeHtml(cat.label)}</span>`;

      a.addEventListener('click', e => {
        e.preventDefault();
        activeTag = cat.id === 'all' ? null : cat.id;
        currentPage = 0;
        renderPosts();
        document.querySelectorAll('.filter-bar .category-pill').forEach(l => l.classList.remove('active'));
        a.classList.add('active');
      });
      tagFilterBar.appendChild(a);
    });
  }

  // ── SEARCH ────────────────────────────────────────────────
  const onSearchInput = debounce(function () {
    searchQuery = searchInput ? searchInput.value : '';
    currentPage = 0;
    renderPosts();
    if (searchClear) searchClear.classList.toggle('visible', searchQuery.length > 0);
  }, 280);

  // ── THEME (uses <html> element to prevent FOUC) ───────────
  function applyTheme(isLight) {
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    if (moonIcon) moonIcon.style.display = isLight ? 'block' : 'none';
    if (sunIcon)  sunIcon.style.display  = isLight ? 'none'  : 'block';
  }

  function initTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const isLight = !isDark;
    if (isLight && !document.documentElement.classList.contains('light')) {
      document.documentElement.classList.add('light');
    }
    if (moonIcon) moonIcon.style.display = isLight ? 'block' : 'none';
    if (sunIcon)  sunIcon.style.display  = isLight ? 'none'  : 'block';
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains('dark');
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
    ) mobileMenu.classList.remove('active');
  });

  // ── BACK TO TOP ───────────────────────────────────────────
  function initBackToTop() {
    if (!backToTop) return;
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── READING PROGRESS ─────────────────────────────────────
  function initReadingProgress() {
    if (!progressBar) return;
    window.addEventListener('scroll', () => {
      const doc    = document.documentElement;
      const scroll = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = height > 0 ? (scroll / height * 100) + '%' : '0%';
      if (backToTop) backToTop.classList.toggle('visible', scroll > 400);
    }, { passive: true });
  }

  // ── INTERSECTION OBSERVER (fade-in sections) ─────────────
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in-section').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-section:not(.visible)').forEach(el => observer.observe(el));
  }

  // ── KEYBOARD SHORTCUTS ────────────────────────────────────
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    const isSearchShortcut = e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k');
    if (isSearchShortcut && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInput.focus();
        searchInput.select();
      }
    }
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.value = ''; searchQuery = ''; currentPage = 0;
      renderPosts();
      if (searchClear) searchClear.classList.remove('visible');
      searchInput.blur();
    }
  });

  // ── ACTIVE NAV LINK ───────────────────────────────────────
  function markActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href.startsWith('#')) return;
      a.classList.toggle('active', href === path);
    });
  }

  // ── COPY CODE BUTTONS ─────────────────────────────────────
  function initCopyCodeBtns() {
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.copy-code-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        navigator.clipboard.writeText(code ? code.textContent : pre.textContent).then(() => {
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
    const archiveList   = document.getElementById('archive-list');
    const archiveMeta   = document.getElementById('archive-meta');
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
      if (archiveMeta) archiveMeta.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''} total`;

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
            <span class="read-time-badge" style="flex-shrink:0;">⏱ ${formatReadTime(p.readTime)}</span>
          </a>
        `).join('');
        group.innerHTML = `<div class="archive-year">${escapeHtml(year)}</div><div class="archive-list">${items}</div>`;
        archiveList.appendChild(group);
      });
      initFadeIn();
    }

    renderArchive('');
    if (archiveSearch) {
      archiveSearch.addEventListener('input', debounce(function () { renderArchive(this.value); }, 280));
    }
  }

  // ── TOAST ─────────────────────────────────────────────────
  window.showToast = function(msg, type) {
    const container = document.getElementById('toast-container') || document.body;
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  // ── EVENT BINDINGS ────────────────────────────────────────
  function bindEvents() {
    if (searchInput) searchInput.addEventListener('input', onSearchInput);
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = ''; searchQuery = ''; currentPage = 0;
        renderPosts();
        searchClear.classList.remove('visible');
        searchInput.focus();
      });
    }
    const headerSearchBtn = document.getElementById('header-search-btn');
    if (headerSearchBtn) {
      headerSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => searchInput.focus(), 250);
        }
      });
    }
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // ── FOOTER YEAR ───────────────────────────────────────────
  function initFooterYear() {
    const el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── SOCIAL SHARING ───────────────────────────────────────
  function initSocialSharing() {
    const postArticle = document.querySelector('.blog-post');
    if (!postArticle) return;

    const postTitleEl = postArticle.querySelector('.post-title');
    const postContent = postArticle.querySelector('.post-content');
    if (!postTitleEl || !postContent) return;

    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(postTitleEl.textContent.trim());

    const twitterUrl  = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;

    function createShareBarHtml(label) {
      return `
        <div class="social-share-wrapper">
          <span class="share-label">${label || 'Share this article:'}</span>
          <div class="social-share-buttons">
            <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-twitter" aria-label="Share on X (Twitter)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>X / Twitter</span>
            </a>
            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-linkedin" aria-label="Share on LinkedIn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-facebook" aria-label="Share on Facebook">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.6 13.78 5.6c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 3h-2.34v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              <span>Facebook</span>
            </a>
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-whatsapp" aria-label="Share on WhatsApp">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2zm5.8 13.56c-.25.69-1.46 1.33-2.02 1.41-.53.08-1.2.12-1.93-.11-.45-.14-1.03-.33-1.78-.66-3.13-1.36-5.17-4.52-5.33-4.73-.15-.21-1.27-1.69-1.27-3.23 0-1.54.8-2.3 1.09-2.6.28-.3.62-.38.83-.38.21 0 .42 0 .6.01.2.01.46-.08.72.54.26.63.9 2.2.98 2.36.08.16.13.35.03.56-.1.21-.15.34-.3.51-.15.17-.32.38-.46.51-.15.15-.3.31-.13.61.17.3 1.09 1.8 2.68 3.21 1.6 1.42 2.94 1.86 3.36 2.07.42.21.67.18.92-.1.25-.28 1.07-1.25 1.36-1.68.29-.43.58-.36.97-.21.39.15 2.49 1.17 2.91 1.38.42.21.7.31.8.49.1.18.1.99-.15 1.68z"/></svg>
              <span>WhatsApp</span>
            </a>
            <button class="share-btn share-copy" onclick="copyPostLink()" aria-label="Copy link to clipboard">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      `;
    }

    // Top share bar
    const topBar = document.createElement('div');
    topBar.className = 'post-share-top';
    topBar.innerHTML = createShareBarHtml('Share this article:');

    const banner = postArticle.querySelector('.post-banner-wrapper');
    if (banner) {
      banner.parentNode.insertBefore(topBar, banner);
    } else {
      postTitleEl.parentNode.insertBefore(topBar, postTitleEl.nextSibling);
    }

    // Bottom share bar
    const bottomBar = document.createElement('div');
    bottomBar.className = 'post-share-bottom';
    bottomBar.innerHTML = createShareBarHtml('Enjoyed this guide? Share it with your network:');
    postContent.appendChild(bottomBar);
  }

  window.copyPostLink = function() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        if (window.showToast) window.showToast('📋 Link copied to clipboard!');
      });
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      if (window.showToast) window.showToast('📋 Link copied to clipboard!');
    }
  };

  // ── ARTICLE BREADCRUMBS ───────────────────────────────────
  function initBreadcrumbs() {
    const postArticle = document.querySelector('.blog-post');
    if (!postArticle) return;

    const postTitleEl = postArticle.querySelector('.post-title');
    if (!postTitleEl || postArticle.querySelector('.breadcrumbs')) return;

    const currentPath = window.location.pathname;
    const currentPost = BLOG_POSTS.find(p => p.url === currentPath || currentPath.endsWith(p.slug) || currentPath.endsWith(p.slug + '.html'));
    const categoryTag = currentPost && currentPost.tags ? currentPost.tags[0] : 'Engineering';

    const breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'breadcrumbs';
    breadcrumbs.setAttribute('aria-label', 'Breadcrumb navigation');
    breadcrumbs.innerHTML = `
      <a href="/">Home</a>
      <span class="bc-sep">/</span>
      <a href="/archive">${escapeHtml(categoryTag)}</a>
      <span class="bc-sep">/</span>
      <span class="bc-current">${escapeHtml(postTitleEl.textContent.trim())}</span>
    `;

    postTitleEl.parentNode.insertBefore(breadcrumbs, postTitleEl);
  }

  // ── ARTICLE AUTO TABLE OF CONTENTS ────────────────────────
  function initAutoTOC() {
    const postContent = document.querySelector('.post-content');
    if (!postContent) return;

    const headings = postContent.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    // Check if TOC container already exists in article
    let tocBox = postContent.querySelector('.table-of-contents') || postContent.querySelector('[style*="Table of Contents"]');
    if (!tocBox) {
      // Create auto-generated TOC
      const autoToc = document.createElement('div');
      autoToc.className = 'auto-toc-box';
      let tocHtml = '<strong>Table of Contents</strong><ul class="auto-toc-list">';
      
      headings.forEach((h, index) => {
        if (!h.id) {
          h.id = 'heading-' + index + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const isSub = h.tagName.toLowerCase() === 'h3';
        tocHtml += `<li class="${isSub ? 'toc-sub' : 'toc-main'}"><a href="#${h.id}">${escapeHtml(h.textContent.trim())}</a></li>`;
      });
      tocHtml += '</ul>';
      autoToc.innerHTML = tocHtml;

      const firstParagraph = postContent.querySelector('p');
      if (firstParagraph && firstParagraph.nextSibling) {
        postContent.insertBefore(autoToc, firstParagraph.nextSibling);
      } else {
        postContent.insertBefore(autoToc, postContent.firstChild);
      }
    }

    // Scroll spy for headings
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.auto-toc-list a').forEach(link => {
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-10% 0px -75% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  // ── AUTHOR BIO & RELATED POSTS ────────────────────────────
  function initAuthorBioAndRelatedPosts() {
    const postArticle = document.querySelector('.blog-post');
    const postContent = document.querySelector('.post-content');
    if (!postArticle || !postContent) return;

    const currentPath = window.location.pathname;
    const currentPost = BLOG_POSTS.find(p => p.url === currentPath || currentPath.endsWith(p.slug) || currentPath.endsWith(p.slug + '.html'));

    // 1. Author Bio Card
    if (!postContent.querySelector('.author-bio-card')) {
      const authorCard = document.createElement('div');
      authorCard.className = 'author-bio-card';
      authorCard.innerHTML = `
        <div class="author-bio-avatar-wrapper">
          <img src="/android-chrome-192x192.png" alt="Dhiraj Roy" class="author-bio-avatar" />
        </div>
        <div class="author-bio-content">
          <div class="author-bio-header">
            <h3>Dhiraj Roy</h3>
            <span class="author-bio-role">Backend &amp; System Design Specialist</span>
          </div>
          <p class="author-bio-text">
            Software Engineer building production systems with Java 21, Spring Boot 3.x, Microservices, PostgreSQL, and AI integrations. Founder &amp; Lead Author at Digital Drift.
          </p>
          <div class="author-bio-links">
            <a href="https://github.com/dhirajkumarroy" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:roykumardhiraj9347@gmail.com">Email</a>
            <a href="/about">About Author</a>
          </div>
        </div>
      `;
      postContent.appendChild(authorCard);
    }

    // 2. Newsletter Signup Box
    if (!postContent.querySelector('.newsletter-card')) {
      const newsletterCard = document.createElement('div');
      newsletterCard.className = 'newsletter-card';
      newsletterCard.innerHTML = `
        <div class="newsletter-icon">⚡</div>
        <div class="newsletter-content">
          <h3>Subscribe to Digital Drift Digest</h3>
          <p>Get high-quality, practical engineering guides on Java 21, Spring Boot, microservices, and system design sent straight to your inbox.</p>
          <form class="newsletter-form" onsubmit="event.preventDefault(); if(window.showToast) window.showToast('🎉 Thank you for subscribing to Digital Drift!'); this.reset();">
            <input type="email" placeholder="Enter your email address…" required class="newsletter-input" />
            <button type="submit" class="btn-primary newsletter-btn">Subscribe Free</button>
          </form>
        </div>
      `;
      postContent.appendChild(newsletterCard);
    }

    // 3. Related Posts Grid
    if (currentPost && !postContent.querySelector('.related-posts-section')) {
      const primaryTag = currentPost.tags[0];
      const related = BLOG_POSTS.filter(p => p.id !== currentPost.id && p.tags.includes(primaryTag)).slice(0, 2);
      if (related.length > 0) {
        const relatedSec = document.createElement('div');
        relatedSec.className = 'related-posts-section';
        relatedSec.innerHTML = `
          <h3 class="related-posts-title">Related Articles You Might Like</h3>
          <div class="related-posts-grid">
            ${related.map(p => `
              <a href="${escapeHtml(p.url)}" class="related-post-card">
                <img src="${escapeHtml(p.image || '/android-chrome-192x192.png')}" alt="${escapeHtml(p.title)}" class="related-post-img" loading="lazy" />
                <div class="related-post-info">
                  <span class="related-post-tag">${escapeHtml(p.tags[0])}</span>
                  <h4 class="related-post-heading">${escapeHtml(p.title)}</h4>
                  <span class="related-post-meta">⏱ ${formatReadTime(p.readTime)}</span>
                </div>
              </a>
            `).join('')}
          </div>
        `;
        postContent.appendChild(relatedSec);
      }
    }

    // 4. Comments Section Container
    if (!postContent.querySelector('.comments-section')) {
      const commentsSec = document.createElement('div');
      commentsSec.className = 'comments-section';
      commentsSec.innerHTML = `
        <h3 class="comments-title">💬 Discussion &amp; Feedback</h3>
        <p class="comments-subtitle">Have questions or suggestions? Join the developer conversation.</p>
        <div id="giscus-container" class="giscus-container">
          <div class="comments-fallback">
            <p>Leave a comment or share your thoughts via <a href="https://github.com/dhirajkumarroy/digital-drift/discussions" target="_blank" rel="noopener">GitHub Discussions</a>.</p>
          </div>
        </div>
      `;
      postContent.appendChild(commentsSec);
    }
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    initTheme();
    markActiveNav();
    initReadingProgress();
    initBackToTop();
    initCopyCodeBtns();
    initFadeIn();
    initFooterYear();
    initBreadcrumbs();
    initAutoTOC();
    initSocialSharing();
    initAuthorBioAndRelatedPosts();
    bindEvents();

    if (postsContainer) {
      renderFeatured();
      buildFilterBar();
      renderPosts();
      renderPopularPosts();
    }

    initArchive();
  }

  init();
})();
