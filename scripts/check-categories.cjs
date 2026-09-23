// Dependency-free browser regression checks. Requires Node 22+ and Chrome/Edge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const categories = require('../js/categories.js');
const posts = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/posts-data.js'), 'utf8') + '; BLOG_POSTS');
const available = categories.available(posts);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function until(check, label, timeout = 12000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await delay(60);
  }
  throw new Error('Timed out: ' + label);
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    } else {
      for (const listener of listeners.get(message.method) || []) listener(message.params);
    }
  });
  return {
    socket,
    on(method, listener) { listeners.set(method, [...(listeners.get(method) || []), listener]); },
    call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 12000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
  };
}

async function main() {
  const executable = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium'
  ].filter(Boolean).find(file => fs.existsSync(file));
  assert.ok(executable, 'Chrome/Edge not found; set CHROME_PATH to its executable');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'digital-drift-categories-'));
  const profile = path.join(output, 'profile');
  fs.mkdirSync(profile);
  const port = Number(process.env.CATEGORY_TEST_PORT || 3457);
  const origin = `http://127.0.0.1:${port}`;
  let server, chrome, page, browser;
  const errors = [];
  try {
    server = spawn(process.execPath, ['scripts/serve.js'], {
      cwd: root, env: { ...process.env, PORT: String(port) }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    });
    let serverReady = false;
    let processError;
    server.on('error', error => { processError = error; });
    server.stdout.on('data', data => { if (String(data).includes('Preview server running')) serverReady = true; });
    await until(() => {
      if (processError) throw processError;
      assert.equal(server.exitCode, null, 'Preview server exited before readiness');
      return serverReady;
    }, 'preview startup');
    chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank'],
    { windowsHide: true, stdio: 'ignore' });
    chrome.on('error', error => { processError = error; });
    const activePort = path.join(profile, 'DevToolsActivePort');
    await until(() => {
      if (processError) throw processError;
      assert.equal(chrome.exitCode, null, 'Browser exited before readiness');
      return fs.existsSync(activePort);
    }, 'browser startup');
    const [debugPort, browserPath] = fs.readFileSync(activePort, 'utf8').trim().split(/\r?\n/);
    browser = await connect(`ws://127.0.0.1:${debugPort}${browserPath}`);
    const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' }).then(response => response.json());
    page = await connect(target.webSocketDebuggerUrl);
    let loads = 0;
    page.on('Page.loadEventFired', () => { loads++; });
    page.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
    page.on('Fetch.requestPaused', event => {
      const local = new URL(event.request.url).origin === origin;
      page.call(local ? 'Fetch.continueRequest' : 'Fetch.failRequest', local
        ? { requestId: event.requestId } : { requestId: event.requestId, errorReason: 'BlockedByClient' }).catch(() => {});
    });
    await page.call('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
    await page.call('Page.enable');
    await page.call('Runtime.enable');
    await page.call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const evaluate = async expression => {
      const result = await page.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const q = selector => `document.querySelector(${JSON.stringify(selector)})`;
    const waitFor = (expression, label) => until(async () => {
      try { return await evaluate(expression); }
      catch (error) {
        if (/Cannot find context|Cannot find default execution context|Execution context was destroyed/.test(error.message)) return false;
        throw error;
      }
    }, label);
    const ready = route => waitFor(`location.href === ${JSON.stringify(origin + route)} && document.readyState === 'complete'`, route);
    const navigate = async route => {
      const previousLoads = loads;
      await page.call('Page.navigate', { url: origin + route });
      await until(() => loads > previousLoads, 'page load: ' + route);
      await ready(route);
    };
    const viewport = width => page.call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    const key = async name => {
      const code = { Enter: 13, Tab: 9, Escape: 27, ' ': 32, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 }[name];
      const params = { key: name, code: name === ' ' ? 'Space' : name, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code };
      const text = name === 'Enter' ? '\r' : name === ' ' ? ' ' : '';
      await page.call('Input.dispatchKeyEvent', {
        ...params, type: text ? 'keyDown' : 'rawKeyDown',
        ...(text ? { text, unmodifiedText: text } : {})
      });
      await page.call('Input.dispatchKeyEvent', { ...params, type: 'keyUp' });
    };
    const checkMenu = async (selector, open, label) => {
      try {
        await until(() => evaluate(`${q(selector)}?.open === ${open}`), label, 2500);
      } catch (error) {
        const state = await evaluate(`(() => {
          const menu=${q(selector)}, summary=menu?.querySelector('summary');
          const rect=summary?.getBoundingClientRect();
          return {url:location.href,selector:${JSON.stringify(selector)},open:menu?.open,
            activeElement:document.activeElement?.outerHTML.slice(0,700),
            summary:summary?.outerHTML,summaryBounds:rect?.toJSON(),
            summaryDisplay:summary && getComputedStyle(summary).display,
            mobileExpanded:document.querySelector('#mobile-menu-btn')?.getAttribute('aria-expanded'),
            elementAtSummary:rect && document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)?.outerHTML.slice(0,700)};
        })()`);
        throw new Error(`${error.message}\nDisclosure state: ${JSON.stringify(state)}`);
      }
    };
    const click = async selector => {
      const point = await evaluate(`(() => {const e=${q(selector)}; if(!e) throw new Error('Missing click target'); e.scrollIntoView({block:'center',behavior:'instant'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height};})()`);
      assert.ok(point.width && point.height, `Visible click target: ${selector}`);
      await page.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
      await page.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    };
    const links = selector => evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].map(e=>e.getAttribute('href'))`);
    const checkOverflow = async label => {
      const bounds = await evaluate('({scroll:document.documentElement.scrollWidth,width:innerWidth})');
      assert.ok(bounds.scroll <= bounds.width + 1, `${label}: horizontal overflow ${JSON.stringify(bounds)}`);
    };
    const checkCategoryIcons = async label => {
      const controls = await evaluate(`({
        counts:document.querySelectorAll('.category-menu .category-count,.category-pill .category-count,.archive-chip .category-count').length,
        items:[...document.querySelectorAll('.category-menu a,.category-pill,.archive-chip')].map(element=>{
          const clone=element.cloneNode(true); clone.querySelectorAll('svg').forEach(icon=>icon.remove());
          return {category:element.dataset.category ?? element.dataset.tag,label:clone.textContent.trim().replace(/\\s+/g,' '),
            href:element.getAttribute('href'),icons:[...element.querySelectorAll('svg.category-icon')].map(icon=>({
              hidden:icon.getAttribute('aria-hidden'),focusable:icon.getAttribute('focusable')}))};
        })
      })`);
      assert.equal(controls.counts, 0, `${label}: category controls have no count badges`);
      assert.ok(controls.items.length > 0, `${label}: category links remain available`);
      for (const control of controls.items) {
        assert.deepEqual(control.icons, [{ hidden: 'true', focusable: 'false' }], `${label}: ${control.category} decorative icon`);
        const category = available.find(item => item.id === control.category);
        if (category) assert.equal(control.label, category.label, `${label}: category label without count`);
        else assert.match(control.label, /^All(?: articles| Topics)?$/i, `${label}: all-category label without count`);
        assert.ok(control.href, `${label}: ${control.category} retains its link`);
      }
    };
    const expected = category => Array.from(posts.filter(post => categories.matches(post, category)), post => post.url);
    const workspaceState = () => evaluate(`({
      code:document.querySelector('#workspace-code').textContent,
      filename:document.querySelector('#workspace-filename').textContent.trim(),
      guide:document.querySelector('#workspace-guide').getAttribute('href'),
      selected:[...document.querySelectorAll('[data-workspace-topic][aria-pressed="true"]')].map(button=>button.dataset.workspaceTopic)
    })`);
    const workspaceVisible = selector => evaluate(`(() => {const element=${q(selector)}; return Boolean(element && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');})()`);
    const selectWorkspaceTopic = async topic => {
      await click(`[data-workspace-topic="${topic}"]`);
      await waitFor(`${q(`[data-workspace-topic="${topic}"]`)}.getAttribute('aria-pressed') === 'true'`, `workspace selects ${topic}`);
      const state = await workspaceState();
      assert.deepEqual(state.selected, [topic], 'Exactly one workspace topic is selected');
      assert.ok(state.code.trim().length > 20 && state.filename, `${topic}: readable code and filename`);
      assert.ok(posts.some(post => post.url === state.guide), `${topic}: guide links to a published article`);
      return state;
    };

    // The hero is rendered UI: exercise its controls, with a page-local clipboard stub.
    await viewport(1440);
    await navigate('/');
    assert.equal(await evaluate(`document.querySelectorAll('#hero-workspace img').length`), 0, 'Workspace scene contains no image');
    assert.equal(await evaluate(`document.querySelectorAll('#hero-workspace .copy-code-btn').length`), 0, 'Generic article copy controls must not be added to the hero');
    assert.equal(await evaluate(`${q('#workspace-status')}.getAttribute('role')`), 'status');
    const samples = {};
    for (const topic of ['node', 'java', 'ai']) samples[topic] = await selectWorkspaceTopic(topic);
    for (const field of ['code', 'filename', 'guide']) {
      assert.equal(new Set(Object.values(samples).map(sample => sample[field])).size, 3, `Topics have distinct ${field}`);
    }
    const expectWorkspaceTopic = async topic => {
      await waitFor(`${q(`[data-workspace-topic="${topic}"]`)}.getAttribute('aria-pressed') === 'true'`, `keyboard selects ${topic}`);
      assert.deepEqual(await workspaceState(), samples[topic], `Keyboard updates ${topic} code, filename and guide`);
    };
    await evaluate(`${q('[data-workspace-topic="node"]')}.focus()`);
    await key('Enter'); await expectWorkspaceTopic('node');
    await key('ArrowRight'); await expectWorkspaceTopic('java');
    await key('Home'); await expectWorkspaceTopic('node');
    await key('End'); await expectWorkspaceTopic('ai');
    await evaluate(`${q('[data-workspace-topic="java"]')}.focus()`);
    await key(' '); await expectWorkspaceTopic('java');
    await click('#workspace-output-toggle');
    assert.equal(await evaluate(`${q('#workspace-output-toggle')}.getAttribute('aria-expanded')`), 'true');
    assert.equal(await evaluate(`${q('#workspace-output')}.hidden`), false);
    assert.equal(await evaluate(`${q('#workspace-output')}.getAttribute('aria-label')`), 'Example response');
    assert.ok(await evaluate(`${q('#workspace-output')}.textContent.trim().length > 0`), 'Preview contains a representative response');
    await click('#workspace-output-toggle');
    assert.equal(await evaluate(`${q('#workspace-output-toggle')}.getAttribute('aria-expanded')`), 'false');
    assert.equal(await evaluate(`${q('#workspace-output')}.hidden`), true);
    await click('#workspace-output-toggle');
    await selectWorkspaceTopic('ai');
    assert.equal(await evaluate(`${q('#workspace-output')}.hidden`), true, 'Topic change hides the previous response');
    assert.equal(await evaluate(`${q('#workspace-output-toggle')}.getAttribute('aria-expanded')`), 'false');
    await evaluate(`window.__workspaceClipboardDescriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard');
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__workspaceCopied=text;}}});`);
    try {
      await click('#workspace-copy');
      await waitFor(`window.__workspaceCopied === ${q('#workspace-code')}.textContent`, 'Copy receives the displayed code');
      await waitFor(`/copied/i.test(${q('#workspace-status')}.textContent)`, 'Copy announces success');
      await evaluate(`navigator.clipboard.writeText=async()=>{window.__workspaceCopyRejected=true;throw new Error('Clipboard rejected by test');};`);
      await click('#workspace-copy');
      await waitFor(`window.__workspaceCopyRejected && ${q('#workspace-status')}.textContent.trim() && !/copied/i.test(${q('#workspace-status')}.textContent)`, 'Copy failure announces useful feedback');
    } finally {
      await evaluate(`if(window.__workspaceClipboardDescriptor) Object.defineProperty(navigator,'clipboard',window.__workspaceClipboardDescriptor); else delete navigator.clipboard;`);
    }
    for (const width of [320, 375, 1024, 1440]) {
      await viewport(width);
      await navigate('/');
      for (const theme of ['light', 'dark']) {
        if (!await evaluate(`document.documentElement.classList.contains(${JSON.stringify(theme)})`)) await click('#theme-toggle');
        await waitFor(`document.documentElement.classList.contains(${JSON.stringify(theme)})`, `workspace ${theme} theme`);
        await checkOverflow(`${width}px ${theme} hero`);
        assert.equal(await workspaceVisible('#workspace-code'), true, 'Hero code is visible');
        assert.equal(await workspaceVisible('#workspace-guide'), true, 'Hero guide is visible');
        const clippedControls = await evaluate(`(() => {
          const scene=${q('#hero-workspace')}.getBoundingClientRect();
          return [...document.querySelectorAll('#hero-workspace button, #workspace-guide')].filter(element=>{
            const r=element.getBoundingClientRect();
            return r.width && (r.left<scene.left || r.right>scene.right || r.top<scene.top || r.bottom>scene.bottom);
          }).map(element=>element.id || element.dataset.workspaceTopic);
        })()`);
        assert.deepEqual(clippedControls, [], 'Hero controls must fit inside the scene');
        const clip = await evaluate(`(() => {const r=${q('#hero-workspace')}.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()`);
        const screenshot = await page.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
        fs.writeFileSync(path.join(output, `hero-${width}-${theme}.png`), Buffer.from(screenshot.data, 'base64'));
      }
    }
    console.log('PASS: hero topics, keyboard, copy feedback, example response and four responsive sizes in both themes');

    for (const width of [375, 1024]) {
      await viewport(width);
      for (const route of ['/', '/archive', posts[0].url]) {
        await navigate(route);
        await checkCategoryIcons(`${width} ${route}`);
        const nav = width < 993 ? '#mobile-menu' : '.nav-desktop';
        if (width < 993) await click('#mobile-menu-btn');
        const menu = `${nav} .nav-categories`;
        const summary = `${menu} summary`;
        await evaluate(`${q(summary)}.focus()`);
        await key('Enter');
        await checkMenu(menu, true, `${width} ${route}: Enter opens category disclosure`);
        await key('Tab');
        assert.equal(await evaluate(`Boolean(document.activeElement.closest(${JSON.stringify(menu + ' .category-menu')}))`), true, 'Tab enters category links');
        await key('Escape');
        await checkMenu(menu, false, 'Escape closes disclosure');
        assert.equal(await evaluate(`document.activeElement === ${q(summary)}`), true, 'Escape restores summary focus');
        if (width < 993) assert.equal(await evaluate(`${q('#mobile-menu-btn')}.getAttribute('aria-expanded')`), 'true', 'Escape keeps mobile drawer available');
        await key(' ');
        await checkMenu(menu, true, 'Space opens disclosure');
        await checkOverflow(`${width} ${route} open category menu`);
        if (route === '/') {
          const screenshot = await page.call('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync(path.join(output, `categories-${width}.png`), Buffer.from(screenshot.data, 'base64'));
        }
        await click('#theme-toggle');
        await checkMenu(menu, false, 'Outside click closes disclosure');
        if (width < 993) await click('#mobile-menu-btn');
        await click(summary);
        await click(`${menu} a[data-category="System Design"]`);
        await ready('/archive?category=System%20Design');
        assert.deepEqual(await links('.archive-item'), expected('System Design'));
        assert.equal(await evaluate(`document.querySelectorAll('.nav-categories[open]').length`), 0, 'Category selection closes menus');
        await checkOverflow(`${width} selected archive`);
      }
      console.log(`PASS: ${width}px category menus, keyboard, navigation and overflow`);
    }

    for (const category of available) {
      await navigate('/archive?category=' + encodeURIComponent(category.id));
      assert.deepEqual(await links('.archive-item'), expected(category.id), `${category.id}: archive results`);
      const active = await evaluate(`[...document.querySelectorAll('.nav-desktop .category-menu a[aria-current]')].map(e=>e.dataset.category)`);
      assert.deepEqual(active, [category.id], `${category.id}: current navigation link`);
      await navigate('/?category=' + encodeURIComponent(category.id));
      assert.deepEqual(await links('.blog-card .card-title a'), expected(category.id).slice(0, 6), `${category.id}: homepage results`);
    }
    for (const [route, input, results, reset, count] of [
      ['/?category=System%20Design', '#search-input', '.blog-card', '#clear-filters-btn', Math.min(6, posts.length)],
      ['/archive?category=System%20Design', '#archive-search-input', '.archive-item', '#archive-list button', posts.length]
    ]) {
      await navigate(route);
      await click(input);
      await page.call('Input.insertText', { text: 'nonexistent category audit xyz' });
      await waitFor(`document.querySelectorAll(${JSON.stringify(results)}).length === 0`, 'search empty state');
      await click(reset);
      await waitFor(`document.querySelectorAll(${JSON.stringify(results)}).length === ${count}`, 'clear filters restores articles');
      assert.equal(await evaluate(`${q(input)}.value`), '');
      assert.equal(await evaluate(`new URLSearchParams(location.search).has('category')`), false);
    }
    await viewport(375);
    await navigate('/');
    await click('#mobile-menu-btn');
    await click('#mobile-menu .nav-categories summary');
    await viewport(1024);
    await waitFor(`${q('#mobile-menu-btn')}.getAttribute('aria-expanded') === 'false'`, 'resize closes mobile menu');
    assert.equal(await evaluate(`document.querySelectorAll('.nav-categories[open]').length`), 0);

    await page.call('Emulation.setScriptExecutionDisabled', { value: true });
    for (const width of [375, 1024]) {
      await viewport(width);
      await navigate('/');
      assert.equal(await evaluate(`typeof window.BlogCategories`), 'undefined', 'Page JavaScript is disabled');
      assert.equal(await workspaceVisible('#workspace-code'), true, 'Initial hero code remains visible without JavaScript');
      assert.equal(await workspaceVisible('#workspace-guide'), true, 'Initial hero guide remains visible without JavaScript');
      const fallback = await workspaceState();
      assert.ok(fallback.code.trim() && posts.some(post => post.url === fallback.guide), 'Static hero has real code and a published guide');
      assert.equal(await evaluate(`[...document.querySelectorAll('#hero-workspace button')].some(button=>button.getClientRects().length && getComputedStyle(button).visibility !== 'hidden')`), false, 'Hero interaction controls are hidden without JavaScript');
      await checkCategoryIcons(`${width} no JavaScript`);
      const menu = `${width < 993 ? '#mobile-menu' : '.nav-desktop'} .nav-categories`;
      await click(`${menu} summary`);
      await checkMenu(menu, true, 'Native category disclosure works without JavaScript');
      assert.equal((await links(`${menu} a[data-category]`)).length, available.length + 1);
      await checkOverflow(`${width} no-JavaScript disclosure`);
      await click(`${menu} a[data-category="System Design"]`);
      await ready('/archive?category=System%20Design');
      assert.equal((await links('.archive-item')).length, posts.length, 'Static archive remains readable without JavaScript');
    }
    assert.deepEqual(errors, [], 'No browser runtime exceptions');
    console.log(`PASS: ${available.length} category memberships, search reset, resize and no-JavaScript navigation. Screenshots: ${output}`);
  } finally {
    if (browser) await browser.call('Browser.close').catch(() => {});
    if (page) page.socket.close();
    if (browser) browser.socket.close();
    if (chrome && chrome.exitCode === null) chrome.kill();
    if (server && server.exitCode === null) server.kill();
    // Delete only this run's fresh browser profile; retain screenshots for inspection.
    const resolvedProfile = path.resolve(profile);
    if (resolvedProfile.startsWith(path.resolve(os.tmpdir()) + path.sep) && resolvedProfile === path.join(output, 'profile')) {
      try { fs.rmSync(resolvedProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch (_) { /* A browser process may still be exiting. */ }
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
