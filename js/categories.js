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

  return { definitions, matches, available };
});
