import catalog from './catalog.json';
import extra from './extra.json';

export type Language = 'id' | 'en';
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const dictionary = new Map<string, readonly string[]>();
for (const [source, pair] of Object.entries(catalog)) dictionary.set(source, pair);
for (const pair of [...Object.values(catalog), ...extra]) {
  for (const text of pair) if (!dictionary.has(normalize(text))) dictionary.set(normalize(text), pair);
}
// Explicit UI pairs take priority over translated prose with the same wording.
for (const pair of extra) for (const text of pair) dictionary.set(normalize(text), pair);

export function currentLanguage(): Language {
  return document.documentElement.lang === 'en' ? 'en' : 'id';
}

export function translate(text: string, language = currentLanguage()): string {
  const pair = dictionary.get(normalize(text));
  return pair ? pair[language === 'id' ? 0 : 1] : text;
}

const textMemory = new WeakMap<Text, { source: string; last: string }>();
const attributeMemory = new WeakMap<Element, Map<string, { source: string; last: string }>>();
const ignored = 'script, style, svg, noscript, [data-no-translate], textarea';
let observer: MutationObserver | undefined;

export function translatePage() {
  observer?.disconnect();
  const language = currentLanguage();
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.parentElement || node.parentElement.closest(ignored) || !node.data.trim()) continue;
    let state = textMemory.get(node);
    if (!state || node.data !== state.last) state = { source: node.data, last: node.data };
    const translated = translate(state.source, language);
    const next = translated === state.source ? state.source : state.source.replace(/\S[\s\S]*\S|\S/, translated);
    if (node.data !== next) node.data = next;
    state.last = next;
    textMemory.set(node, state);
  }
  for (const element of document.querySelectorAll('[placeholder], [aria-label], [alt], [title], meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]')) {
    if (element.closest('script, style, svg, noscript, [data-no-translate]')) continue;
    const records = attributeMemory.get(element) ?? new Map();
    for (const key of ['placeholder', 'aria-label', 'alt', 'title', ...(element.tagName === 'META' ? ['content'] : [])]) {
      const value = element.getAttribute(key);
      if (value === null) continue;
      let state = records.get(key);
      if (!state || value !== state.last) state = { source: value, last: value };
      const next = translate(state.source, language);
      if (next !== value) element.setAttribute(key, next);
      state.last = next;
      records.set(key, state);
    }
    attributeMemory.set(element, records);
  }
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'en' ? 'en_US' : 'id_ID');
  observer?.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'alt', 'title'] });
}

export function setLanguage(language: Language) {
  document.documentElement.lang = language;
  try { localStorage.setItem('kang-denz-language', language); } catch { /* The current page still works when storage is blocked. */ }
  translatePage();
  document.dispatchEvent(new CustomEvent('site:language-change', { detail: language }));
}

export function watchTranslations() {
  if (observer) return;
  observer = new MutationObserver(() => translatePage());
  translatePage();
}
