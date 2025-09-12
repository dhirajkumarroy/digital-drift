// document.addEventListener("DOMContentLoaded", () => {
//   const mockPosts = [
//     {
//       id: 1,
//       title: "Introduction to Python Programming",
//       summary:
//         "Python is a versatile language perfect for beginners and experts alike...",
//       date: "Aug 4, 2025",
//       url: "./post/python.html",
//       tags: ["Programming", "Python"],
//     },
//     {
//       id: 2,
//       title: "Perplexity AI: Everything You Need to Know (2025 Guide)",
//       summary:
//         "Discover Perplexity AI, the conversational search engine reshaping online research. Learn about its features, pricing, growth, controversies, and why it’s the future of AI-powered search.",
//       date: "Aug 18, 2025",
//       url: "./post/Perplexity_AI.html",
//       tags: ["AI", "Search Engine", "Perplexity", "Technology"],
//     },
//     {
//       id: 3,
//       title: "Perplexity AI vs ChatGPT: Which One Should You Use in 2025?",
//       summary:
//         "A complete 2025 comparison of Perplexity AI and ChatGPT. Discover which AI tool is best for your needs, from creative writing to academic research and real-time fact-checking.",
//       date: "Aug 18, 2025",
//       url: "./post/perplexity-ai-vs-chatgpt.html",
//       tags: ["AI", "ChatGPT", "Perplexity", "Comparison"],
//     },
//     {
//       id: 4,
//       title:
//         "Google Nano Banana AI in Gemini: The Future of Image Editing (2025)",
//       summary:
//         "Explore Google DeepMind’s Nano Banana, the new AI image editing tool in Gemini. Learn how it enables consistent edits, photo blending, design mixing, and more.",
//       date: "Sep 1, 2025",
//       url: "./post/google-nano-banana-gemini-ai-image-editing.html",
//       tags: ["AI", "Google", "Gemini", "Image Editing", "DeepMind","Tech"],
//     },
//   ];

//   const staticCategories = ["All", "Programming", "AI", "Tech"];

//   let postsPerPage = 4;
//   let currentPage = 0;
//   let activeTag = null;
//   let searchQuery = "";

//   const postsContainer = document.getElementById("blog-posts-container");
//   const loadMoreBtn = document.getElementById("load-more-btn");
//   const tagFilterBar = document.getElementById("tag-filter-bar");
//   const themeToggleBtn = document.getElementById("theme-toggle");
//   const mobileMenuBtn = document.getElementById("mobile-menu-btn");
//   const mobileMenu = document.getElementById("mobile-menu");
//   const moonIcon = document.getElementById("moon-icon");
//   const sunIcon = document.getElementById("sun-icon");
//   const searchInput = document.getElementById("search-input");

//   function createPostCard(post) {
//     const card = document.createElement("article");
//     card.className =
//       "blog-card bg-[var(--card-bg)] p-6 rounded-lg shadow-lg flex flex-col";
//     const tagsHtml = post.tags
//       .map(
//         (tag) =>
//           `<span class="tag-link text-xs text-[var(--link-color)] bg-gray-600/20 px-2 py-1 rounded-full mr-2">${tag}</span>`
//       )
//       .join("");
//     card.innerHTML = `
//       <div class="flex items-center mb-2">${tagsHtml}</div>
//       <h3 class="text-xl font-semibold text-[var(--text-color)] mb-2">${post.title}</h3>
//       <p class="text-sm text-[var(--text-color)] opacity-70 mb-4">${post.date}</p>
//       <p class="text-[var(--text-color)] mb-auto">${post.summary}</p>
//       <a href="${post.url}" class="mt-4 text-[var(--link-color)] font-semibold hover:underline self-start">Read More &rarr;</a>
//     `;
//     return card;
//   }

//   function renderPosts() {
//     if (!postsContainer) return;

//     let filtered = mockPosts;

//     if (activeTag) {
//       filtered = filtered.filter((post) => post.tags.includes(activeTag));
//     }

//     if (searchQuery.trim()) {
//       filtered = filtered.filter(
//         (post) =>
//           post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           post.summary.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     postsContainer.innerHTML = "";
//     const end = postsPerPage * (currentPage + 1);
//     const postsToRender = filtered.slice(0, end);

//     postsToRender.forEach((post) => {
//       postsContainer.appendChild(createPostCard(post));
//     });

//     if (loadMoreBtn) {
//       loadMoreBtn.style.display =
//         end >= filtered.length ? "none" : "inline-block";
//     }
//   }

//   function renderTagFilterBar() {
//     if (!tagFilterBar) return;
//     tagFilterBar.innerHTML = "";

//     staticCategories.forEach((cat) => {
//       const tagBtn = document.createElement("a");
//       tagBtn.href = "#";
//       tagBtn.textContent = cat;
//       tagBtn.dataset.tag = cat.toLowerCase() === "all" ? "all" : cat;
//       tagBtn.className =
//         "category-filter flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] hover:bg-[var(--tag-hover-bg)] transition-colors duration-200 whitespace-nowrap";
//       tagFilterBar.appendChild(tagBtn);
//     });

//     document.querySelectorAll(".category-filter").forEach((link) => {
//       link.addEventListener("click", (e) => {
//         e.preventDefault();
//         const selected = e.target.dataset.tag;
//         activeTag = selected === "all" ? null : selected;
//         currentPage = 0;
//         renderPosts();

//         // Visual highlight
//         document
//           .querySelectorAll(".category-filter")
//           .forEach((el) =>
//             el.classList.remove(
//               "font-bold",
//               "border-b-2",
//               "border-[var(--link-color)]"
//             )
//           );
//         e.target.classList.add(
//           "font-bold",
//           "border-b-2",
//           "border-[var(--link-color)]"
//         );
//       });
//     });
//   }

//   if (loadMoreBtn) {
//     loadMoreBtn.addEventListener("click", () => {
//       currentPage++;
//       renderPosts();
//     });
//   }

//   if (themeToggleBtn) {
//     themeToggleBtn.addEventListener("click", () => {
//       document.documentElement.classList.toggle("light");
//       const isLight = document.documentElement.classList.contains("light");
//       moonIcon.style.display = isLight ? "block" : "none";
//       sunIcon.style.display = isLight ? "none" : "block";
//     });
//   }

//   if (mobileMenuBtn) {
//     mobileMenuBtn.addEventListener("click", () => {
//       mobileMenu.classList.toggle("active");
//     });
//   }

//   if (searchInput) {
//     searchInput.addEventListener("input", (e) => {
//       searchQuery = e.target.value;
//       currentPage = 0;
//       renderPosts();
//     });
//   }

//   const isLight = document.documentElement.classList.contains("light");
//   moonIcon.style.display = isLight ? "block" : "none";
//   sunIcon.style.display = isLight ? "none" : "block";

//   renderTagFilterBar();
//   renderPosts();
// });

document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("blog-posts-container");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageNumbersContainer = document.getElementById("page-numbers");
  const tagFilterBar = document.getElementById("tag-filter-bar");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const moonIcon = document.getElementById("moon-icon");
  const sunIcon = document.getElementById("sun-icon");
  const searchInput = document.getElementById("search-input");

  const staticCategories = ["All", "Programming", "AI", "Tech"];

  let mockPosts = [];
  const postsPerPage = 6;
  let currentPage = 1;
  let totalPages = 1;
  let filteredPosts = [];
  let activeTag = null;
  let searchQuery = "";

  function setThemeFromStorage() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      moonIcon.style.display = "block";
      sunIcon.style.display = "none";
    } else {
      document.documentElement.classList.remove("light");
      moonIcon.style.display = "none";
      sunIcon.style.display = "block";
    }
  }

  setThemeFromStorage();

  async function fetchPosts() {
    try {
      const response = await fetch("data/data.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      mockPosts = await response.json();
      
      // Sort posts by date in descending order
      mockPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      filterAndRender();
      renderTagFilterBar();
    } catch (error) {
      console.error("Could not fetch posts:", error);
      postsContainer.innerHTML =
        "<p>Failed to load blog posts. Please try again later.</p>";
    }
  }

  function createPostCard(post) {
    const card = document.createElement("a");
    card.href = post.url;
    card.className =
      "blog-card bg-[var(--card-bg)] p-6 rounded-lg shadow-lg flex flex-col transition-transform duration-200 hover:scale-105 hover:shadow-xl";
    const tagsHtml = post.tags
      .map(
        (tag) =>
          `<span class="tag-link text-xs text-[var(--link-color)] bg-gray-600/20 px-2 py-1 rounded-full mr-2">${tag}</span>`
      )
      .join("");
    card.innerHTML = `
      <div class="flex items-center mb-2">${tagsHtml}</div>
      <h3 class="text-xl font-semibold text-[var(--text-color)] mb-2">${post.title}</h3>
      <p class="text-sm text-[var(--text-color)] opacity-70 mb-4">${post.date}</p>
      <p class="text-[var(--text-color)] mb-auto">${post.summary}</p>
    `;
    return card;
  }

  function filterAndRender() {
    filteredPosts = mockPosts;

    if (activeTag) {
      filteredPosts = filteredPosts.filter((post) => post.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    currentPage = 1;
    renderPosts();
    renderPagination();
  }

  function renderPosts() {
    if (!postsContainer) return;

    postsContainer.innerHTML = "";
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToRender = filteredPosts.slice(startIndex, endIndex);

    postsToRender.forEach((post) => {
      postsContainer.appendChild(createPostCard(post));
    });
  }

  function renderPagination() {
    if (!prevPageBtn || !nextPageBtn || !pageNumbersContainer) return;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    pageNumbersContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      pageBtn.className = `py-1 px-3 rounded-full font-semibold transition-colors duration-200 ${
        i === currentPage
          ? "bg-[var(--link-color)] text-white"
          : "bg-[var(--tag-bg)] text-[var(--tag-text)] hover:bg-[var(--tag-hover-bg)]"
      }`;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderPosts();
        renderPagination();
      });
      pageNumbersContainer.appendChild(pageBtn);
    }
  }

  function renderTagFilterBar() {
    if (!tagFilterBar) return;
    tagFilterBar.innerHTML = "";

    staticCategories.forEach((cat) => {
      const tagBtn = document.createElement("a");
      tagBtn.href = "#";
      tagBtn.textContent = cat;
      tagBtn.dataset.tag = cat.toLowerCase() === "all" ? "all" : cat;
      tagBtn.className =
        "category-filter flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] hover:bg-[var(--tag-hover-bg)] transition-colors duration-200 whitespace-nowrap";
      tagFilterBar.appendChild(tagBtn);
    });

    document.querySelectorAll(".category-filter").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const selected = e.target.dataset.tag;
        activeTag = selected === "all" ? null : selected;
        filterAndRender();

        document
          .querySelectorAll(".category-filter")
          .forEach((el) =>
            el.classList.remove(
              "font-bold",
              "border-b-2",
              "border-[var(--link-color)]"
            )
          );
        e.target.classList.add(
          "font-bold",
          "border-b-2",
          "border-[var(--link-color)]"
        );
      });
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPosts();
        renderPagination();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPosts();
        renderPagination();
      }
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("light");
      moonIcon.style.display = isLight ? "block" : "none";
      sunIcon.style.display = isLight ? "none" : "block";

      const newTheme = isLight ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
    });
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      filterAndRender();
    });
  }

  fetchPosts();
});