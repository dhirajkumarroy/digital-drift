(function (root, factory) {
  'use strict';
  const categories = factory();
  if (typeof module === 'object' && module.exports) module.exports = categories;
  if (root) root.BlogCategories = categories;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const definitions = [
    { id: 'AI', label: 'AI' },
    { id: 'System Design', label: 'System Design' },
    { id: 'Backend', label: 'Backend' },
    { id: 'Java', label: 'Java' },
    { id: 'Spring Boot', label: 'Spring Boot' },
    { id: 'Node.js', label: 'Node.js' },
    { id: 'JavaScript', label: 'JavaScript' },
    { id: 'Database', label: 'Database' },
    { id: 'DevOps', label: 'DevOps' },
    { id: 'Security', label: 'Security' }
  ];

  // Match complete tags only: for example, JavaScript is not a Java tag.
  // Keep legacy tags explicit so every page uses the same category membership.
  const aliases = {
    ai: ['AI', 'Artificial Intelligence', 'Machine Learning', 'Generative AI'],
    'system design': ['System Design'],
    backend: ['Backend', 'Java', 'Spring', 'Spring Boot', 'Node.js', 'NodeJS', 'Node', 'Node.js backend', 'API', 'REST API'],
    java: ['Java', 'Spring', 'Spring Boot'],
    'spring boot': ['Spring Boot'],
    'node.js': ['Node.js', 'NodeJS', 'Node', 'Node.js backend'],
    javascript: ['JavaScript', 'JS', 'Node.js', 'NodeJS', 'Node', 'Node.js backend'],
    database: ['Database', 'Databases', 'PostgreSQL', 'Postgres', 'MySQL', 'SQL', 'SQLite', 'MongoDB', 'Redis', 'NoSQL'],
    devops: ['DevOps', 'Docker', 'Git', 'Cloud', 'Kubernetes', 'CI/CD'],
    security: ['Security', 'Spring Security', 'Authentication', 'Authorization', 'OAuth', 'OAuth2', 'JWT']
  };

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  // Inline vector icons stay sharp and need no external images or icon fonts.
  const icons = {
    all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    ai: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="M20 2v4m-2-2h4"/>',
    'system design': '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    backend: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>',
    java: '<path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9ZM17 10h1a3 3 0 1 1 0 6h-1M3 22h17M8 2v3M12 1v4M16 2v3"/>',
    'spring boot': '<path d="M20 3C11 2 3 6 3 13a7 7 0 0 0 7 7c7 0 11-8 10-17Z"/><path d="m4 20 12-12M8 16v-5M8 16h5"/>',
    'node.js': '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m9 9-3 3 3 3m6-6 3 3-3 3"/>',
    javascript: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M11 8v7a2 2 0 0 1-4 0M18 9h-2a2 2 0 0 0 0 4 2 2 0 0 1 0 4h-2"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    devops: '<path d="M7 8a4 4 0 1 0 0 8c4 0 6-8 10-8a4 4 0 1 1 0 8c-4 0-6-8-10-8Z"/>',
    security: '<path d="m12 2 8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>'
  };

  function icon(category) {
    const key = normalize(category) || 'all';
    const known = Object.prototype.hasOwnProperty.call(icons, key) ? key : 'all';
    return `<svg class="category-icon" data-category-icon="${known}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[known]}</svg>`;
  }

  function matches(post, category) {
    const key = normalize(category);
    if (!key || key === 'all') return true;
    const accepted = Object.prototype.hasOwnProperty.call(aliases, key)
      ? aliases[key].map(normalize)
      : [key];
    return Boolean(post && Array.isArray(post.tags) && post.tags.some(tag => accepted.includes(normalize(tag))));
  }

  function available(posts) {
    return definitions.map(definition => ({
      id: definition.id,
      label: definition.label,
      count: posts.filter(post => matches(post, definition.id)).length
    })).filter(definition => definition.count > 0);
  }

  return { definitions, matches, available, icon };
});
