"""Audit rendered pages after npm run build; no browser or extra packages required."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.assets, self.images = [], [], [], []
        self.meta, self.canonical = {}, None
        self.h1 = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag in ('img', 'script', 'source') and attrs.get('src'):
            self.assets.append(attrs['src'])
        if attrs.get('poster'):
            self.assets.append(attrs['poster'])
        if attrs.get('srcset'):
            self.assets.extend(part.strip().split()[0] for part in attrs['srcset'].split(','))
        if tag == 'link':
            if attrs.get('rel') == 'canonical':
                self.canonical = attrs.get('href')
            else:
                self.assets.append(attrs.get('href', ''))
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'h1':
            self.h1 += 1
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property', ''))] = attrs.get('content', '')


pages, errors = {}, []
for path in Path('dist').rglob('*.html'):
    url = '/' + path.relative_to('dist').as_posix()
    if url.endswith('index.html'):
        url = url[:-10].rstrip('/') or '/'
    page = Page()
    page.feed(path.read_text(encoding='utf-8'))
    pages[url] = page

if '/' not in pages:
    errors.append('Homepage missing from build output')
for url, page in pages.items():
    if page.h1 != 1:
        errors.append(f'{url}: expected one h1, got {page.h1}')
    for name in ('description', 'og:title', 'og:description', 'og:image', 'twitter:card'):
        if not page.meta.get(name):
            errors.append(f'{url}: missing {name}')
    for element_id, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f'{url}: duplicate id {element_id}')
    for image in page.images:
        if not all(key in image for key in ('width', 'height', 'alt')):
            errors.append(f'{url}: missing image dimensions or alt: {image.get("src")}')
    for asset in page.assets + [page.meta.get('og:image', '')]:
        if asset.startswith('/') and not Path('dist' + unquote(urlsplit(asset).path)).is_file():
            errors.append(f'{url}: missing asset {asset}')
    for href in page.links:
        parsed = urlsplit(href)
        if parsed.scheme or parsed.netloc:
            continue
        target = (parsed.path.rstrip('/') or '/') if parsed.path else url
        if target in pages:
            if parsed.fragment and parsed.fragment not in pages[target].ids:
                errors.append(f'{url}: missing anchor {href}')
        elif parsed.path and not Path('dist' + parsed.path).exists():
            errors.append(f'{url}: missing page {href}')
    if page.canonical and urlsplit(page.canonical).hostname in ('localhost', '127.0.0.1'):
        errors.append(f'{url}: local canonical URL')

not_found = pages.get('/404.html')
if not_found is None or not not_found.meta.get('robots', '').startswith('noindex'):
    errors.append('404 page must exist and use noindex')
if not_found and not_found.canonical:
    errors.append('404 page should not advertise a canonical URL')
for endpoint in ('robots.txt', 'sitemap.xml'):
    if not Path('dist', endpoint).is_file():
        errors.append(f'Missing {endpoint}')

for error in errors:
    print('FAIL:', error)
print(f'Audited {len(pages)} HTML pages: {len(errors)} error(s).')
print('Visual layout and interactive behavior still require a browser check.')
sys.exit(bool(errors))
