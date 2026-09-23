const fs = require('node:fs');
const path = require('node:path');

module.exports = function buildHero() {
  const root = path.resolve(__dirname, '..');
  const filename = path.join(root, 'index.html');
  const original = fs.readFileSync(filename, 'utf8');
  const component = fs.readFileSync(path.join(root, 'components/hero-workspace.html'), 'utf8').trim();
  const slot = /<!-- component:hero-workspace:start -->[\s\S]*?<!-- component:hero-workspace:end -->/;
  if (!slot.test(original)) throw new Error('Missing homepage hero component slot');
  const html = original.replace(slot, () => `<!-- component:hero-workspace:start -->\n${component}\n<!-- component:hero-workspace:end -->`);
  if (html !== original) fs.writeFileSync(filename, html);
};
