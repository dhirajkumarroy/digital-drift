#!/usr/bin/env python3
"""Dependency-free checks for published HTML, internal links, and SEO output."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = 'https://blog.dhirajroy.com'

class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.tags = []
        self.schemas = []
        self.schema = None
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.schema = ''

    def handle_data(self, data):
        if self.schema is not None:
            self.schema += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema))
            self.schema = None

    def select(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]

files = sorted(ROOT.glob('*.html')) + sorted(p for p in (ROOT / 'post').glob('*.html') if not p.name.startswith('_'))
pages = {file: Page(file) for file in files}
errors = []
def check(condition, message):
    if not condition:
        errors.append(message)

for file, page in pages.items():
    label = str(file.relative_to(ROOT))
    ids = [attrs['id'] for _, attrs in page.tags if 'id' in attrs]
    duplicates = [key for key, count in Counter(ids).items() if count > 1]
    check(not duplicates, f'{label}: duplicate IDs {duplicates}')
    check(len(page.select('h1')) == 1, f'{label}: expected exactly one H1')
    check(len(page.select('main')) == 1, f'{label}: expected one main landmark')
    check('main-content' in ids, f'{label}: missing skip-link destination')
    if file.name != '404.html':
        canonical = [a.get('href') for a in page.select('link') if a.get('rel') == 'canonical']
        expected = DOMAIN + ('/' if file.name == 'index.html' else '/' + str(file.relative_to(ROOT).with_suffix('')))
        check(canonical == [expected], f'{label}: incorrect canonical {canonical}')
        check(len([a for a in page.select('meta') if a.get('name') == 'description' and a.get('content')]) == 1, f'{label}: missing description')
        check(not any('noindex' in a.get('content', '') for a in page.select('meta') if a.get('name') == 'robots'), f'{label}: published page is noindex')
    for image in page.select('img'):
        check('alt' in image, f'{label}: image is missing alt text')
    for tag, attrs in page.tags:
        link = attrs.get('href') if tag in ('a', 'link') else attrs.get('src') if tag in ('img', 'script') else None
        if not link:
            continue
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        local = unquote(url.path)
        target = (ROOT / local.lstrip('/')) if local.startswith('/') else file.parent / local if local else file
        if target.is_dir():
            target = target / 'index.html'
        if not target.exists() and not target.suffix:
            target = target.with_suffix('.html')
        check(target.is_file(), f'{label}: broken local URL {link}')
        if url.fragment and target in pages:
            target_ids = [a['id'] for _, a in pages[target].tags if 'id' in a]
            check(unquote(url.fragment) in target_ids, f'{label}: missing anchor {link}')

registry = (ROOT / 'js/posts-data.js').read_text()
post_urls = re.findall(r'url:\s*"([^"]+)"', registry)
sitemap = ET.parse(ROOT / 'sitemap.xml')
locations = [node.text for node in sitemap.findall('.//{*}loc')]
check(len(locations) == len(set(locations)), 'Sitemap contains duplicate URLs')
for url in post_urls:
    check(DOMAIN + url in locations, f'Sitemap missing {url}')
    check(f'href="{url}"' in (ROOT / 'archive.html').read_text(), f'Static archive missing {url}')
    check(f'{url} {url}.html 200' in (ROOT / '_redirects').read_text(), f'Missing clean route {url}')
    check(f'{url}.html {url} 301' in (ROOT / '_redirects').read_text(), f'Missing canonical redirect {url}')
feed = ET.parse(ROOT / 'feed.xml')
check(len(feed.findall('./channel/item')) == len(post_urls), 'RSS item count differs from registry')
check('YOUR_FORMSPREE_ID' not in (ROOT / 'contact.html').read_text(), 'Contact form still has a placeholder endpoint')
check('Thank you for subscribing' not in (ROOT / 'js/script.js').read_text(), 'Newsletter still claims a fake subscription')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} public pages; local URLs and anchors; metadata and JSON-LD; {len(locations)} sitemap URLs; {len(post_urls)} RSS and archive entries.')
