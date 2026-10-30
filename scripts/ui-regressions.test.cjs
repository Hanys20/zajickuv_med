const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
// Load the actual TS/TSX components without adding a test framework dependency.
function sourceLoader(react = { ...React, useLayoutEffect: React.useEffect }, browser = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(root, filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = { exports: {} };
    cache.set(filename, mod);
    const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    function localRequire(id) {
      if (id === 'react') return react;
      let target;
      if (id.startsWith('@/')) target = path.join(root, 'src', id.slice(2));
      else if (id.startsWith('@content/')) target = path.join(root, 'content', id.slice(9));
      else if (id.startsWith('.')) target = path.resolve(path.dirname(filename), id);
      else return require(id);
      if (target.endsWith('.json')) return require(target);
      const file = [target, target + '.ts', target + '.tsx'].find(existsSync);
      if (!file) throw new Error('Missing source: ' + target);
      return load(file);
    }
    new Function('require', 'module', 'exports', 'window', 'document', 'sessionStorage', 'Image', code)(
      localRequire, mod, mod.exports, browser.window, browser.document, browser.storage, browser.Image,
    );
    return mod.exports;
  }
  return load;
}

const load = sourceLoader();
const ProductsPricing = load('src/components/sections/ProductsPricing.tsx').default;
const { mergePricing, formatPrice } = load('src/lib/pricing.ts');
const current = require('../content/pricing/cenik.json');
const { getHoneys } = load('src/lib/products.ts');

function renderCatalog(pricing = current) {
  const section = ProductsPricing();
  const provider = React.cloneElement(section.props.children, { initialPricing: pricing });
  const html = renderToStaticMarkup(React.cloneElement(section, {}, provider));
  const text = (value) => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
  return {
    html,
    cards: [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(([card]) => text(card)),
    rows: [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)].map(([row]) => text(row)),
  };
}

function checkCatalog(pricing) {
  const { cards, rows } = renderCatalog(pricing);
  assert.equal(cards.length, (6 + 7) * 3, 'every carousel copy renders');
  for (const honey of getHoneys()) {
    const matching = cards.filter((card) => card.includes(honey.name));
    assert.ok(matching.length >= 3, honey.name);
    for (const row of pricing.honey) {
      const label = formatPrice(row.price, row.unit.split('/')[0]);
      for (const card of matching) assert.ok(card.replace(/\s/g, '').includes(row.size.replace(/\s/g, '')) && card.includes(label), honey.name + ' ' + label);
      assert.ok(rows.some((item) => item.includes('Med (všechny druhy)') && item.includes(row.size) && item.includes(label)));
    }
  }
  for (const group of ['propolis', 'waxAndCandles', 'nucs']) {
    for (const row of pricing[group]) {
      const matching = cards.filter((card) => card.includes(row.name));
      assert.equal(matching.length, 3, row.name);
      const label = formatPrice(row.price, row.unit);
      for (const card of matching) assert.ok(card.includes(label), row.name + ' ' + label);
      assert.ok(rows.some((item) => item.includes(row.name) && item.includes(label)), 'table: ' + row.name);
      if (group === 'propolis') for (const card of matching) assert.ok(card.includes(row.size));
    }
  }
}

test('all product cards include prices and package sizes matching the price list', () => checkCatalog(current));

test('admin price changes propagate to every card and the table, including sold-out products', () => {
  const saved = structuredClone(current);
  for (const group of ['honey', 'propolis', 'waxAndCandles', 'nucs']) {
    saved[group].forEach((row, i) => { row.price = 731 + i * 17; });
  }
  checkCatalog(mergePricing(saved, current));
});

test('old saved catalogs preserve honey/propolis prices and fill new product rows', () => {
  const saved = { catalogVersion: 1, honey: [{ size: '950g', price: 215 }], propolis: [{ name: 'Propolisová tinktura', price: 205 }] };
  const pricing = mergePricing(saved, current);
  assert.equal(pricing.honey[0].price, 215);
  assert.equal(pricing.propolis[0].price, 205);
  assert.deepEqual(pricing.waxAndCandles, current.waxAndCandles);
  checkCatalog(pricing);
});

test('a temporarily unset price is explicit on both cards and the table', () => {
  const saved = structuredClone(current);
  saved.waxAndCandles[0].price = null;
  checkCatalog(mergePricing(saved, current));
});

function introHarness({ reduced = false, seen = false, blockedStorage = false, hidden = false } = {}) {
  let phase = 'loading';
  let effect;
  let cleanup;
  let nextId = 0;
  const history = [];
  const timers = new Map();
  const frames = new Map();
  const decodes = [];
  const documentEvents = new Map();
  const motionEvents = new Map();
  const motion = {
    matches: reduced,
    addEventListener: (key, fn) => motionEvents.set(key, fn),
    removeEventListener: (key) => motionEvents.delete(key),
  };
  const storage = {
    getItem() { if (blockedStorage) throw new Error('Storage blocked'); return seen ? '1' : null; },
    setItem() { if (blockedStorage) throw new Error('Storage blocked'); seen = true; },
  };
  const document = {
    hidden,
    addEventListener: (key, fn) => documentEvents.set(key, fn),
    removeEventListener: (key) => documentEvents.delete(key),
  };
  const window = {
    matchMedia: () => motion,
    setTimeout: (fn, ms) => { const id = ++nextId; timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: (fn) => { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  class Image {
    decode() { return new Promise((resolve, reject) => decodes.push({ resolve, reject })); }
  }
  const react = {
    useState: () => [phase, (value) => { history.push(value); phase = value; }],
    useEffect: (fn) => { effect = fn; },
  };
  const Intro = sourceLoader(react, { window, document, storage, Image })('src/components/IntroAnimation.tsx').default;
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  const api = {
    history, decodes, motion, document,
    render: () => Intro(),
    mount: () => { Intro(); cleanup = effect(); },
    unmount: () => cleanup?.(),
    resolveImages: async () => { decodes.forEach((item) => item.resolve()); await flush(); },
    rejectImages: async () => { decodes.forEach((item) => item.reject(new Error('Decode failed'))); await flush(); },
    frame: () => { const batch = [...frames.values()]; frames.clear(); batch.forEach((fn) => fn()); },
    timeout: (ms) => { for (const [id, timer] of timers) if (timer.ms === ms) { timers.delete(id); timer.fn(); } },
    changeMotion: () => { motion.matches = true; motionEvents.get('change')?.(); },
    hide: () => { document.hidden = true; documentEvents.get('visibilitychange')?.(); },
  };
  return api;
}

test('intro waits for all decoded images and two frames, then removes itself when the CSS exit ends', async () => {
  const h = introHarness();
  h.mount();
  assert.equal(h.render(), null);
  assert.equal(h.decodes.length, 8);
  await h.resolveImages();
  assert.equal(h.render().props.className, 'intro-overlay');
  h.frame();
  assert.equal(h.render().props.className, 'intro-overlay');
  h.frame();
  const overlay = h.render();
  assert.ok(overlay.props.className.includes('intro-playing'));
  overlay.props.onAnimationEnd({ target: {}, currentTarget: {}, animationName: 'intro-nose' });
  assert.ok(h.render());
  const target = {};
  overlay.props.onAnimationEnd({ target, currentTarget: target, animationName: 'intro-exit' });
  assert.equal(h.render(), null);
  h.unmount();
});

test('reduced motion and repeat visits never mount the intro', () => {
  for (const options of [{ reduced: true }, { seen: true }]) {
    const h = introHarness(options);
    h.mount();
    assert.equal(h.decodes.length, 0);
    assert.equal(h.render(), null);
    h.unmount();
  }
});

test('blocked session storage cannot strand the intro overlay', async () => {
  const h = introHarness({ blockedStorage: true });
  h.mount();
  await h.resolveImages();
  h.frame(); h.frame();
  assert.ok(h.render());
  h.timeout(2300);
  assert.equal(h.render(), null);
  h.unmount();
});

test('slow/failed image decoding reveals the page and cannot start a late intro', async () => {
  const slow = introHarness();
  slow.mount(); slow.timeout(800);
  await slow.resolveImages();
  slow.frame(); slow.frame();
  assert.equal(slow.render(), null);
  slow.unmount();
  const failed = introHarness();
  failed.mount(); await failed.rejectImages();
  assert.equal(failed.render(), null);
  failed.unmount();
});

test('backgrounding and changing reduced motion dismiss the intro immediately', async () => {
  for (const change of ['hide', 'changeMotion']) {
    const h = introHarness();
    h.mount(); await h.resolveImages(); h.frame(); h.frame();
    assert.ok(h.render());
    h[change]();
    assert.equal(h.render(), null);
    h.unmount();
  }
});

test('Strict Mode cleanup prevents cancelled decoding from changing the new intro', async () => {
  const h = introHarness();
  h.mount();
  const firstRun = h.decodes.slice();
  h.unmount(); h.mount();
  firstRun.forEach((item) => item.reject(new Error('Cancelled first mount')));
  await h.resolveImages(); h.frame(); h.frame();
  assert.ok(h.render()?.props.className.includes('intro-playing'));
  assert.ok(!h.history.includes('done'));
  h.unmount();
});

test('cropped logo layers preserve every original path and rectangle without SVG animation', () => {
  const { INTRO_LOGO_LAYERS: layers } = load('src/lib/introLogo.ts');
  const original = readFileSync(path.join(root, 'public/images/logo/entrance-animation.svg'), 'utf8');
  const combined = layers.map(({ src }) => decodeURIComponent(src.slice(src.indexOf(',') + 1))).join('');
  const shapes = (svg) => [...svg.matchAll(/<(?:path|rect)\b[^>]*\/>/g)]
    .map(([shape]) => shape.replace(/\s(?:id|class)="[^"]*"/g, '')).sort();
  assert.deepEqual(shapes(combined), shapes(original));
  assert.ok(!combined.includes('<style>'));
  for (const { style } of layers) {
    assert.ok(parseFloat(style.width) > 0 && parseFloat(style.width) < 100);
    assert.ok(parseFloat(style.height) > 0 && parseFloat(style.height) < 100);
  }
});
