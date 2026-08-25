'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const BASE_URL = process.env.BAUMAN_TEST_BASE_URL || 'http://127.0.0.1:4173';
const ORIGIN = new URL(BASE_URL).origin;
const REPORT_PATH = 'docs/migration/L6_B11_REFERENCE_BROWSER_REGRESSION.generated.json';
const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'tablet', width: 820, height: 1180 },
  { id: 'mobile', width: 390, height: 844 }
];
const REQUIRED_FOUNDATION_PACK_SUFFIXES = [
  '/subjects/foundation/index.html',
  '/subjects/foundation/assets/foundation.js',
  '/subjects/foundation/data/lessons.json',
  '/assets/css/universal-lesson-reference.css',
  '/assets/js/platform/universal-lesson/reference-lesson-bootstrap-v1.js',
  '/assets/js/platform/universal-lesson/reference-lesson-runtime-v1.js',
  '/assets/js/platform/universal-lesson/lesson-schema-validator-v1.js',
  '/assets/js/platform/universal-lesson/lesson-version-migrator-v1.js',
  '/assets/js/platform/universal-lesson/subject-factory-registry-v1.js',
  '/assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js',
  '/assets/data/lesson/reference-lesson-activation-v1.json',
  '/assets/data/lesson/schema/universal-lesson-v2.schema.json',
  '/assets/data/lesson/universal-lesson-block-policy-v1.json',
  '/assets/data/lesson/subject-factory-registry-v1.json'
];
const checks = [];
const failures = [];
const responsiveEvidence = [];
const packEvidence = [];
const offlineEvidence = [];

function check(id, title, ok, evidence) {
  const row = { id, title, ok: !!ok, evidence: evidence === undefined ? null : evidence };
  checks.push(row);
  if (!row.ok) failures.push(id + ': ' + title + (evidence ? ' · ' + JSON.stringify(evidence) : ''));
  return row.ok;
}

function storageSnapshot(page) {
  return page.evaluate(function () {
    return Object.fromEntries(Array.from({ length: localStorage.length }, function (_, index) {
      const key = localStorage.key(index);
      return [key, localStorage.getItem(key)];
    }).sort(function (left, right) { return left[0].localeCompare(right[0]); }));
  });
}

async function waitReference(page) {
  await page.waitForFunction(function () {
    const bootstrap = window.BaumanL6ReferenceBootstrap?.selfCheck?.();
    const runtime = window.BaumanL6ReferenceLessonRuntime?.selfCheck?.();
    return runtime?.ready === true || bootstrap?.code === 'BOOTSTRAP_FAILED';
  }, null, { timeout: 15000 });
  return page.evaluate(function () {
    return {
      bootstrap: window.BaumanL6ReferenceBootstrap?.selfCheck?.() || null,
      runtime: window.BaumanL6ReferenceLessonRuntime?.selfCheck?.() || null
    };
  });
}

async function openReference(page) {
  const handled = await page.evaluate(function () {
    return window.openLesson?.('f_s01_l1') === true;
  });
  await page.waitForSelector('[data-l6-reference-modal="true"] .universal-lesson', {
    state: 'visible',
    timeout: 7000
  });
  return handled;
}

async function exerciseRecorder(page, prefix) {
  await page.click('[data-universal-action="open-specialist"][data-capability-ref="speech-recording"]');
  await page.waitForSelector('[data-l6-oral-widget="foundation-oral-rehearsal"]', { state: 'visible' });
  const initial = await page.evaluate(function () {
    const widget = document.querySelector('[data-l6-oral-widget]');
    return {
      ready: !!widget,
      cue: widget?.querySelector('blockquote')?.textContent || '',
      uploadLabel: widget?.innerText || '',
      checks: widget?.querySelectorAll('li').length || 0
    };
  });
  check(prefix + '-WIDGET', 'real local oral widget opens from the external capability block',
    initial.ready
      && initial.cue.includes('Правильно ли я понял')
      && initial.uploadLabel.includes('Không tải âm thanh lên mạng')
      && initial.checks === 3,
    initial);

  await page.click('[data-l6-reference-action="record-start"]');
  await page.waitForFunction(function () {
    return document.querySelector('[data-l6-oral-status]')?.dataset.tone === 'recording';
  }, null, { timeout: 7000 });
  await page.waitForTimeout(600);
  await page.click('[data-l6-reference-action="record-stop"]');
  await page.waitForFunction(function () {
    const audio = document.querySelector('[data-l6-oral-audio]');
    return audio && audio.hidden === false && /^blob:/.test(audio.src);
  }, null, { timeout: 7000 });
  const recorded = await page.evaluate(function () {
    const audio = document.querySelector('[data-l6-oral-audio]');
    const status = document.querySelector('[data-l6-oral-status]');
    return {
      audioVisible: !!audio && !audio.hidden,
      blobUrl: /^blob:/.test(audio?.src || ''),
      statusTone: status?.dataset.tone || '',
      resetEnabled: document.querySelector('[data-l6-reference-action="record-reset"]')?.disabled === false
    };
  });
  check(prefix + '-RECORDER', 'MediaRecorder creates a playable in-memory blob with fake device audio',
    recorded.audioVisible && recorded.blobUrl && recorded.statusTone === 'success' && recorded.resetEnabled,
    recorded);
  await page.click('[data-l6-reference-action="record-reset"]');
  const reset = await page.evaluate(function () {
    const audio = document.querySelector('[data-l6-oral-audio]');
    return {
      hidden: audio?.hidden === true,
      src: audio?.getAttribute('src') || '',
      status: document.querySelector('[data-l6-oral-status]')?.textContent || ''
    };
  });
  check(prefix + '-RECORDER-RESET', 'learner can revoke and clear the current modal recording',
    reset.hidden && reset.src === '' && reset.status.includes('đã được xóa'), reset);
}

async function newMediaContext(browser, viewport, serviceWorkers) {
  const context = await browser.newContext({
    viewport,
    serviceWorkers: serviceWorkers || 'block'
  });
  await context.grantPermissions(['microphone'], { origin: ORIGIN });
  return context;
}

async function mainReferenceFlow(browser) {
  const context = await newMediaContext(browser, { width: 1440, height: 900 }, 'block');
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', function (message) {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto(BASE_URL + '/subjects/foundation/index.html', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  const ready = await waitReference(page);
  check('BROWSER-READY', 'Foundation B11 bootstrap and exact runtime become ready',
    ready.bootstrap?.ready === true
      && ready.runtime?.ready === true
      && ready.runtime?.lessonId === 'f_s01_l1'
      && ready.runtime?.factoryRuleId === 'foundation-classroom-and-study'
      && ready.runtime?.sourceUnchanged === true,
    ready);

  await page.waitForTimeout(300);
  const before = await storageSnapshot(page);
  const handled = await openReference(page);
  const model = await page.evaluate(function () {
    const modal = document.querySelector('[data-l6-reference-modal="true"]');
    return {
      handled: !!modal,
      sections: modal?.querySelectorAll('.ul-block').length || 0,
      external: modal?.querySelectorAll('.ul-block-external').length || 0,
      text: modal?.innerText || '',
      program: modal?.querySelector('.ul-program')?.textContent || '',
      masterReadyClaim: window.BaumanL6ReferenceLessonRuntime?.selfCheck?.().masterReadyClaimed === true
    };
  });
  check('BROWSER-REFERENCE', 'reviewed Universal lesson opens with ten sections and exact identity',
    handled
      && model.handled
      && model.sections === 10
      && model.external === 1
      && model.program.includes('ИУ-5')
      && model.program.includes('09.04.01/11')
      && !/HUTECH/i.test(model.text)
      && model.masterReadyClaim === false,
    { handled, sections: model.sections, external: model.external, program: model.program, masterReadyClaim: model.masterReadyClaim });

  await exerciseRecorder(page, 'BROWSER');
  const afterRecording = await storageSnapshot(page);
  check('BROWSER-NO-IMPLICIT-STATE-WRITE', 'opening and recording do not write learner state',
    JSON.stringify(before) === JSON.stringify(afterRecording),
    { beforeKeys: Object.keys(before), afterKeys: Object.keys(afterRecording) });

  await page.click('[data-l6-reference-action="legacy"]');
  await page.waitForSelector('.elearn-dialog', { state: 'visible', timeout: 5000 });
  const fallback = await page.evaluate(function () {
    return {
      legacyVisible: !!document.querySelector('.elearn-dialog'),
      universalVisible: !!document.querySelector('[data-l6-reference-modal="true"]'),
      title: document.querySelector('.elearn-dialog h3')?.textContent || ''
    };
  });
  check('BROWSER-EXPLICIT-ROLLBACK', 'learner can return to the unchanged legacy Foundation modal',
    fallback.legacyVisible && !fallback.universalVisible && fallback.title.includes('Quy trình học dự bị STANKIN'),
    fallback);
  await page.evaluate(function () { window.closeModal?.(); });
  check('BROWSER-CONSOLE', 'reference flow emits no browser console errors', consoleErrors.length === 0, consoleErrors);
  await context.close();
}

async function responsiveFlow(browser) {
  for (const viewport of VIEWPORTS) {
    const context = await newMediaContext(browser, { width: viewport.width, height: viewport.height }, 'block');
    const page = await context.newPage();
    await page.goto(BASE_URL + '/subjects/foundation/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    const ready = await waitReference(page);
    await openReference(page);
    await page.click('[data-universal-action="open-specialist"]');
    const metrics = await page.evaluate(function () {
      const doc = document.documentElement;
      const dialog = document.querySelector('.universal-reference-dialog');
      const body = document.querySelector('.universal-reference-body');
      const widget = document.querySelector('.ul-oral-widget');
      const rect = dialog?.getBoundingClientRect();
      return {
        viewportMeta: !!document.querySelector('meta[name="viewport"]'),
        innerWidth: window.innerWidth,
        documentOverflow: Math.max(0, doc.scrollWidth - window.innerWidth),
        dialogLeft: rect?.left || 0,
        dialogRight: rect?.right || 0,
        dialogWidth: rect?.width || 0,
        bodyOverflow: body ? Math.max(0, body.scrollWidth - body.clientWidth) : 999,
        widgetColumns: widget ? getComputedStyle(widget).gridTemplateColumns : '',
        text: dialog?.innerText || '',
        sections: dialog?.querySelectorAll('.ul-block').length || 0
      };
    });
    responsiveEvidence.push({ viewport, ready, metrics });
    const mobileColumns = viewport.id !== 'mobile' || !metrics.widgetColumns.includes(' ');
    check('RESPONSIVE-' + viewport.id.toUpperCase(),
      viewport.id + ' reference modal stays within viewport without horizontal overflow',
      ready.runtime?.ready === true
        && metrics.viewportMeta
        && metrics.sections === 10
        && metrics.documentOverflow <= 1
        && metrics.bodyOverflow <= 1
        && metrics.dialogLeft >= -1
        && metrics.dialogRight <= viewport.width + 1
        && metrics.dialogWidth > 0
        && mobileColumns
        && !/HUTECH/i.test(metrics.text),
      metrics);
    await context.close();
  }
}

async function specialistOnlineFlow(browser) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 800 } });
  for (const subjectId of ['russian', 'math']) {
    const page = await context.newPage();
    await page.goto(BASE_URL + '/subjects/' + subjectId + '/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(1000);
    const result = await page.evaluate(function (id) {
      const self = id === 'russian'
        ? window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.()
        : window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.();
      return {
        textLength: document.body.innerText.trim().length,
        self: self || null,
        referenceBootstrap: !!window.BaumanL6ReferenceBootstrap,
        referenceRuntime: !!window.BaumanL6ReferenceLessonRuntime
      };
    }, subjectId);
    check('SPECIALIST-ONLINE-' + subjectId.toUpperCase(),
      subjectId + ' specialist runtime remains active and has no B11 pilot',
      result.textLength > 80
        && result.self?.ok === true
        && result.referenceBootstrap === false
        && result.referenceRuntime === false,
      result);
    await page.close();
  }
  await context.close();
}

async function ensureLoggedIn(page) {
  await page.waitForFunction(function () { return !!window.app && !!window.auth; }, null, { timeout: 10000 });
  const hidden = await page.evaluate(function () {
    return document.getElementById('appRoot')?.classList.contains('hidden') === true;
  });
  if (hidden) {
    await page.click('#loginBtn');
    await page.waitForFunction(function () {
      return document.getElementById('appRoot')
        && !document.getElementById('appRoot').classList.contains('hidden');
    }, null, { timeout: 10000 });
  }
}

async function preparePacks(page) {
  for (const subjectId of ['foundation', 'math', 'russian']) {
    const result = await page.evaluate(async function (id) {
      const out = await window.BaumanOfflineSubjectPackManager.prepareBase(id);
      return {
        packId: out?.packId || '',
        ok: (out?.ok || []).map(function (item) { return new URL(item.url).pathname; }),
        failed: out?.failed || [],
        skipped: out?.skipped || []
      };
    }, subjectId);
    packEvidence.push({ subjectId, ...result });
    check('PACK-' + subjectId.toUpperCase(), subjectId + ' explicit offline pack builds without failed or skipped resources',
      result.ok.length > 0 && result.failed.length === 0 && result.skipped.length === 0,
      { packId: result.packId, resources: result.ok.length, failed: result.failed, skipped: result.skipped });
  }
  const foundation = packEvidence.find(function (item) { return item.subjectId === 'foundation'; });
  const missing = REQUIRED_FOUNDATION_PACK_SUFFIXES.filter(function (suffix) {
    return !foundation?.ok.some(function (pathname) { return pathname.endsWith(suffix); });
  });
  check('PACK-FOUNDATION-B11-ASSETS', 'Foundation explicit pack captures every B11 runtime and reviewed data dependency',
    missing.length === 0, { missing, resources: foundation?.ok.length || 0 });
}

async function registerServiceWorker(page) {
  const result = await page.evaluate(async function () {
    const registration = await navigator.serviceWorker.register('/service-worker.js?l6-b11=1', { scope: '/' });
    await navigator.serviceWorker.ready;
    const started = Date.now();
    while (!navigator.serviceWorker.controller && Date.now() - started < 10000) {
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    return {
      active: !!registration.active,
      controlled: !!navigator.serviceWorker.controller,
      scope: registration.scope
    };
  });
  check('OFFLINE-SERVICE-WORKER', 'test Service Worker activates and controls the Web App',
    result.active && result.controlled && result.scope === ORIGIN + '/', result);
}

async function offlineNavigate(context, page, subjectId, assertion) {
  const failed = [];
  const handler = function (request) {
    try {
      if (new URL(request.url()).origin === ORIGIN) failed.push(request.url());
    } catch (_) { }
  };
  page.on('requestfailed', handler);
  let navigationError = '';
  let probe = null;
  try {
    await page.goto(BASE_URL + '/subjects/' + subjectId + '/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    probe = await assertion(page);
  } catch (error) {
    navigationError = String(error?.message || error);
  }
  page.off('requestfailed', handler);
  const evidence = { subjectId, navigationError, failed, probe };
  offlineEvidence.push(evidence);
  check('OFFLINE-' + subjectId.toUpperCase(), subjectId + ' route and required runtime work offline',
    navigationError === '' && failed.length === 0 && probe?.ok === true, evidence);
}

async function offlineFlow(browser) {
  const context = await newMediaContext(browser, { width: 1280, height: 800 }, 'allow');
  const page = await context.newPage();
  await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await ensureLoggedIn(page);
  await preparePacks(page);
  await registerServiceWorker(page);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(function () { return !!navigator.serviceWorker.controller; }, null, { timeout: 10000 });
  await context.setOffline(true);

  await offlineNavigate(context, page, 'foundation', async function (foundationPage) {
    const ready = await waitReference(foundationPage);
    await openReference(foundationPage);
    await foundationPage.click('[data-universal-action="open-specialist"]');
    const state = await foundationPage.evaluate(function () {
      return {
        ready: window.BaumanL6ReferenceLessonRuntime?.selfCheck?.().ready === true,
        sections: document.querySelectorAll('[data-l6-reference-modal] .ul-block').length,
        widget: !!document.querySelector('[data-l6-oral-widget]'),
        text: document.querySelector('[data-l6-reference-modal]')?.innerText || ''
      };
    });
    return {
      ok: ready.runtime?.ready === true
        && state.ready
        && state.sections === 10
        && state.widget
        && state.text.includes('09.04.01/11')
        && !/HUTECH/i.test(state.text),
      ...state
    };
  });

  await offlineNavigate(context, page, 'math', async function (mathPage) {
    await mathPage.waitForTimeout(900);
    return mathPage.evaluate(function () {
      const legacyRequested = performance.getEntriesByType('resource').some(function (entry) {
        return /subjects\/math\/data\/lessons\.json(?:$|\?)/.test(entry.name);
      });
      const self = window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.();
      return {
        ok: document.body.innerText.trim().length > 80 && self?.ok === true && !legacyRequested,
        self: self || null,
        legacyRequested,
        b11Loaded: !!window.BaumanL6ReferenceLessonRuntime
      };
    });
  });

  await offlineNavigate(context, page, 'russian', async function (russianPage) {
    await russianPage.waitForTimeout(900);
    return russianPage.evaluate(function () {
      const heavy = performance.getEntriesByType('resource').filter(function (entry) {
        return /subjects\/russian\/data\/(?:vocab|tests|speaking)\.json(?:$|\?)/.test(entry.name);
      }).map(function (entry) { return entry.name; });
      const self = window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.();
      return {
        ok: document.body.innerText.trim().length > 80 && self?.ok === true && heavy.length === 0,
        self: self || null,
        heavy,
        b11Loaded: !!window.BaumanL6ReferenceLessonRuntime
      };
    });
  });

  await context.setOffline(false);
  await context.close();
}

(async function () {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream'
    ]
  });
  try {
    await mainReferenceFlow(browser);
    await responsiveFlow(browser);
    await specialistOnlineFlow(browser);
    await offlineFlow(browser);
  } catch (error) {
    failures.push('BROWSER-FATAL: ' + String(error?.stack || error?.message || error));
  } finally {
    await browser.close();
  }

  const passed = checks.filter(function (item) { return item.ok; }).length;
  const report = {
    schema: 'L6_B11_REFERENCE_BROWSER_REGRESSION_V1',
    status: failures.length ? 'FAIL' : 'PASS',
    branch: 'migration/webapp-l1-audit-storage',
    generatedFor: '2026-08-24',
    baseUrl: BASE_URL,
    summary: {
      total: checks.length,
      passed,
      failed: checks.length - passed,
      viewports: VIEWPORTS.length,
      offlineSubjects: offlineEvidence.length,
      subjectPacks: packEvidence.length
    },
    viewports: responsiveEvidence,
    packs: packEvidence.map(function (item) {
      return {
        subjectId: item.subjectId,
        packId: item.packId,
        resources: item.ok.length,
        failed: item.failed,
        skipped: item.skipped
      };
    }),
    offline: offlineEvidence,
    checks,
    failures
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  console.log('L6-B11 reference browser regression: ' + report.status + ' (' + passed + '/' + checks.length + ')');
  console.log('Responsive viewports: ' + responsiveEvidence.length + '/' + VIEWPORTS.length);
  console.log('Offline subjects: ' + offlineEvidence.length + '/3');
  console.log('Subject packs: ' + packEvidence.length + '/3');
  console.log('Report: ' + REPORT_PATH);
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(2);
  }
})().catch(function (error) {
  console.error(error);
  process.exit(1);
});
