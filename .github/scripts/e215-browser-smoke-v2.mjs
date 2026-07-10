import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = 'http://127.0.0.1:4173/subjects/math/index.html';
const lessonId = 'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140';
const lessonTitle = '§1.4 · Cơ sở, span và tọa độ';
const report = { task: 'E215_READER_PRO_EXTENSION_PANEL_AND_FIT_RULES', testedURL: URL, testedAt: new Date().toISOString(), results: [] };
let failed = false;

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();
function overlap(a, b) {
  const aw = norm(a).split(' ').filter(x => x.length > 3);
  const bw = norm(b).split(' ').filter(x => x.length > 3);
  if (!aw.length || !bw.length) return 0;
  const set = new Set(bw);
  return aw.filter(x => set.has(x)).length / aw.length;
}

const browser = await chromium.launch({ headless: true });
for (const width of [1280, 900]) {
  const context = await browser.newContext({ viewport: { width, height: 720 } });
  const page = await context.newPage();
  const row = { width, ok: false, consoleErrors: [], pageErrors: [], httpErrors: [] };
  page.on('console', msg => { if (msg.type() === 'error') row.consoleErrors.push(msg.text()); });
  page.on('pageerror', err => row.pageErrors.push(String(err)));
  page.on('response', res => {
    if (res.status() >= 400 && /127\.0\.0\.1:4173\/subjects\/math\//.test(res.url())) row.httpErrors.push(`${res.status()} ${res.url()}`);
  });

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(() => window.BAUMAN_MATH_THEORY_E132 && window.BAUMAN_MATH_E211_READER_CONTENT && window.BAUMAN_MATH_E212_READER_FIT, null, { timeout: 20000 });

    await page.evaluate(({ lessonId, lessonTitle }) => {
      const state = window.__MATH_STATE || (window.__MATH_STATE = {});
      Object.assign(state, { lessonId, currentLessonId: lessonId, selectedLessonId: lessonId, theoryLessonId: lessonId, lessonTitle, currentLessonTitle: lessonTitle, selectedTheoryTitle: lessonTitle, e129Present: true });
      if (window.__BAUMAN_CORE_API?.state) Object.assign(window.__BAUMAN_CORE_API.state, state);
      document.body.classList.add('e129-presenting');
      let shell = document.querySelector('.e215-smoke-shell');
      if (!shell) {
        shell = document.createElement('section');
        shell.className = 'e129-theory-shell presenting e215-smoke-shell';
        shell.innerHTML = `<h2 class="e129-lesson-title" data-e129-current-title>${lessonTitle}</h2><button class="e129-chip-btn active" aria-pressed="true" data-lesson-id="${lessonId}">${lessonTitle}</button><div class="e129-slide-list"><article class="e129-slide" data-lesson-id="${lessonId}"><h3>Vector, cơ sở và tọa độ</h3><p>Một vector được biểu diễn theo cơ sở đã chọn.</p><code>x &gt;== 0; y &lt;== 1; z ≥= 2</code></article></div>`;
        document.body.appendChild(shell);
      }
      window.BAUMAN_MATH_THEORY_E132.openDeck();
    }, { lessonId, lessonTitle });

    await page.waitForFunction(() => {
      const s = window.BAUMAN_MATH_E211_READER_CONTENT?.selfCheck?.();
      return s?.ready && !!s.record;
    }, null, { timeout: 20000 });

    await page.evaluate(() => {
      window.BAUMAN_MATH_E211_READER_CONTENT.apply();
      window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.apply?.();
      window.BAUMAN_MATH_E212_READER_FIT.apply();
    });
    await page.waitForSelector('.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel', { timeout: 10000 });
    await page.waitForTimeout(500);

    const initial = await page.evaluate(() => {
      const deck = document.querySelector('.e132-overlay-deck.open.e211-reader-pro');
      const panel = deck.querySelector('.e211-extension-panel');
      const body = panel.querySelector('.e211-summary-lead, p');
      return {
        panelTitle: panel.querySelector('.e211-panel-title, h3')?.textContent.trim() || '',
        panelBody: body?.textContent.trim() || '',
        cards: [...deck.querySelectorAll('.e132-clean-card .e132-full-body')].map(n => n.textContent.trim()),
        density: panel.getAttribute('data-e212-density'),
        visualDisplay: getComputedStyle(deck.querySelector('.e202-visual')).display,
        diagramEmbedded: !!panel.querySelector('[data-e242-diagram]'),
        e211: window.BAUMAN_MATH_E211_READER_CONTENT.selfCheck(),
        e212: window.BAUMAN_MATH_E212_READER_FIT.selfCheck(),
        e242: window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.selfCheck?.() || null
      };
    });
    const maxOverlap = Math.max(0, ...initial.cards.map(c => overlap(initial.panelBody, c)));

    const relation = await page.evaluate(() => {
      const deck = document.querySelector('.e132-overlay-deck.open.e211-reader-pro');
      const host = document.createElement('div');
      host.id = 'e215-relation-probe';
      host.innerHTML = '<div class="e226-math" data-e226-raw-formula="a >== 1; b <== 2; c ≥= 3; d ≤= 4; e ≠= 5">a &gt;== 1; b &lt;== 2; c ≥= 3; d ≤= 4; e ≠= 5</div>';
      deck.appendChild(host);
      window.BAUMAN_MATH_E212_READER_FIT.apply();
      const node = host.querySelector('.e226-math');
      return { raw: node.getAttribute('data-e226-raw-formula'), text: node.textContent.trim(), self: window.BAUMAN_MATH_E212_READER_FIT.repairRelationText('x >== 0; y <== 1; z ≥= 2; q ≤= 3') };
    });

    const layout = await page.evaluate(() => {
      const deck = document.querySelector('.e132-overlay-deck.open.e211-reader-pro');
      const panel = deck.querySelector('.e211-extension-panel');
      const body = panel.querySelector('.e211-summary-lead, p');
      const title = panel.querySelector('.e211-panel-title, h3');
      body.textContent = ('Nội dung mở rộng dài để kiểm tra cuộn nội bộ, trường hợp biên, đơn vị, quy ước và đường lan truyền sai số. ').repeat(90);
      window.BAUMAN_MATH_E212_READER_FIT.apply();
      const ps = getComputedStyle(panel), bs = getComputedStyle(body), tr = title.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      return { density: panel.getAttribute('data-e212-density'), panelOverflow: ps.overflow, bodyOverflowY: bs.overflowY, bodyScrollable: body.scrollHeight > body.clientHeight, titleVisible: tr.height > 0 && tr.top >= pr.top - 1, panelInsideVisual: panel.scrollHeight <= panel.clientHeight + 1, visualDisplay: getComputedStyle(deck.querySelector('.e202-visual')).display };
    });

    const relBlob = `${relation.raw} ${relation.text} ${relation.self}`;
    const checks = {
      title: initial.panelTitle === 'Nội dung mở rộng',
      notForbidden: !/Diễn giải kỹ thuật|Câu hỏi tự kiểm|Câu hỏi đúng cần đặt/i.test(initial.panelBody),
      notDuplicate: maxOverlap <= 0.82,
      densityPresent: ['light', 'normal', 'dense', 'overflow'].includes(initial.density),
      e220Release: /E220_READER_PRO_EXTENSION_PANEL_AND_FIT_RULES/.test(initial.e212?.release || ''),
      visualVisible: initial.visualDisplay !== 'none',
      richnessPreserved: initial.diagramEmbedded && initial.e242?.richnessPresent === true,
      relationClean: !/(>==|<==|≥=|≤=|≠=)/.test(relBlob),
      expectedRelation: relation.self === 'x >= 0; y <= 1; z ≥ 2; q ≤ 3',
      overflowDensity: layout.density === 'overflow',
      panelOverflowHidden: layout.panelOverflow === 'hidden',
      bodyScrollEnabled: ['auto', 'scroll'].includes(layout.bodyOverflowY),
      titleVisible: layout.titleVisible,
      panelInsideVisual: layout.panelInsideVisual,
      responsivePanelVisible: layout.visualDisplay !== 'none'
    };
    row.initial = initial;
    row.relation = relation;
    row.layout = layout;
    row.checks = checks;
    row.ok = Object.values(checks).every(Boolean) && row.consoleErrors.length === 0 && row.pageErrors.length === 0 && row.httpErrors.length === 0;
  } catch (error) {
    row.exception = String(error?.stack || error);
    row.domSummary = await page.evaluate(() => ({
      bodyClass: document.body.className,
      globals: {
        e132: !!window.BAUMAN_MATH_THEORY_E132,
        e211: window.BAUMAN_MATH_E211_READER_CONTENT?.selfCheck?.() || null,
        e212: window.BAUMAN_MATH_E212_READER_FIT?.selfCheck?.() || null,
        e242: window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.selfCheck?.() || null
      },
      deck: !!document.querySelector('.e132-overlay-deck.open'),
      readerPro: !!document.querySelector('.e132-overlay-deck.open.e211-reader-pro'),
      panel: !!document.querySelector('.e211-extension-panel')
    })).catch(() => null);
  }

  await page.screenshot({ path: `e215-reader-pro-${width}.png`, fullPage: true }).catch(() => {});
  fs.writeFileSync(`e215-reader-pro-${width}.html`, await page.content().catch(() => ''));
  if (!row.ok) failed = true;
  report.results.push(row);
  await context.close();
}
await browser.close();
report.status = failed ? 'FAIL' : 'PASS';
fs.writeFileSync('e215-browser-smoke-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed) process.exit(1);
