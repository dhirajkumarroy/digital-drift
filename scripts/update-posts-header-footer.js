const fs = require('node:fs');
const path = require('node:path');

// Keep one source for shared article navigation instead of a second stale copy.
const postDir = path.join(__dirname, '..', 'post');
const template = fs.readFileSync(path.join(postDir, '_template.html'), 'utf8');
const header = template.match(/<body>[\s\S]*?(?=<main\b)/)?.[0];
const footer = template.match(/<\/main>[\s\S]*?<\/footer>/)?.[0];
if (!header || !footer) throw new Error('The post template is missing shared layout markers.');

let updatedCount = 0;
for (const file of fs.readdirSync(postDir).filter(file => file.endsWith('.html') && !file.startsWith('_'))) {
  const filePath = path.join(postDir, file);
  const original = fs.readFileSync(filePath, 'utf8');
  if (!/<body>[\s\S]*?<main\b/.test(original) || !/<\/main>[\s\S]*?<\/footer>/.test(original)) {
    throw new Error(`Cannot locate shared layout in ${file}`);
  }
  const content = original
    .replace(/<body>[\s\S]*?(?=<main\b)/, () => header)
    .replace(/<\/main>[\s\S]*?<\/footer>/, () => footer)
    .replace(/(style\.css|posts-data\.js|script\.js)\?v=\d+/g, '$1?v=7');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    updatedCount++;
  }
}
console.log(`Updated shared navigation in ${updatedCount} posts. Run build-seo.js and check-site.py before publishing.`);
