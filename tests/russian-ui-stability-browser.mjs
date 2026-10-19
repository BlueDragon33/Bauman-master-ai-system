// RU-UI-STABILITY-20261015 — browser-observed UX guardrails.
// Only measured browser behavior may contribute to acceptance evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.BAUMAN_PLAYWRIGHT_MODULE || 'playwright');
const BASE = process.env.BAUMAN_E2E_BASE_URL || 'http://127.0.0.1:4175/';
const OUT = process.env.BAUMAN_E2E_ARTIFACT_DIR || 'artifacts/russian-ui-stability';
fs.mkdirSync(OUT, { recursive: true });

const evidence = { schema: 'RUSSIAN_UI_STABILITY_BROWSER_V1', status: 'RUNNING', cases: [], issues: [], viewport: null };
let browser;
async function verify(label, fn) {
  try { const result = await fn(); evidence.cases.push({ label, result: 'PASS', ...(result ? { details: result } : {}) }); }
  catch (error) { evidence.cases.push({ label, result: 'FAIL', message: String(error?.message || error) }); throw error; }
}
async function quietWindow(page, label) {
  // A measured idle period, not an arbitrary "CI is green" assertion.
  const result = await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 280));
    const host = document.querySelector('#view');
    if (!host) return { missing: true };
    let writes = 0;
    const samples = [];
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type !== 'childList') continue;
        writes += record.addedNodes.length + record.removedNodes.length;
        if (samples.length < 16) samples.push({
          target: record.target?.nodeName,
          id: record.target?.id || '',
          className: typeof record.target?.className === 'string' ? record.target.className.slice(0,100) : '',
          added: [...record.addedNodes].map(n => n.nodeName + (n.id ? '#' + n.id : '')).slice(0,4),
          removed: record.removedNodes.length
        });
      }
    });
    observer.observe(host, { childList: true, subtree: true });
    await new Promise(resolve => setTimeout(resolve, 450));
    observer.disconnect();
    let core;
    try{core=JSON.parse(localStorage.getItem('bauman_russian_survival_master_v11_clean_skeleton')||'{}')}catch{core={}}
    const navView=document.querySelector('#nav button.active[data-view]')?.dataset.view || '';
    return { writes, samples, view: core.view || navView || 'overview', navView };
  });
  assert.equal(result.missing, undefined, label + ': view is missing');
  assert.ok(result.writes <= 2, label + ': idle DOM kept changing (' + JSON.stringify(result) + ')');
  return result;
}
async function navigate(page, view, learnTab = '') {
  const selector = '#nav button[data-view="' + view + '"]' + (learnTab ? '[data-learn="' + learnTab + '"]' : '');
  await page.locator(selector).click();
  await page.waitForFunction(({ view, learnTab }) => {
    const nav = [...document.querySelectorAll('#nav button.active[data-view]')];
    return nav.some(node => node.dataset.view === view && (!learnTab || node.dataset.learn === learnTab));
  }, { view, learnTab }, { timeout: 10000 });
}

try {
  browser = await chromium.launch({ headless: true, ...(process.env.BAUMAN_CHROME_PATH ? { executablePath: process.env.BAUMAN_CHROME_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(String(error?.stack || error)));
  page.on('console', entry => { if (entry.type() === 'error') browserErrors.push(entry.text()); });
  await page.goto(new URL('subjects/russian/index.html', BASE).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('.rf-dashboard .rf-module-card').first().waitFor({ state: 'visible', timeout: 30000 });

  await verify('Overview idle render remains stable', async () => {
    const result = await quietWindow(page, 'Overview');
    assert.equal(result.view, 'overview');
    const modules = await page.locator('.rf-dashboard .rf-module-card').count();
    assert.equal(modules, 8);
    return { ...result, modules };
  });
  await verify('Overview exposes real learning shortcuts before R0-R4 at 390, 768 and 1440', async () => {
    const samples = [];
    for (const size of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(size);
      await page.waitForFunction(() => document.querySelector('#ruCapabilityRoadmap .ru-cap-disclosure'));
      const sample = await page.evaluate(() => {
        const host = document.querySelector('.overview-v128');
        const app = document.querySelector('#app.ru-app-shell');
        const main = document.querySelector('.ru-main');
        const appLayout = app ? getComputedStyle(app) : null;
        const mainRect = main?.getBoundingClientRect();
        const panel = document.getElementById('ruCapabilityRoadmap');
        const disclosure = panel?.querySelector('details.ru-cap-disclosure');
        const resume = document.getElementById('ruTodayResume');
        const launcher = host?.querySelector('.rf-module-section');
        const grid = launcher?.querySelector('.rf-module-grid');
        const keys = ['listen','speak','lesson','vocab'];
        const cards = keys.map(key => {
          const button = grid?.querySelector('.rf-module-' + key);
          const rect = button?.getBoundingClientRect();
          return { key, exists: !!button, top: rect?.top ?? -1, bottom: rect?.bottom ?? -1 };
        });
        const sections = [...host?.querySelectorAll('.rf-dashboard > *') || []];
        const first = sections.sort((a,b) => Number(getComputedStyle(a).order || 0) - Number(getComputedStyle(b).order || 0))[0];
        return {
          width: innerWidth, height: innerHeight,
          shellDisplay: appLayout?.display ?? '',
          shellColumns: appLayout?.gridTemplateColumns ?? '',
          mainTop: mainRect?.top ?? -1,
          mainLeft: mainRect?.left ?? -1,
          overviewBeforeCapability: host?.nextElementSibling === panel,
          resumeAfterOverview: !!host && !!resume && Boolean(host.compareDocumentPosition(resume) & Node.DOCUMENT_POSITION_FOLLOWING),
          collapsed: !!disclosure && !disclosure.open,
          firstDashboardItemIsLauncher: first === launcher,
          cards,
          scrollWidth: document.documentElement.scrollWidth
        };
      });
      assert.ok(sample.mainTop >= -2 && sample.mainTop <= 8,
        'Main shell must not be pushed below the sticky tablet sidebar: ' + JSON.stringify(sample));
      if (size.width >= 768) {
        assert.equal(sample.shellDisplay, 'grid', 'Tablet/desktop Russian shell must use grid');
        assert.ok(sample.mainLeft > 0, 'Main area must sit beside sidebar, not in a second row');
      }
      assert.equal(sample.overviewBeforeCapability, true, 'Stage details must follow overview, not precede learning');
      assert.equal(sample.resumeAfterOverview, true, 'Today/Review auxiliary panel must not prepend ahead of canonical Overview');
      assert.equal(sample.collapsed, true, 'R0-R4 detail must be collapsed until learner chooses to open it');
      assert.equal(sample.firstDashboardItemIsLauncher, true, 'Learning shortcuts must precede daily summary panels');
      for (const card of sample.cards) {
        assert.equal(card.exists, true, card.key + ' action must exist');
        assert.ok(card.top >= 0 && card.bottom <= sample.height - (size.width < 768 ? 58 : 0),
          card.key + ' must fit the first unobstructed viewport: ' + JSON.stringify(sample));
      }
      assert.ok(sample.scrollWidth <= sample.width + 2, 'Overview must not horizontally overflow');
      samples.push(sample);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const summary = page.locator('#ruCapabilityRoadmap details.ru-cap-disclosure > summary');
    await summary.click();
    assert.equal(await page.locator('#ruCapabilityRoadmap .ru-cap-grid .ru-cap-band').count(), 5,
      'All five R0-R4 capability bands must remain accessible');
    await summary.click();
    assert.equal(await page.locator('#ruCapabilityRoadmap details.ru-cap-disclosure').evaluate(el => el.open), false);
    return samples;
  });
  await verify('Overview route button opens a functioning learning view', async () => {
    await page.locator('.rf-module-lesson').click();
    await page.locator('.learn-canva-shell').waitFor({ state: 'visible', timeout: 15000 });
    await quietWindow(page, 'Learning via overview shortcut');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bauman_russian_survival_master_v11_clean_skeleton')||'{}').view), 'learning');
    return { route: 'overview → learning' };
  });
  await verify('Learning query retains focus, input value and caret after a rerender', async () => {
    const field = page.locator('#view [data-input="lessonQuery"]');
    await field.waitFor({ state: 'visible', timeout: 15000 });
    const before = await page.evaluate(() => document.querySelector('.ru-main')?.scrollTop || 0);
    await field.fill('привет');
    await page.waitForTimeout(420); // cover the 180 ms application debounce
    const actual = await page.evaluate(() => {
      const field = document.querySelector('#view [data-input="lessonQuery"]');
      return { value: field?.value, active: document.activeElement === field, caret: field?.selectionStart, scroll: document.querySelector('.ru-main')?.scrollTop || 0 };
    });
    assert.equal(actual.value, 'привет', 'Lesson search value must survive');
    assert.equal(actual.active, true, 'Lesson search must not lose focus');
    assert.equal(actual.caret, 'привет'.length, 'Lesson search caret must remain at end');
    assert.ok(Math.abs(actual.scroll - before) < 4, 'Learning query must not change scroll location');
    await field.fill('');
    await page.waitForTimeout(280);
    return actual;
  });
  await verify('Learning disclosure controls remain usable', async () => {
    const menu = page.locator('.learn-structure-menu');
    await menu.locator('summary').click();
    assert.equal(await menu.evaluate(el => el.open), true, 'Structure menu must open');
    await menu.locator('[data-learn="exercises"]').click();
    await page.waitForFunction(() => document.querySelector('.learn-canva-shell')?.className.includes('v1286-learn-exercises'), null, { timeout: 12000 });
    await navigate(page, 'learning', 'practice');
    await page.locator('#ruLessonFlow').waitFor({ state: 'visible', timeout: 10000 });
    const steps = await page.locator('#ruLessonFlow [data-ru-flow-step]').count();
    assert.ok(steps >= 4, 'Learning stepper must expose functional progression');
    await quietWindow(page, 'Learning practice');
    return { steps };
  });
  await verify('Video/audio filter does not remount selected playback surface', async () => {
    await navigate(page, 'media');
    await page.locator('.media-list .media-tile.active').waitFor({ state: 'visible', timeout: 15000 });
    const chosen = (await page.locator('.media-list .media-tile.active b').innerText()).trim().slice(0, 8);
    assert.ok(chosen, 'Active media must have an accessible title');
    await page.evaluate(() => { window.__ruMediaPlayer = document.querySelector('.step54-player'); });
    const field = page.locator('#view [data-input="mediaQuery"]');
    await field.fill(chosen);
    await page.waitForTimeout(420);
    const info = await page.evaluate(() => ({
      samePlayer: window.__ruMediaPlayer === document.querySelector('.step54-player'),
      activeInput: document.activeElement === document.querySelector('#view [data-input="mediaQuery"]'),
      tiles: document.querySelectorAll('.media-list .media-tile').length,
    }));
    assert.equal(info.samePlayer, true, 'Filtering must keep the same video player node');
    assert.equal(info.activeInput, true, 'Filtering must not steal typing focus');
    assert.ok(info.tiles >= 1, 'Active media should remain in filtered list');
    await field.fill('');
    await page.waitForTimeout(300);
    await quietWindow(page, 'Video/audio');
    return info;
  });
  await verify('Vocabulary flashcard and SRS disclosure persist through interactions', async () => {
    await navigate(page, 'vocab');
    await page.locator('.vocab-card-panel').waitFor({ state: 'visible', timeout: 30000 });
    const flow = await page.locator('.ru-vocab-flow-nav [data-ru-vocab-mode]').count();
    assert.equal(flow, 7, 'Vocabulary must preserve its seven canonical learning stages');
    const details = page.locator('.vocab-progressive-details');
    await details.locator('summary').click();
    assert.equal(await details.evaluate(el => el.open), true, 'Vocabulary details must open');
    const before = await page.locator('.visual-flash').evaluate(el => el.classList.contains('flipped'));
    await page.locator('[data-act="toggle-vocab-flip"]').last().click();
    const after = await page.locator('.visual-flash').evaluate(el => el.classList.contains('flipped'));
    assert.notEqual(after, before, 'Flip button must change the displayed side');
    assert.equal(await page.locator('.vocab-progressive-details').evaluate(el => el.open), true, 'Disclosure must survive flip rerender');
    await page.locator('[data-ru-vocab-mode="listen"]').click();
    assert.equal(await page.evaluate(() => window.RussianVocabSrs?.get?.().flowMode), 'listen');
    await quietWindow(page, 'Vocabulary');
    return { sevenSteps: flow, flashcardToggled: true };
  });
  await verify('Due vocabulary card opens exact Review mode without page reload', async () => {
    await page.evaluate(() => window.RussianVocabSrs.setFlowMode('review'));
    await page.locator('#ruVocabSrs [data-ru-srs-rate="forgot"]').waitFor({ state: 'visible', timeout: 10000 });
    const initial = await page.evaluate(() => ({
      key: document.querySelector('.vocab-card-panel')?.dataset.vocabKey || '',
      navigationCount: performance.getEntriesByType('navigation').length,
      contentId: document.querySelector('.vocab-card-panel')?.dataset.vocabSourceIndex || '',
    }));
    assert.ok(initial.key, 'Review must begin on a real card with a source key');
    await page.locator('#ruVocabSrs [data-ru-srs-rate="forgot"]').click();
    await page.waitForFunction(() => window.RussianVocabSrs?.dueCards?.().length > 0, null, { timeout: 10000 });
    const due = await page.evaluate(() => window.RussianVocabSrs.dueCards()[0]);
    await page.locator('#ruVocabSrs [data-ru-srs-open-due]').click();
    await page.waitForFunction(() => document.querySelector('#ruVocabSrs .ru-vocab-rating') && window.RussianVocabSrs?.get?.().flowMode === 'review', null, { timeout: 12000 });
    const reviewed = await page.evaluate(() => ({
      key: document.querySelector('.vocab-card-panel')?.dataset.vocabKey || '',
      flowMode: window.RussianVocabSrs?.get?.().flowMode,
      navCount: performance.getEntriesByType('navigation').length,
      activeDue: document.querySelector('#ruVocabSrs header p')?.textContent?.includes('đang ôn thẻ đến hạn') || false,
    }));
    assert.equal(reviewed.key, due.sourceId || initial.key, 'Due card must preserve its canonical source identity');
    assert.equal(reviewed.flowMode, 'review', 'Opening an overdue card must enter Review, not Discover');
    assert.equal(reviewed.activeDue, true, 'The active due review marker must appear');
    assert.equal(reviewed.navCount, initial.navigationCount, 'Opening due review must not reload the page');
    return { reviewMode: reviewed.flowMode, activeDue: true, noReload: true };
  });
  await verify('Repeated navigation among all four reported tabs does not create idle DOM churn', async () => {
    const values = [];
    for (let cycle = 0; cycle < 2; cycle++) {
      for (const view of ['overview', 'learning', 'media', 'vocab']) {
        if (view === 'learning') await navigate(page, 'learning', 'practice');
        else await navigate(page, view);
        if (view === 'vocab') await page.locator('.vocab-card-panel').waitFor({ state: 'visible', timeout: 30000 });
        values.push({ cycle, view, ...await quietWindow(page, 'Cycle ' + cycle + '/' + view) });
      }
    }
    return values;
  });
  await verify('Mobile viewport remains usable without horizontal overflow', async () => {
    // Navigate while the desktop sidebar is visible; mobile has an off-canvas nav.
    await navigate(page, 'overview');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.rf-mobile-dock').waitFor({ state: 'visible' });
    const value = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, dock: document.querySelector('.rf-mobile-dock')?.getBoundingClientRect().width }));
    assert.ok(value.scrollWidth <= value.viewport + 2, 'Mobile page must not horizontally overflow');
    assert.ok(value.dock <= value.viewport + 1, 'Mobile dock must fit viewport');
    return value;
  });
  assert.deepEqual(browserErrors, [], 'No browser JavaScript/console errors permitted');
  evidence.status = 'PASS';
  evidence.viewport = { desktop: '1440×900', mobile: '390×844' };
  await page.screenshot({ path: path.join(OUT, 'russian-ux-mobile.png'), fullPage: true });
  console.log('RUSSIAN_UI_STABILITY_BROWSER_PASS');
} catch (error) {
  evidence.status = 'FAIL';
  evidence.issues.push(String(error?.stack || error));
  process.exitCode = 1;
  console.error('RUSSIAN_UI_STABILITY_BROWSER_FAIL', error?.stack || error);
} finally {
  fs.writeFileSync(path.join(OUT, 'evidence.json'), JSON.stringify(evidence, null, 2));
  await browser?.close();
}
