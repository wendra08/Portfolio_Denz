import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('src/i18n/catalog.json'));
const extra = JSON.parse(read('src/i18n/extra.json'));
const source = stripTypeScriptTypes(read('src/i18n/client.ts').replace(/^import .*;$/gm, '').replace(/^export /gm, ''));
const listeners = new Map();
const textNodes = [];
const attributes = [];
const root = { lang: 'id' };
const storage = new Map();
let mutation;
const context = {
  catalog, extra, NodeFilter: { SHOW_TEXT: 4 },
  localStorage: { setItem: (key, value) => storage.set(key, value) },
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  MutationObserver: class { constructor(callback) { mutation = callback; } disconnect() {} observe() {} },
  document: {
    documentElement: root,
    createTreeWalker() { let i = -1; return { nextNode() { return ++i < textNodes.length; }, get currentNode() { return textNodes[i]; } }; },
    querySelectorAll: () => attributes,
    querySelector: () => null,
    dispatchEvent(event) { listeners.get(event.type)?.(event); },
    addEventListener(type, callback) { listeners.set(type, callback); },
  },
};
function text(value, ignored = false) {
  const node = { data: value, parentElement: { closest: () => ignored ? {} : null } };
  textNodes.push(node);
  return node;
}
function attribute(value, tagName = 'INPUT') {
  const map = new Map([['placeholder', value]]);
  const element = { tagName, value: 'User input stays intact', closest: (selector) => tagName === 'TEXTAREA' && selector.includes('textarea') ? {} : null,
    getAttribute: (key) => map.get(key) ?? null, setAttribute: (key, val) => map.set(key, val) };
  attributes.push(element);
  return element;
}
const heading = text('  Why Kang Denz\n');
const prose = text('MC jebolan pesantren.');
const userText = text('Experience', true);
const placeholder = attribute('Nama lengkap');
const textarea = attribute('Ceritakan pengalaman dan kemampuan MC yang ingin dipelajari...', 'TEXTAREA');
runInNewContext(source, context);
context.watchTranslations();
assert.equal(heading.data, '  Mengapa Kang Denz\n');
context.setLanguage('en');
assert.equal(root.lang, 'en');
assert.equal(storage.get('kang-denz-language'), 'en');
assert.equal(heading.data, '  Why Kang Denz\n');
assert.match(prose.data, /Islamic boarding school/);
assert.equal(placeholder.getAttribute('placeholder'), 'Full name');
assert.match(textarea.getAttribute('placeholder'), /Tell us about your experience/);
assert.equal(userText.data, 'Experience');
assert.equal(textarea.value, 'User input stays intact');
const late = text('Jam Acara Akad');
mutation();
assert.equal(late.data, 'Ceremony Time');
late.data = 'Jam Acara Resepsi';
mutation();
assert.equal(late.data, 'Reception Time');
context.setLanguage('id');
assert.equal(late.data, 'Jam Acara Resepsi');
assert.equal(placeholder.getAttribute('placeholder'), 'Nama lengkap');
context.localStorage.setItem = () => { throw new Error('Storage denied'); };
assert.doesNotThrow(() => context.setLanguage('en'));

// Exercise the real booking initializer with both languages and stable radio values.
const booking = read('src/components/Booking.astro').split('<script>')[1].split('</script>')[0].replace(/^\s*import .*;$/gm, '');
let selected = 'Book Kang Denz', change, submit, opened;
const fields = {}, labels = {}, chat = {};
for (const [id, name] of Object.entries({ name:'name', date:'date', time:'time', akad:'akadTime', resepsi:'receptionTime', event:'event', guests:'guests', location:'location', message:'message' })) {
  const wrapper = { hidden: false };
  fields[`#booking-${id}`] = { id:`booking-${id}`, name, value:'', disabled:false, dataset:{}, closest:() => wrapper,
    replaceChildren(...options) { this.options = options; this.value = ''; } };
  labels[`label[for="booking-${id}"]`] = { textContent: id === 'name' ? 'Nama' : id === 'akad' ? 'Jam Acara Akad' : id === 'resepsi' ? 'Jam Acara Resepsi' : id };
}
const form = { addEventListener(type, callback) { if (type === 'submit') submit = callback; }, reportValidity:() => true };
const section = { dataset:{}, querySelectorAll:() => [], addEventListener(type, callback) { change = callback; },
  querySelector(key) { return key === '#booking-form' ? form : key === '#booking-direct-whatsapp' ? chat : fields[key] ?? labels[key] ?? null; } };
const bookingContext = { document:{ querySelector:() => section, addEventListener() {} },
  window:{ IntersectionObserver:true, open(url) { opened = url; } }, IntersectionObserver:class { observe() {} },
  FormData:class extends Map { constructor() { super([['service', selected], ...Object.values(fields).filter((field) => !field.disabled).map((field) => [field.name, field.value])]); } },
  Option:class { constructor(label, value) { this.label = label; this.value = value; } },
  translate:context.translate, currentLanguage:context.currentLanguage, Date, Intl, encodeURIComponent };
runInNewContext(stripTypeScriptTypes(booking), bookingContext);
for (const language of ['id', 'en']) {
  context.setLanguage(language);
  for (const service of ['Natsume Photo', 'Book Kang Denz', 'Nata Manten', 'MC Class']) {
    selected = service; change();
    const wedding = service === 'Book Kang Denz' || service === 'Nata Manten';
    fields['#booking-event'].value = wedding ? 'Akad & Resepsi' : service === 'Natsume Photo' ? 'Studio Photography' : 'Private Intensive'; change();
    fields['#booking-name'].value = 'Rina'; fields['#booking-date'].value = '2026-12-12'; fields['#booking-message'].value = 'Experience\nPesan asli';
    fields['#booking-location'].value = 'Venue lama'; fields['#booking-akad'].value = '08:00'; fields['#booking-resepsi'].value = '11:00';
    change(); submit({ preventDefault() {} });
    const url = new URL(opened), message = url.searchParams.get('text');
    assert.equal(url.pathname, service === 'Natsume Photo' ? '/6282116428887' : '/6281313216466');
    assert.ok(message.includes('Experience\nPesan asli'));
    assert.equal(message.includes('Venue lama'), wedding);
    assert.ok(message.includes(language === 'en' ? 'Service:' : 'Layanan:'));
    if (wedding) assert.ok(message.includes(language === 'en' ? 'Ceremony Time: 08:00' : 'Jam Acara Akad: 08:00'));
    assert.equal(chat.href, opened);
  }
  selected = 'MC Class'; change();
  assert.deepEqual(Array.from(fields['#booking-event'].options, (option) => option.value), ['', 'Private Mentoring', 'Private Intensive', 'Small Class']);
  for (const program of ['Private Mentoring', 'Private Intensive', 'Small Class']) {
    fields['#booking-event'].value = program; change(); submit({ preventDefault() {} });
    const url = new URL(opened);
    assert.equal(url.pathname, '/6281313216466');
    assert.ok(url.searchParams.get('text').includes(context.translate(program)));
  }
}

// Language gate: new visitors must choose; returning visitors retain their choice.
const picker = read('src/components/LanguagePicker.astro').split('<script>')[1].split('</script>')[0].replace(/^\s*import .*;$/gm, '');
for (const saved of [null, 'en', 'id']) {
  const handlers = {}, clicks = {};
  let isOpen = false, applied = null;
  const dialog = { dataset:{}, showModal() { isOpen = true; }, close() { isOpen = false; }, addEventListener(type, cb) { handlers[type] = cb; },
    querySelectorAll:() => ['id', 'en'].map((lang) => ({ dataset:{language:lang}, addEventListener(type, cb) { clicks[lang] = cb; } })) };
  const switcher = { addEventListener(type, cb) { handlers.switch = cb; }, setAttribute() {}, focus() {} };
  runInNewContext(stripTypeScriptTypes(picker), { document:{querySelector:(q) => q === '#language-picker' ? dialog : switcher, addEventListener() {}},
    localStorage:{getItem:() => saved}, setLanguage:(lang) => { applied = lang; }, translate:(s) => s, watchTranslations() {} });
  assert.equal(isOpen, saved === null);
  if (saved) assert.equal(applied, saved);
  let prevented = false; handlers.cancel({preventDefault() { prevented = true; }}); assert.equal(prevented, saved === null);
  clicks.en(); assert.equal(applied, 'en'); assert.equal(isOpen, false);
  handlers.switch(); assert.equal(isOpen, true);
}
console.log('PASS: translation round trips, dynamic content, placeholders, storage, language gate, user input, booking recipients, and bilingual WhatsApp messages.');
