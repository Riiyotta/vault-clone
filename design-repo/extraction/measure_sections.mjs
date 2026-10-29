#!/usr/bin/env node
// Optional re-measure tool: renders every route of templates/routes.json at 1440x900 and records the height of each
// template section in extraction/measured-values.json -> sectionHeights (read by extraction/wrapper_gate.py).
// verify_all.py never runs this (no browser is needed to verify); re-run it after the clone changes.
//
// Usage (from the clone project root, i.e. the parent of design-repo/):
//   npx vite build --outDir <scratch-dir>
//   npx vite preview --outDir <scratch-dir> --port 5705 --strictPort &
//   NODE_PATH="$(npm root -g)" BASE_URL=http://localhost:5705 node design-repo/extraction/measure_sections.mjs [--write]
// or PLAYWRIGHT_MODULE="$(npm root -g)/playwright/index.mjs" instead of NODE_PATH. No absolute path is stored here.
//
// How sections are found (recipe, no guessing): the page header -> chrome.navbar; every 1px separator that is a direct
// child of the page wrapper or of <main> -> chrome.grid-frame (summed); the other direct children of <main>, in order ->
// the template's non-chrome nodes, in order (a count mismatch aborts); <footer> -> chrome.footer. Legal pages split the
// single document block at its top-level <hr> rules: header = block top .. first rule, one content.legal-section per
// rule. The lead-form modal is opened through its trigger and measured as an overlay (inFlow false).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LEDGER = fileURLToPath(new URL('./measured-values.json', import.meta.url));
const TEMPLATES = JSON.parse(readFileSync(fileURLToPath(new URL('../templates/templates.json', import.meta.url)), 'utf8')).templates;
const ROUTES = JSON.parse(readFileSync(fileURLToPath(new URL('../templates/routes.json', import.meta.url)), 'utf8')).routes;
const baseUrl = (process.env.BASE_URL || 'http://localhost:5705').replace(/\/$/, '');
const write = process.argv.includes('--write');
const VIEWPORT = { width: 1440, height: 900 };

let pw;
if (process.env.PLAYWRIGHT_MODULE) {
  const ref = process.env.PLAYWRIGHT_MODULE;
  pw = await import(/^(\/|[A-Za-z]:\\)/.test(ref) ? pathToFileURL(ref).href : ref);
} else {
  pw = createRequire(import.meta.url)('playwright'); // resolved through NODE_PATH="$(npm root -g)"
}
const { chromium } = pw;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: 'no-preference' });
const out = {};
let failures = 0;

for (const r of ROUTES) {
  const path = r.path === '/*' ? '/missing-page' : r.path;
  const tpl = TEMPLATES[r.template];
  const content = tpl.nodes.map((n) => n.section).filter((s) => !s.startsWith('chrome.') && s !== 'forms.partner-popup');
  await page.goto(baseUrl + path, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const res = await page.evaluate(({ content, legal }) => {
    const H = (el) => Math.round(el.getBoundingClientRect().height * 100) / 100;
    const isSep = (el) => el.tagName === 'DIV' && el.getAttribute('aria-hidden') === 'true' && /\bh-px\b/.test(el.className) && el.getBoundingClientRect().height <= 2;
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const wrap = header.parentElement;
    const seps = [...wrap.children, ...main.children].filter(isSep);
    const blocks = [...main.children].filter((el) => !isSep(el));
    const sections = [{ section: 'chrome.navbar', heightPx: H(header), position: getComputedStyle(header).position }];
    sections.push({ section: 'chrome.grid-frame', heightPx: Math.round(seps.reduce((a, e) => a + H(e), 0) * 100) / 100, position: 'static', instances: seps.length });
    if (legal) {
      if (blocks.length !== 1) return { error: `legal page: expected 1 document block in <main>, found ${blocks.length}` };
      const b = blocks[0].getBoundingClientRect();
      const rules = [...blocks[0].querySelectorAll('article > hr')].map((hr) => hr.getBoundingClientRect().top);
      // the DPA preamble is introduced by a rule that precedes no h2: it belongs to the header
      const starts = [...blocks[0].querySelectorAll('article > hr')].filter((hr) => hr.nextElementSibling && hr.nextElementSibling.tagName === 'H2').map((hr) => hr.getBoundingClientRect().top);
      const first = starts.length ? starts[0] : b.bottom;
      sections.push({ section: 'content.legal-header', heightPx: Math.round((first - b.top) * 100) / 100, position: 'static', rules: rules.length });
      starts.forEach((top, i) => {
        const end = i + 1 < starts.length ? starts[i + 1] : b.bottom;
        sections.push({ section: 'content.legal-section', heightPx: Math.round((end - top) * 100) / 100, position: 'static' });
      });
    } else {
      if (blocks.length !== content.length) return { error: `expected ${content.length} content blocks in <main> (${content.join(', ')}), found ${blocks.length}` };
      blocks.forEach((el, i) => sections.push({ section: content[i], heightPx: H(el), position: getComputedStyle(el).position }));
    }
    sections.push({ section: 'chrome.footer', heightPx: H(footer), position: getComputedStyle(footer).position });
    return { sections, pageHeight: document.documentElement.scrollHeight };
  }, { content, legal: r.template === 'template.legal' });
  if (res.error) {
    console.error(`FAIL ${path}: ${res.error}`);
    failures++;
    continue;
  }
  if (tpl.nodes.some((n) => n.section === 'forms.partner-popup')) {
    const before = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.locator('main button').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.waitForTimeout(600);
    const pop = await page.evaluate(() => {
      const ring = document.querySelector('[role="dialog"]').parentElement;
      const root = ring.parentElement;
      return { heightPx: Math.round(ring.getBoundingClientRect().height * 100) / 100, position: getComputedStyle(root).position };
    });
    await page.keyboard.press('Escape');
    res.sections.splice(res.sections.length - 1, 0, { section: 'forms.partner-popup', ...pop, opened: 'first <main> button (hero CTA)', pageHeightUnchanged: before === (await page.evaluate(() => document.documentElement.scrollHeight)) });
  }
  for (const s of res.sections) s.inFlow = !['fixed', 'absolute'].includes(s.position);
  const sum = res.sections.filter((s) => s.inFlow).reduce((a, s) => a + s.heightPx, 0);
  out[r.path] = { template: r.template, measuredPath: path, pageHeight: res.pageHeight, sections: res.sections };
  console.log(`${path.padEnd(22)} page ${String(res.pageHeight).padStart(6)}  in-flow sum ${sum.toFixed(1).padStart(8)}  ` +
    res.sections.filter((s) => !s.section.startsWith('chrome.')).map((s) => `${s.section}=${Math.round(s.heightPx)}${s.inFlow ? '' : '(overlay)'}`).join(' '));
}
const version = browser.version();
await browser.close();
if (failures) {
  console.error(`${failures} route(s) could not be mapped; not writing`);
  process.exit(1);
}
if (write) {
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  ledger.sectionHeights = {
    $comment: 'Rendered height of every template section at 1440x900 on every route of templates/routes.json, written by extraction/measure_sections.mjs from a local production build of the clone (vite build + vite preview) and read by extraction/wrapper_gate.py. inFlow=false = position fixed/absolute (an overlay that takes no page height). chrome.grid-frame is the sum of the 1px frame separators. Legal pages are split at their top-level <hr> rules.',
    viewport: VIEWPORT,
    measuredOn: new Date().toISOString().slice(0, 10),
    tool: `playwright chromium ${version} via extraction/measure_sections.mjs`,
    source: 'local production build of the sibling clone (npx vite build --outDir <scratch>; npx vite preview --port 5705)',
    routes: out,
  };
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
  console.log(`wrote sectionHeights for ${Object.keys(out).length} routes`);
}
