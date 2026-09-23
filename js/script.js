(function () {
  'use strict';

  /* ============================================================
     Digital Drift — script.js  v3.1
     Depends on: /js/posts-data.js and /js/categories.js
     ============================================================ */

  // ── CONFIG ────────────────────────────────────────────────
  const POSTS_PER_PAGE = 6;

  // ── STATE ─────────────────────────────────────────────────
  let currentPage  = 0;
  let activeTag    = readCategoryFromUrl() || null;
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

  function tagsMatch(first, second) {
    return String(first || '').trim().toLowerCase() === String(second || '').trim().toLowerCase();
  }

  function readCategoryFromUrl() {
    try {
      const category = new URLSearchParams(window.location.search).get('category');
      return category ? category.trim() : '';
    } catch (e) {
      return '';
    }
  }

  function syncCategoryUrl(category) {
    try {
      const url = new URL(window.location.href);
      if (category) {
        url.searchParams.set('category', category);
      } else {
        url.searchParams.delete('category');
      }
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e) {
      // Keep filtering functional in browsers that do not support the URL APIs.
    }
  }

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
      filtered = filtered.filter(post => window.BlogCategories.matches(post, activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
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
    if (featuredEl.children.length) return;
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
            <span class="badge-new">FEATURED</span>
            <img src="${escapeHtml(featured.image || '/android-chrome-512x512.png')}" alt="${escapeHtml(featured.title)}" class="featured-image" width="800" height="500" loading="lazy" decoding="async" />
          </a>
        </div>
        <div class="featured-text-content">
          <div class="card-tags">
            ${featured.tags.slice(0, 2).map(getTagHtml).join('')}
          </div>
          <h3 class="featured-card-title">
            <a href="${escapeHtml(featured.url)}">${escapeHtml(featured.title)}</a>
          </h3>
          <p class="featured-card-summary">${escapeHtml(featured.summary)}</p>
          <div class="card-author-meta">
            <div class="author-avatar-group">
              <img src="/android-chrome-192x192.png" alt="" class="author-avatar-img" width="32" height="32" loading="lazy" />
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

  function updateFeaturedVisibility() {
    if (!featuredEl) return;
    featuredEl.hidden = Boolean(activeTag || searchQuery.trim());
  }

  // ── RENDER POPULAR POSTS (SIDEBAR) ────────────────────────
  function renderPopularPosts() {
    const popularEl = document.getElementById('popular-posts-list');
    if (!popularEl) return;

    const POPULAR_ITEMS = BLOG_POSTS.slice(0, 5).map(post => ({
      ...post,
      readTime: formatReadTime(post.readTime)
    }));

    popularEl.innerHTML = POPULAR_ITEMS.map((p, idx) => `
      <a href="${escapeHtml(p.url)}" class="popular-post-row">
        <span class="pop-rank-circle">${idx + 1}</span>
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="pop-thumb" width="42" height="42" loading="lazy" decoding="async" />
        <div class="pop-content">
          <h4 class="pop-title">${escapeHtml(p.title)}</h4>
          <span class="pop-time">${escapeHtml(p.readTime)}</span>
        </div>
        <span class="pop-chevron">›</span>
      </a>
    `).join('');
  }

  // ── RENDER POST CARDS ─────────────────────────────────────
  function renderPosts() {
    if (!postsContainer) return;

    updateFeaturedVisibility();

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
          if (searchClear) searchClear.classList.remove('visible');
          searchQuery = '';
          activateHomepageCategory(null);
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
          <img src="${escapeHtml(post.image || '/android-chrome-192x192.png')}" alt="${escapeHtml(post.title)}" class="card-image" width="800" height="500" loading="lazy" decoding="async" />
        </a>
        <div class="card-body">
          <div class="card-tags">${tagPills}</div>
          <h3 class="card-title">
            <a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>
          </h3>
          <p class="card-summary">${escapeHtml(post.summary)}</p>
          <div class="card-footer">
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
    const currentButton = paginationEl && paginationEl.querySelector('[aria-current="page"]');
    if (currentButton) currentButton.focus({ preventScroll: true });
    const anchor = document.getElementById('articles-section');
    if (anchor) anchor.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  // ── FILTER BAR ────────────────────────────────────────────
  function syncHomepageCategoryPills() {
    document.querySelectorAll('.filter-bar .category-pill').forEach(pill => {
      const isActive = activeTag
        ? tagsMatch(pill.dataset.tag, activeTag)
        : pill.dataset.tag === 'all';
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function activateHomepageCategory(category) {
    activeTag = category || null;
    currentPage = 0;
    syncCategoryUrl(activeTag);
    syncHomepageCategoryPills();
    markActiveNav();
    renderPosts();
  }

  function buildFilterBar() {
    if (!tagFilterBar) return;

    const categories = [{ id: 'all', label: 'All', count: BLOG_POSTS.length }, ...window.BlogCategories.available(BLOG_POSTS)];

    tagFilterBar.innerHTML = '';
    categories.forEach(cat => {
      const a = document.createElement('a');
      a.href = cat.id === 'all' ? '/#articles-section' : '/?category=' + encodeURIComponent(cat.id) + '#articles-section';
      const isActive = activeTag
        ? tagsMatch(cat.id, activeTag)
        : cat.id === 'all';
      a.className = 'category-pill' + (isActive ? ' active' : '');
      a.dataset.tag = cat.id;
      a.setAttribute('aria-current', isActive ? 'true' : 'false');
      a.innerHTML = `<span class="pill-label">${escapeHtml(cat.label)}</span> <span class="category-count">${cat.count}</span>`;

      a.addEventListener('click', e => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        activateHomepageCategory(cat.id === 'all' ? null : cat.id);
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
    if (themeToggle) themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function initTheme() {
    applyTheme(!document.documentElement.classList.contains('dark'));
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains('dark');
    applyTheme(isLight);
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) { /* Theme still works without storage. */ }
  }

  // ── MOBILE MENU ───────────────────────────────────────────
  function toggleMobileMenu() {
    setMobileMenu(mobileMenu && !mobileMenu.classList.contains('active'));
  }

  function setMobileMenu(open) {
    if (!mobileMenu || !mobileMenuBtn) return;
    mobileMenu.classList.toggle('active', Boolean(open));
    mobileMenuBtn.setAttribute('aria-expanded', String(Boolean(open)));
    mobileMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) mobileMenu.querySelectorAll('.nav-categories[open]').forEach(menu => { menu.open = false; });
  }

  if (mobileMenu) mobileMenu.addEventListener('click', e => {
    if (e.target.closest('a')) setMobileMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const openCategories = Array.from(document.querySelectorAll('.nav-categories[open]'));
    if (openCategories.length) {
      const focusedMenu = openCategories.find(menu => menu.contains(document.activeElement)) || openCategories[0];
      openCategories.forEach(menu => { menu.open = false; });
      const summary = focusedMenu.querySelector('summary');
      if (summary) summary.focus();
      e.preventDefault();
      return;
    }
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      setMobileMenu(false);
      mobileMenuBtn.focus();
    }
  });
  window.matchMedia('(min-width: 993px)').addEventListener('change', e => {
    document.querySelectorAll('.nav-categories[open]').forEach(menu => { menu.open = false; });
    if (e.matches) setMobileMenu(false);
  });

  document.addEventListener('click', e => {
    document.querySelectorAll('.nav-categories[open]').forEach(menu => {
      if (!menu.contains(e.target) || e.target.closest('.category-menu a')) menu.open = false;
    });
    if (
      mobileMenu && mobileMenu.classList.contains('active') &&
      !mobileMenu.contains(e.target) &&
      mobileMenuBtn && !mobileMenuBtn.contains(e.target)
    ) setMobileMenu(false);
  });

  // ── BACK TO TOP ───────────────────────────────────────────
  function initBackToTop() {
    if (!backToTop) return;
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
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
    if (searchInput && isSearchShortcut && tag !== 'INPUT' && tag !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
      e.preventDefault();
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
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
    const normalizePath = pathname => pathname.replace(/\.html$/, '').replace(/\/$/, '').replace(/^\/index$/, '') || '/';
    const path = normalizePath(window.location.pathname);
    const selectedCategory = readCategoryFromUrl();
    document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) return;
      let target;
      try { target = new URL(href, window.location.href); }
      catch (_) { return; }
      const category = target.searchParams.get('category');
      const isCategoryLink = Boolean(a.closest('.category-menu'));
      const samePath = normalizePath(target.pathname) === path;
      const isActive = target.origin === window.location.origin && (category
        ? Boolean(selectedCategory && tagsMatch(category, selectedCategory))
        : samePath && (!isCategoryLink || !selectedCategory));
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', samePath ? 'page' : 'true');
      else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.nav-categories').forEach(menu => {
      const summary = menu.querySelector('summary');
      if (summary) summary.classList.toggle('active', Boolean(menu.querySelector('.category-menu a.active')));
    });
  }

  // ── COPY CODE BUTTONS ─────────────────────────────────────
  function initCopyCodeBtns() {
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.copy-code-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        try {
          const content = code ? code.textContent : Array.from(pre.childNodes).filter(node => node !== btn).map(node => node.textContent).join('');
          await navigator.clipboard.writeText(content);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        } catch (error) {
          window.showToast('Copy is unavailable. Select the code and copy it manually.');
        }
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

    let currentTag = readCategoryFromUrl();
    const archiveFilters = document.querySelector('.archive-filters-row');
    if (archiveFilters) {
      archiveFilters.querySelectorAll('.archive-chip').forEach(chip => chip.remove());
      const categories = [{ id: '', label: 'All Topics', count: BLOG_POSTS.length }, ...window.BlogCategories.available(BLOG_POSTS)];
      categories.forEach(category => {
        const chip = document.createElement('a');
        chip.className = 'archive-chip';
        chip.dataset.tag = category.id;
        chip.href = category.id ? '/archive?category=' + encodeURIComponent(category.id) : '/archive';
        chip.innerHTML = `<span>${escapeHtml(category.label)}</span> <span class="category-count">${category.count}</span>`;
        archiveFilters.appendChild(chip);
      });
    }
    const archiveChips = document.querySelectorAll('.archive-chip');

    function syncArchiveChips() {
      archiveChips.forEach(chip => {
        const chipTag = chip.getAttribute('data-tag') || '';
        const isActive = currentTag
          ? tagsMatch(chipTag, currentTag)
          : chipTag === '';
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-current', String(isActive));
      });
    }

    function activateArchiveCategory(category) {
      currentTag = category || '';
      syncCategoryUrl(currentTag);
      syncArchiveChips();
      markActiveNav();
      renderArchive(archiveSearch ? archiveSearch.value : '');
    }

    function renderArchive(query) {
      query = String(query || '').trim();
      let posts = [...BLOG_POSTS];
      if (currentTag) {
        posts = posts.filter(post => window.BlogCategories.matches(post, currentTag));
      }
      if (query) {
        const q = query.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      if (archiveMeta) {
        archiveMeta.innerHTML = `Showing <span class="archive-meta-badge">${posts.length} article${posts.length !== 1 ? 's' : ''}</span>${currentTag ? ` in <strong>${escapeHtml(currentTag)}</strong>` : ''}${query ? ` for "<strong>${escapeHtml(query)}</strong>"` : ''}`;
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
        archiveList.innerHTML = '<div style="text-align:center; padding:3rem 1rem; background:var(--color-card); border:1px solid var(--color-border); border-radius:16px;"><p style="font-size:1.1rem; font-weight:600; color:var(--color-text-secondary); margin-bottom:0.75rem;">No articles found matching your criteria.</p><button onclick="document.getElementById(\'archive-search-input\').value=\'\'; window.resetArchiveFilters && window.resetArchiveFilters();" style="padding:0.4rem 1rem; border-radius:9999px; background:var(--color-primary); color:#fff; border:none; cursor:pointer; font-weight:600;">Clear Filters</button></div>';
        return;
      }

      years.forEach(year => {
        const group = document.createElement('div');
        group.className = 'archive-year-group fade-in-section';
        const items = byYear[year].map(p => `
          <a href="${escapeHtml(p.url)}" class="archive-item">
            <div class="archive-item-left">
              <span class="archive-date-pill">${escapeHtml(p.date)}</span>
              <div class="archive-item-info">
                <span class="archive-item-title">${escapeHtml(p.title)}</span>
                <div class="archive-item-tags">${p.tags.map(getTagHtml).join('')}</div>
              </div>
            </div>
            <div class="archive-item-right">
              <span class="archive-read-time">⏱ ${formatReadTime(p.readTime)}</span>
              <span class="archive-arrow-icon">→</span>
            </div>
          </a>
        `).join('');
        group.innerHTML = `<div class="archive-year-badge">📅 ${escapeHtml(year)} <span style="font-size:0.82rem; font-weight:600; margin-left:4px;">(${byYear[year].length})</span></div><div class="archive-list">${items}</div>`;
        archiveList.appendChild(group);
      });
      initFadeIn();
    }

    window.resetArchiveFilters = function() {
      if (archiveSearch) archiveSearch.value = '';
      activateArchiveCategory('');
    };

    archiveChips.forEach(chip => {
      chip.addEventListener('click', function(e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        activateArchiveCategory(this.getAttribute('data-tag') || '');
      });
    });

    syncArchiveChips();
    renderArchive('');
    if (archiveSearch) {
      archiveSearch.addEventListener('input', debounce(function () { renderArchive(this.value); }, 250));
    }
  }

  // ── TOAST ─────────────────────────────────────────────────
  window.showToast = function(msg, type) {
    const container = document.getElementById('toast-container') || document.body;
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    el.setAttribute('role', 'status');
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
          searchInput.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
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

    const shareUrl = encodeURIComponent(document.querySelector('link[rel="canonical"]')?.href || window.location.href);
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
    let tocBox = postContent.querySelector('.table-of-contents, .auto-toc-box, nav[aria-label="Table of contents"]');
    if (!tocBox) tocBox = Array.from(postContent.querySelectorAll('h2, h3, strong')).find(h => /^(?:📑\s*)?(?:table of contents|on this page)$/i.test(h.textContent.trim()));
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
    if (!('IntersectionObserver' in window)) return;
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
    if (!postArticle.querySelector('.author-bio-card, .author-bio')) {
      const authorCard = document.createElement('div');
      authorCard.className = 'author-bio-card';
      authorCard.innerHTML = `
        <div class="author-bio-avatar-wrapper">
          <img src="/android-chrome-192x192.png" alt="Dhiraj Roy" class="author-bio-avatar" width="72" height="72" loading="lazy" />
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
          <h3>Follow Digital Drift</h3>
          <p>Get new backend and system design guides in your favorite RSS reader.</p>
          <a href="/feed.xml" class="btn-sidebar-subscribe feed-link">Subscribe via RSS</a>
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
                <img src="${escapeHtml(p.image || '/android-chrome-192x192.png')}" alt="${escapeHtml(p.title)}" class="related-post-img" width="90" height="70" loading="lazy" decoding="async" />
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
