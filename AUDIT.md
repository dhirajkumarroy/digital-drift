# Digital Drift audit — September 21, 2026

Scope: repository code, all 24 public HTML pages, the 18-post registry, local Chrome rendering, and current Google Search guidance. Changes are local; deployment, Search Console, indexing, field performance, and rankings have not been verified. A live homepage fetch was available, but the research tool could not retrieve the live sitemap, robots file, or sampled article; that is not evidence of a production outage.

## Issues fixed

| Priority | Finding | Change |
| --- | --- | --- |
| High | Homepage cards and the archive were empty until JavaScript executed. | The publishing script generates the featured article, six initial cards, and all 18 archive entries as static HTML. Search/filter/pagination remain interactive. |
| High | `_redirects` declared clean routes for only three articles and omitted the privacy page. | Generate clean routes and `.html` canonical redirects for every registered post and static page. Keep a real 404 fallback. Hosting must honor `_redirects`. |
| High | Links referenced nonexistent Node.js and PostgreSQL guide slugs. | Corrected article links and added redirects for both legacy slugs. |
| High | Newsletter forms displayed success without subscribing anyone. Contact used a placeholder endpoint and a false success handler. | RSS is the subscription path. Contact prepares an email draft, explicitly tells visitors to send it, and retains entered text. No email service is configured. |
| High | “React 18,” “Laravel 11,” and “MySQL” sidebar labels opened unrelated articles. A stock photograph was labeled as the author. | Recent article titles/images now come from actual registry entries. Removed the misleading portrait, generic social-network homepage links, and a Terms link pointing to Contact. |
| Medium | Article tables, fixed-width grids, archive rows, and long strings had narrow-layout risks. | Scrollable keyboard-accessible table/code regions, flexible archive/author/related-content layouts, wrapping long text, and a compact mobile header. Removed global horizontal clipping. |
| Medium | Mobile readers had to pass the article list to reach search. | Search now appears above the articles. |
| Medium | Dark mode saved on the homepage was ignored on most other pages. | Shared inline theme initialization respects the saved choice and system preference before styling; storage failures do not break the toggle. |
| Medium | Navigation lacked skip links, menu state announcements, and Escape handling. | Added skip links, focus styles, menu `aria-expanded`/`aria-controls`, Escape-to-close with restored focus, active-page state, live result counts, and larger controls. |
| Medium | Code-copy failures were silent and controls were hidden until hover. | Copy controls remain visible and report failure without claiming success. Reduced-motion preference also applies to scripted scrolling. |
| Medium | Several small labels had insufficient contrast. | Adjusted light/dark text colors and separated button background color from link color. |
| Medium | Breadcrumbs existed only after JavaScript ran. | Generate visible breadcrumbs and matching `BreadcrumbList` JSON-LD in every registered article. Article author metadata links to the author page. |
| Medium | Long search titles obscured the main topic; some descriptions were unnecessarily long. | Shortened 16 article title tags and four descriptions, preserving article headings and content. Homepage metadata now reflects its backend/system-design focus. |
| Medium | Sitemap timestamps changed on every build; RSS dates depended on the machine timezone. | Use article modification dates, omit untracked static-page modification dates, and generate deterministic UTC RSS dates. |
| Medium | Mutable CSS and JavaScript were cached as immutable for a year. | Revalidate mutable assets, update shared asset versions, and add explicit image/feed caching rules. |
| Medium | Fonts loaded through a stylesheet `@import`; local image dimensions were missing. | Discover font CSS from document heads; reserve hero/banner/card space and prioritize above-the-fold images. Remove the artificial card-loading delay. |
| Medium | Preview returned the homepage with HTTP 200 for missing pages and could expose private project paths. | Local server now follows explicit routes, preserves redirect queries, sends genuine 404s, restricts dot paths, and binds to localhost. |
| Medium | The editor and publishing examples could reintroduce `.html` canonical URLs and outdated behavior. | Updated the editor, template, handbook, and shared-header updater. Added a dependency-free site checker. |

## Verification

- `node scripts/build-seo.js`: 23 sitemap URLs, 18 RSS entries, generated article listings, breadcrumbs, and routes.
- `python3 scripts/check-site.py`: 24 public pages; exactly one H1 and main landmark per page; local links/anchors/assets; canonical URLs; meta descriptions; valid JSON-LD/XML; registry/listing/route coverage.
- JavaScript syntax checks, including the editor's embedded scripts.
- Rebuilding generated files produces identical bytes.
- Browser layout, accessibility, and interaction results are recorded below after final checks.

These checks do not establish full WCAG conformance or a Lighthouse/Core Web Vitals score. Browser checks isolate the local application by blocking external requests; third-party availability and production performance require separate measurement.

## Remaining work, in priority order

1. **Deploy and verify crawling.** Publish the generated files together. Check that `/archive`, `/privacy-policy`, all article URLs, `.html` redirects, and a deliberately missing URL return the intended statuses on the actual host. Submit `https://blog.dhirajroy.com/sitemap.xml` in Search Console and inspect representative URLs. No Search Console account data was available in this audit.
2. **Optimize image delivery.** Local JPEGs are about 636–948 KiB; many older articles use external Google-hosted/Unsplash images. Produce appropriately sized WebP/AVIF variants with JPEG fallbacks and `srcset`, and consider hosting licensed copies locally. No image recompression or external-image reliability audit was performed here.
3. **Measure real performance.** Run PageSpeed Insights after deployment and use Search Console field data when available. Target the 75th percentile at LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1. Evaluate actual mobile networks, fonts, analytics, and ads together. These are targets, not measured results. [Web Vitals](https://web.dev/articles/vitals)
4. **Resolve advertising configuration.** Pages include an AdSense script, but the supplied Content Security Policy does not allow its origin. Confirm whether ads are intended; then deliberately configure and test their required origins and layout impact, or remove unused ad loading. This audit preserves the existing advertising policy.
5. **Add email services if desired.** Connect a real newsletter signup URL and verified contact endpoint, then test success, failure, and provider responses. RSS and the email-draft fallback work without an account. Never report an email as delivered solely because a visitor clicked a button.
6. **Strengthen content usefulness.** Prioritize specific reader problems, working sample repositories, tested commands, original diagrams, and clear trade-offs. Link prerequisite and follow-up articles within each topic. Several Spring Boot REST introductions cover overlapping intents; compare their Search Console queries before deciding whether to consolidate them.
7. **Review time-sensitive claims.** Product/pricing/benchmark articles need claim-specific primary sources and a visible verification date. This audit does not certify the technical claims or code examples in every article.

Google recommends useful, reliable content and clear navigation; technical fixes do not guarantee indexing or a top ranking. [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

Static article links reduce reliance on JavaScript rendering for discovery and keep the site useful when scripts fail. [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

The previous handbook promised FAQ accordions from `FAQPage`. Google discontinued FAQ rich results in May 2026; the handbook now reflects that. Existing FAQ markup can still describe visible questions, but is not a ranking shortcut. [Google Search documentation updates](https://developers.google.com/search/updates#may-2026)
