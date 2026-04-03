(function() {
  // ---------- DATA (mock, would be fetched from API) ----------
  const mockPosts = [
    { 
      id: 1, 
      title: "Introduction to Python Programming",
      summary: "Python is a versatile language perfect for beginners and experts alike...",
      date: "Aug 4, 2025", 
      url: "/post/python.html",  // ✅ absolute path
      tags: ["Programming", "Python"] 
    },
    { 
      id: 2, 
      title: "Python Learning Roadmap",
      summary: "Follow a clear roadmap from Python basics to advanced topics with trackable learning milestones...",
      date: "Apr 2, 2026",
      url: "/post/python-roadmap.html",
      tags: ["Programming", "Python", "Roadmap"] 
    },
    { 
      id: 3, 
      title: "5 Ways GPT-5 Helps College Students & Professionals", 
      summary: "Discover how GPT-5 is transforming education, research, and career growth...", 
      date: "Aug 9, 2025", 
      url: "/post/how-gpt-5-is-helpful-for-college-students.html", 
      tags: ["AI", "Education", "Productivity", "Tech"] 
    },
    { 
      id: 4, 
      title: "Introduction to Python Programming",
      summary: "Python is a versatile language perfect for beginners and experts alike...",
      date: "Aug 4, 2025", 
      url: "/post/python.html",  // ✅ absolute path
      tags: ["Programming", "Python"] 
    },
    { 
      id: 5, 
      title: "Python Learning Roadmap",
      summary: "Follow a clear roadmap from Python basics to advanced topics with trackable learning milestones...",
      date: "Apr 2, 2026",
      url: "/post/python-roadmap.html",
      tags: ["Programming", "Python", "Roadmap"] 
    },
    { 
      id: 6, 
      title: "5 Ways GPT-5 Helps College Students & Professionals", 
      summary: "Discover how GPT-5 is transforming education, research, and career growth...", 
      date: "Aug 9, 2025", 
      url: "/post/how-gpt-5-is-helpful-for-college-students.html", 
      tags: ["AI", "Education", "Productivity", "Tech"] 
    }
  ];

  // ---------- CONFIGURATION ----------
  const POSTS_PER_PAGE = 4;
  let currentPage = 0;
  let activeTag = null;
  let searchQuery = "";

  // DOM elements
  const postsContainer = document.getElementById("blog-posts-container");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const tagFilterBar = document.getElementById("tag-filter-bar");
  const searchInput = document.getElementById("search-input");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const themeToggle = document.getElementById("theme-toggle");
  const moonIcon = document.getElementById("moon-icon");
  const sunIcon = document.getElementById("sun-icon");

  // ---------- HELPER: Filter posts ----------
  function getFilteredPosts() {
    let filtered = [...mockPosts];
    if (activeTag) {
      filtered = filtered.filter(post => post.tags.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  // ---------- RENDER POSTS (with loading simulation & "no results" message) ----------
  async function renderPosts() {
    if (!postsContainer) return;

    // Show loading state
    postsContainer.classList.add("loading");
    if (loadMoreBtn) loadMoreBtn.classList.add("loading");

    // Simulate async (replace with real fetch if needed)
    await new Promise(resolve => setTimeout(resolve, 300));

    const filtered = getFilteredPosts();
    const end = POSTS_PER_PAGE * (currentPage + 1);
    const postsToRender = filtered.slice(0, end);

    // Clear and rebuild
    postsContainer.innerHTML = "";

    if (filtered.length === 0) {
      // Show "no results" message
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = "No posts found. Try a different search or tag.";
      postsContainer.appendChild(noResults);
      if (loadMoreBtn) loadMoreBtn.style.display = "none";
      postsContainer.classList.remove("loading");
      if (loadMoreBtn) loadMoreBtn.classList.remove("loading");
      return;
    }

    postsToRender.forEach(post => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.innerHTML = `
        <div class="card-tags">
          ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <h3 class="card-title">${escapeHtml(post.title)}</h3>
        <div class="card-date">${escapeHtml(post.date)}</div>
        <p class="card-summary">${escapeHtml(post.summary)}</p>
        <a href="${escapeHtml(post.url)}" class="card-link">Read More →</a>
      `;
      postsContainer.appendChild(card);
    });

    // Toggle load more button
    if (loadMoreBtn) {
      loadMoreBtn.style.display = end >= filtered.length ? "none" : "inline-block";
    }

    postsContainer.classList.remove("loading");
    if (loadMoreBtn) loadMoreBtn.classList.remove("loading");
  }

  // XSS protection
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }

  // ---------- FILTER BAR (dynamic from posts) ----------
  function buildFilterBar() {
    if (!tagFilterBar) return;
    const allTags = new Set();
    mockPosts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));
    const sortedTags = ["All", ...Array.from(allTags).sort()];

    tagFilterBar.innerHTML = "";
    sortedTags.forEach(tag => {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = tag;
      link.dataset.tag = tag === "All" ? "all" : tag;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        activeTag = tag === "All" ? null : tag;
        currentPage = 0;
        renderPosts();
        updateActiveFilter(link);
      });
      tagFilterBar.appendChild(link);
    });
  }

  function updateActiveFilter(activeLink) {
    document.querySelectorAll(".filter-bar a").forEach(link => {
      link.classList.remove("active");
    });
    activeLink.classList.add("active");
  }

  // ---------- SEARCH (debounced) ----------
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function onSearchInput() {
    searchQuery = searchInput.value;
    currentPage = 0;
    renderPosts();
  }

  // ---------- THEME TOGGLE ----------
  function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
      document.body.classList.add("light");
      if (moonIcon) moonIcon.style.display = "block";
      if (sunIcon) sunIcon.style.display = "none";
    } else {
      document.body.classList.remove("light");
      if (moonIcon) moonIcon.style.display = "none";
      if (sunIcon) sunIcon.style.display = "block";
    }
  }

  function toggleTheme() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    if (moonIcon) moonIcon.style.display = isLight ? "block" : "none";
    if (sunIcon) sunIcon.style.display = isLight ? "none" : "block";
  }

  // ---------- MOBILE MENU ----------
  function toggleMobileMenu() {
    if (mobileMenu) mobileMenu.classList.toggle("active");
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (mobileMenu && mobileMenu.classList.contains("active") &&
        !mobileMenu.contains(e.target) &&
        mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.remove("active");
    }
  });

  // ---------- EVENT LISTENERS ----------
  function bindEvents() {
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderPosts();
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", debounce(onSearchInput, 300));
    }
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    }
  }

  // ---------- INITIALIZATION ----------
  function init() {
    buildFilterBar();
    bindEvents();
    initTheme();
    renderPosts();
  }

  init();
})();
