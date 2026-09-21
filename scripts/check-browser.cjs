const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const outputDir = process.env.AUDIT_OUTPUT || path.join(require('node:os').tmpdir(), 'digital-drift-audit');
fs.mkdirSync(outputDir, {recursive: true});
(async () => {
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'});
 // Keep checks deterministic and avoid analytics/ad traffic.
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());
 const page=await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const routes=['/','/archive','/about','/contact','/privacy-policy','/404.html',...fs.readdirSync(root+'/post').filter(f=>f.endsWith('.html')&&!f.startsWith('_')).map(f=>'/post/'+f.replace('.html',''))];
 const overflow=[];
 const widths=[320,375,768,1024,1440];
 for (const width of widths) {
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   const response=await page.goto('http://localhost:3456'+route,{waitUntil:'load'});
   assert.equal(response.status(),200,route);
   const details=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1)&&!e.closest('pre,.table-scroll,.filter-bar');}).slice(0,6).map(e=>e.tagName+'.'+e.className)}));
   if(details.scroll>width+1)overflow.push({route,width,...details});
  }
  console.log('Layout checks complete:',width);
 }
 const accessibility=[];
 for(const theme of ['light','dark']){
  await page.setViewportSize({width:375,height:900});
  await page.evaluate(t=>localStorage.setItem('theme',t),theme);
  for(const route of ['/','/archive','/about','/contact','/privacy-policy','/404.html','/post/system-design-url-shortener-tinyurl','/post/nodejs-jwt-auth']){
   await page.goto('http://localhost:3456'+route);
   assert(await page.locator('html').evaluate((e,t)=>e.classList.contains(t),theme),`${route}: theme persistence`);
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   for(const v of result.violations)accessibility.push({route,theme,id:v.id,impact:v.impact,nodes:v.nodes.slice(0,4).map(n=>({target:n.target,summary:n.failureSummary}))});
  }
  console.log('Accessibility checks complete:',theme);
 }
 fs.writeFileSync(path.join(outputDir, 'results.json'),JSON.stringify({overflow,errors,accessibility},null,2));

 await page.goto('http://localhost:3456/');
 await page.locator('#mobile-menu-btn').click();assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),'false');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'mobile-menu-btn');
 await page.locator('#search-input').fill('nonexistent query xyz');await page.waitForFunction(()=>document.querySelectorAll('.blog-card').length===0,{},{timeout:5000});
 await page.locator('#clear-filters-btn').click();assert.equal(await page.locator('.blog-card').count(),6);
 await page.locator('#pg-next').click();assert.equal(await page.locator('.page-btn[aria-current="page"]').textContent(),'2');
 await page.goto('http://localhost:3456/?category=System%20Design');assert.equal(await page.locator('.blog-card').count(),2);assert.equal(await page.locator('#featured-post').isVisible(),false);
 await page.goto('http://localhost:3456/?category=Laravel');assert.equal(await page.locator('.blog-card').count(),0);
 await page.goto('http://localhost:3456/archive?category=System%20Design');assert.equal(await page.locator('.archive-item').count(),2);
 await page.goto('http://localhost:3456/contact');
 await page.locator('#contact-name').fill('Audit Tester');await page.locator('#contact-email').fill('audit@example.com');await page.locator('#contact-subject').fill('Draft test');await page.locator('#contact-message').fill('This should stay in the form.');
 await page.locator('button[type="submit"]').click();assert.match(await page.locator('#contact-form-status').textContent(),/draft is ready/);assert.equal(await page.locator('#contact-message').inputValue(),'This should stay in the form.');
 const missing=await context.request.get('http://localhost:3456/missing-audit-page');assert.equal(missing.status(),404);
 const redirect=await context.request.get('http://localhost:3456/post/nodejs-jwt-auth.html?test=1',{maxRedirects:0});assert.equal(redirect.status(),301);assert.equal(redirect.headers().location,'/post/nodejs-jwt-auth?test=1');
 const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());
 const np=await nojs.newPage();await np.goto('http://localhost:3456/archive');assert.equal(await np.locator('.archive-item').count(),18);await np.goto('http://localhost:3456/');assert.equal(await np.locator('.blog-card').count(),6);assert.equal(await np.locator('.featured-card').count(),1);await nojs.close();
 await page.evaluate(()=>localStorage.setItem('theme','light'));await page.goto('http://localhost:3456/');await page.screenshot({path:path.join(outputDir, 'home-mobile.png')});
 await page.goto('http://localhost:3456/post/system-design-url-shortener-tinyurl');await page.screenshot({path:path.join(outputDir, 'article-mobile.png')});
 console.log(JSON.stringify({pages:routes.length,viewports:widths.length,overflow,errors,accessibility,interactions:'passed',noJavaScript:'passed'},null,2));
 fs.writeFileSync(path.join(outputDir, 'results.json'),JSON.stringify({pages:routes.length,viewports:widths.length,overflow,errors,accessibility},null,2));
 await browser.close();
 if(overflow.length||errors.length||accessibility.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
