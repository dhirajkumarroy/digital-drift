const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync, spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const posts = vm.runInNewContext(read('js/posts-data.js') + '; BLOG_POSTS');

async function main() {
  const generated = ['index.html', 'archive.html', '_redirects'];
  const before = generated.map(read);
  execFileSync(process.execPath, ['scripts/build-seo.js'], { cwd: root });
  assert.deepEqual(generated.map(read), before, 'Listing builds must be repeatable');
  assert.equal((read('index.html').match(/class="blog-card"/g) || []).length, 6);
  assert.equal((read('archive.html').match(/class="archive-item"/g) || []).length, posts.length);
  assert.ok(!read('index.html').includes('>0 articles<'));
  for (const post of posts) {
    assert.ok(read('archive.html').includes(`href="${post.url}"`));
    assert.ok(read('_redirects').includes(`${post.url} ${post.url}.html 200`));
  }
  const source = read('js/script.js');
  new vm.Script(source, { filename: 'js/script.js' });
  const categoryHelpers = source.slice(source.indexOf('  function tagsMatch('), source.indexOf('  function getTagHtml('));
  const filter = source.slice(source.indexOf('  function getFilteredPosts()'), source.indexOf('  function renderFeatured()'));
  for (const tag of ['Laravel', 'Frontend']) {
    assert.equal(vm.runInNewContext(categoryHelpers + filter + '; getFilteredPosts().length', {
      BLOG_POSTS: [{ tags: ['Backend'], title: 'Backend', summary: 'Backend guide' }], activeTag: tag, searchQuery: ''
    }), 0, `${tag} must not show unrelated articles`);
  }
  const expectedSystemDesign = Array.from(posts.filter(post => post.tags.includes('System Design')), post => post.url);
  assert.ok(expectedSystemDesign.includes('/post/system-design-url-shortener-tinyurl'));
  for (const category of ['System%20Design', 'system+design', '%20System%20Design%20']) {
    const matching = vm.runInNewContext(categoryHelpers + filter + `
      const activeTag = readCategoryFromUrl();
      getFilteredPosts().map(post => post.url);
    `, {
      BLOG_POSTS: posts, searchQuery: '', URLSearchParams,
      window: { location: { search: '?category=' + category } }
    });
    assert.deepEqual(Array.from(matching), expectedSystemDesign, `Category URL must select only System Design posts: ${category}`);
  }
  assert.equal(vm.runInNewContext(categoryHelpers + filter + '; getFilteredPosts().length', {
    BLOG_POSTS: posts, activeTag: 'System Design', searchQuery: 'TinyURL'
  }), 1, 'Search must narrow the selected category');
  assert.equal(vm.runInNewContext(categoryHelpers + filter + '; getFilteredPosts().length', {
    BLOG_POSTS: posts, activeTag: 'Unknown category', searchQuery: ''
  }), 0, 'Unknown categories must not show unrelated posts');
  for (const pathname of ['/', '/archive']) {
    let changedUrl;
    const location = new URL(`https://blog.dhirajroy.com${pathname}?ref=test#articles-section`);
    const context = vm.createContext({
      URL, URLSearchParams,
      window: { location, history: { replaceState(_state, _title, url) {
        changedUrl = new URL(url, location);
        location.href = changedUrl.href;
      } } }
    });
    vm.runInContext(categoryHelpers + '; syncCategoryUrl("System Design");', context);
    assert.equal(changedUrl.searchParams.get('category'), 'System Design');
    assert.equal(vm.runInContext('readCategoryFromUrl()', context), 'System Design');
    assert.equal(changedUrl.pathname, pathname);
    assert.equal(changedUrl.searchParams.get('ref'), 'test');
    assert.equal(changedUrl.hash, '#articles-section');
    vm.runInContext('syncCategoryUrl(null)', context);
    assert.equal(changedUrl.searchParams.has('category'), false, 'All must clear the category from the URL');
    assert.equal(vm.runInContext('readCategoryFromUrl()', context), '');
    assert.equal(changedUrl.searchParams.get('ref'), 'test');
    assert.equal(changedUrl.hash, '#articles-section');
  }
  const server = spawn(process.execPath, ['scripts/serve.js'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', code => reject(new Error(`Preview exited: ${code}`))); });
    for (const [url, status, text] of [
      ['/', 200, 'class="blog-card"'], ['/archive', 200, 'class="archive-item"'],
      ['/admin/', 200, 'Generate'], ['/disclaimer', 200, 'Disclaimer'],
      ['/missing-article', 404, '404'], ['/%2e%2e%5cREADME.md', 403, 'Forbidden'],
      ['/.git/config', 403, 'Forbidden'], ['/%ZZ', 400, 'Bad Request']
    ]) {
      const response = await fetch('http://localhost:3456' + url);
      assert.equal(response.status, status, url);
      assert.ok((await response.text()).includes(text), url);
    }
    for (const post of posts) {
      assert.equal((await fetch('http://localhost:3456' + post.url)).status, 200, post.url);
    }
  } finally { server.kill(); }
  console.log(`Checks passed: static listings, repeatable build, runtime syntax, category URLs, filters, preview routes, and ${posts.length} articles.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
