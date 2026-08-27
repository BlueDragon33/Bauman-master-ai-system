'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const BASE_URL = process.env.BAUMAN_TEST_BASE_URL || 'http://127.0.0.1:4173';
const ORIGIN = new URL(BASE_URL).origin;
const PROFILE_PATH = 'assets/data/lesson/reference-subject-qa-profile-v1.json';
const REPORT_PATH = 'docs/migration/L7_B8_REFERENCE_BROWSER_QA.generated.json';
const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
const VIEWPORTS = profile.browserContract.viewports;
const SUBJECT_ORDER = profile.scope.subjectOrder;
const CRITICAL_PACK_SUFFIXES = {
  russian: [
    '/subjects/russian/index.html',
    '/subjects/russian/assets/core.js',
    '/subjects/russian/assets/lazy-heavy-data-v1341.js',
    '/subjects/russian/data/lessons.json'
  ],
  math: [
    '/subjects/math/index.html',
    '/subjects/math/assets/theory_skin/theory-tab-E129.js',
    '/subjects/math/assets/theory_skin/theory-legacy-route-E246.js',
    '/subjects/math/data/theory_lecture_frame.json',
    '/subjects/math/data/theory_lecture_content.json'
  ],
  foundation: [
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
  ]
};

const checks = [];
const failures = [];
const onlineEvidence = [];
const packEvidence = [];
const offlineEvidence = [];

function check(id, title, ok, evidence) {
  const row = { id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence };
  checks.push(row);
  if (!row.ok) failures.push(id + ': ' + title + (evidence === undefined ? '' : ' · ' + JSON.stringify(evidence)));
  return row.ok;
}

function errorText(error) {
  return String(error?.stack || error?.message || error);
}

function diagnostics(page) {
  const state = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') state.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => state.pageErrors.push(errorText(error)));
  page.on('requestfailed', (request) => {
    try {
      if (new URL(request.url()).origin === ORIGIN) {
        state.requestFailures.push({ url: request.url(), error: request.failure()?.errorText || '' });
      }
    } catch (_) { }
  });
  return state;
}

async function newContext(browser, viewport, serviceWorkers) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: profile.browserContract.reducedMotionMode,
    serviceWorkers: serviceWorkers || 'block'
  });
  await context.grantPermissions(['microphone'], { origin: ORIGIN });
  return context;
}

async function waitFoundation(page) {
  await page.waitForFunction(() => {
    const bootstrap = window.BaumanL6ReferenceBootstrap?.selfCheck?.();
    const runtime = window.BaumanL6ReferenceLessonRuntime?.selfCheck?.();
    return runtime?.ready === true || bootstrap?.code === 'BOOTSTRAP_FAILED';
  }, null, { timeout: 20000 });
  return page.evaluate(() => ({
    bootstrap: window.BaumanL6ReferenceBootstrap?.selfCheck?.() || null,
    runtime: window.BaumanL6ReferenceLessonRuntime?.selfCheck?.() || null
  }));
}

async function openFoundation(page) {
  const handled = await page.evaluate(() => window.openLesson?.('f_s01_l1') === true);
  await page.waitForSelector('[data-l6-reference-modal="true"] .universal-lesson', {
    state: 'visible',
    timeout: 10000
  });
  await page.locator('[data-universal-action="open-specialist"][data-capability-ref="speech-recording"]').click();
  await page.waitForSelector('[data-l6-oral-widget="foundation-oral-rehearsal"]', {
    state: 'visible',
    timeout: 7000
  });
  return handled;
}

async function openRussian(page) {
  await page.waitForFunction(() => {
    return document.querySelector('[data-view="learning"]')
      && window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.().ok === true;
  }, null, { timeout: 20000 });
  await page.evaluate(() => document.querySelector('[data-view="learning"]')?.click());
  await page.waitForSelector('.learn-canva-shell .lesson-reader', { state: 'visible', timeout: 12000 });
  await page.waitForFunction(() => {
    return document.querySelectorAll('.learn-canva-shell [data-lesson]').length > 0
      && document.querySelectorAll('.learn-canva-shell [data-slide]').length > 0
      && document.querySelector('.learn-canva-shell [data-act="open-present"]');
  }, null, { timeout: 10000 });
}

async function openMath(page) {
  await page.waitForFunction(() => {
    return window.BAUMAN_MATH_THEORY_E129?.selfCheck?.().ok === true
      && window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.().ok === true;
  }, null, { timeout: 25000 });
  await page.evaluate(() => window.BAUMAN_MATH_THEORY_E129?.render?.());
  await page.waitForSelector('.e129-theory-shell .e129-reader', { state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => {
    return document.querySelector('[data-current-lesson]')
      && document.querySelectorAll('.e129-theory-shell .e129-slide').length >= 16
      && document.querySelector('.e129-theory-shell [data-e129-present]');
  }, null, { timeout: 15000 });
}

async function openSubjectSurface(page, subjectId) {
  if (subjectId === 'russian') await openRussian(page);
  if (subjectId === 'math') await openMath(page);
  if (subjectId === 'foundation') {
    const ready = await waitFoundation(page);
    const handled = await openFoundation(page);
    return { ready, handled };
  }
  return null;
}

async function subjectProbe(page, subjectId) {
  return page.evaluate((id) => {
    if (id === 'russian') {
      const self = window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.();
      return {
        ok: self?.ok === true
          && document.querySelectorAll('.learn-canva-shell [data-lesson]').length > 0
          && document.querySelectorAll('.learn-canva-shell [data-slide]').length > 0
          && !!document.querySelector('.learn-canva-shell [data-act="open-present"]'),
        self: self || null,
        lessonsShown: document.querySelectorAll('.learn-canva-shell [data-lesson]').length,
        slidesShown: document.querySelectorAll('.learn-canva-shell [data-slide]').length,
        evidenceEngineLoaded: !!window.BaumanReferenceSubjectEvidenceReview,
        referenceRuntimeLoaded: !!window.BaumanL6ReferenceLessonRuntime
      };
    }
    if (id === 'math') {
      const e129 = window.BAUMAN_MATH_THEORY_E129?.selfCheck?.();
      const e246 = window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.();
      return {
        ok: e129?.ok === true
          && e246?.ok === true
          && e129?.sources?.content === 18
          && document.querySelectorAll('.e129-theory-shell .e129-slide').length >= 16
          && !!document.querySelector('.e129-theory-shell [data-current-lesson]')
          && !!document.querySelector('.e129-theory-shell [data-e129-present]'),
        e129: e129 || null,
        e246: e246 || null,
        currentLesson: document.querySelector('.e129-theory-shell [data-current-lesson]')?.getAttribute('data-current-lesson') || '',
        slidesShown: document.querySelectorAll('.e129-theory-shell .e129-slide').length,
        evidenceEngineLoaded: !!window.BaumanReferenceSubjectEvidenceReview,
        referenceRuntimeLoaded: !!window.BaumanL6ReferenceLessonRuntime
      };
    }
    const self = window.BaumanL6ReferenceLessonRuntime?.selfCheck?.();
    return {
      ok: self?.ready === true
        && self?.lessonId === 'f_s01_l1'
        && self?.masterReadyClaimed === false
        && document.querySelectorAll('[data-l6-reference-modal="true"] .ul-block').length === 10
        && !!document.querySelector('[data-l6-oral-widget="foundation-oral-rehearsal"]'),
      self: self || null,
      sections: document.querySelectorAll('[data-l6-reference-modal="true"] .ul-block').length,
      oralWidget: !!document.querySelector('[data-l6-oral-widget="foundation-oral-rehearsal"]'),
      evidenceEngineLoaded: !!window.BaumanReferenceSubjectEvidenceReview
    };
  }, subjectId);
}

async function surfaceMetrics(page, subjectId, viewport) {
  const spec = profile.subjects[subjectId];
  return page.evaluate(({ id, spec, viewport, browserContract }) => {
    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) !== 0
        && rect.width > 0
        && rect.height > 0;
    };
    const accessibleName = (element) => {
      const labelledBy = element.getAttribute('aria-labelledby');
      const labelledText = labelledBy
        ? labelledBy.split(/\s+/).map((token) => document.getElementById(token)?.textContent || '').join(' ')
        : '';
      const explicitLabel = element.id
        ? document.querySelector('label[for="' + CSS.escape(element.id) + '"]')?.textContent || ''
        : '';
      return [
        element.getAttribute('aria-label'),
        labelledText,
        explicitLabel,
        element.getAttribute('title'),
        element.getAttribute('alt'),
        element.getAttribute('placeholder'),
        element.textContent,
        element.value
      ].map((value) => String(value || '').trim()).find(Boolean) || '';
    };
    const surface = document.querySelector(spec.browserSurface.surfaceSelector);
    const surfaceRect = surface?.getBoundingClientRect();
    const requiredMissing = spec.browserSurface.requiredSelectors
      .filter((selector) => !document.querySelector(selector));
    const controls = surface
      ? Array.from(surface.querySelectorAll('button,a[href],input,select,textarea,[tabindex]'))
        .filter((element) => isVisible(element) && !element.disabled && element.getAttribute('tabindex') !== '-1')
      : [];
    const controlMetrics = controls.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        name: accessibleName(element),
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10
      };
    });
    const firstFocusable = controls[0] || surface;
    try { firstFocusable?.focus?.({ preventScroll: true }); } catch (_) { firstFocusable?.focus?.(); }
    const active = document.activeElement;
    const dialog = id === 'foundation' ? document.querySelector('.universal-reference-dialog') : null;
    const dialogBody = id === 'foundation' ? document.querySelector('.universal-reference-body') : null;
    const dialogRect = dialog?.getBoundingClientRect();
    const automaticClaimNodes = document.querySelectorAll(
      '[data-master-ready="true"],[data-master-ready-claimed="true"],[data-evidence-status="verified"]'
    ).length;
    return {
      surfaceVisible: isVisible(surface),
      requiredMissing,
      headings: surface ? surface.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]').length : 0,
      textLength: surface ? surface.innerText.trim().length : 0,
      controlCount: controlMetrics.length,
      unnamedControls: controlMetrics.filter((item) => item.name === ''),
      minTargetWidth: controlMetrics.length ? Math.min(...controlMetrics.map((item) => item.width)) : 0,
      minTargetHeight: controlMetrics.length ? Math.min(...controlMetrics.map((item) => item.height)) : 0,
      focusedInsideSurface: !!surface && !!active && (surface === active || surface.contains(active)),
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      documentOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      surfaceLeft: surfaceRect?.left ?? null,
      surfaceRight: surfaceRect?.right ?? null,
      surfaceWidth: surfaceRect?.width || 0,
      foundationDialogOverflow: dialogBody ? Math.max(0, dialogBody.scrollWidth - dialogBody.clientWidth) : null,
      foundationDialogLeft: dialogRect?.left ?? null,
      foundationDialogRight: dialogRect?.right ?? null,
      viewportMeta: !!document.querySelector('meta[name="viewport"]'),
      viewportWidth: window.innerWidth,
      expectedViewportWidth: viewport.width,
      hasHutech: /HUTECH/i.test(document.body.innerText),
      automaticClaimNodes,
      masterReadyClaimed: window.BaumanL6ReferenceLessonRuntime?.selfCheck?.().masterReadyClaimed === true,
      evidenceEngineLoaded: !!window.BaumanReferenceSubjectEvidenceReview,
      maxDocumentOverflowPx: browserContract.maxDocumentOverflowPx,
      maxFoundationDialogOverflowPx: browserContract.maxFoundationDialogOverflowPx,
      minimumMobileTargetSizePx: browserContract.minimumMobileTargetSizePx
    };
  }, { id: subjectId, spec, viewport, browserContract: profile.browserContract });
}

function assertSurface(prefix, subjectId, viewport, probe, metrics, diag) {
  check(prefix + '-READY', subjectId + ' actual representative learning surface and runtime probes are ready',
    probe?.ok === true && metrics.surfaceVisible && metrics.requiredMissing.length === 0,
    { probe, surfaceVisible: metrics.surfaceVisible, requiredMissing: metrics.requiredMissing });
  check(prefix + '-PEDAGOGY-A11Y', subjectId + ' surface has source-grounded content, headings, named controls and a keyboard-focus path',
    metrics.textLength > 80
      && metrics.headings > 0
      && metrics.controlCount > 0
      && metrics.unnamedControls.length === 0
      && metrics.focusedInsideSurface,
    {
      textLength: metrics.textLength,
      headings: metrics.headings,
      controlCount: metrics.controlCount,
      unnamedControls: metrics.unnamedControls,
      focusedInsideSurface: metrics.focusedInsideSurface
    });
  const mobileTargets = viewport.id !== 'mobile'
    || (metrics.minTargetWidth >= profile.browserContract.minimumMobileTargetSizePx
      && metrics.minTargetHeight >= profile.browserContract.minimumMobileTargetSizePx);
  const foundationDialog = subjectId !== 'foundation'
    || (metrics.foundationDialogOverflow <= profile.browserContract.maxFoundationDialogOverflowPx
      && metrics.foundationDialogLeft >= -1
      && metrics.foundationDialogRight <= viewport.width + 1);
  check(prefix + '-RESPONSIVE', subjectId + ' surface reflows at ' + viewport.id + ' without material document or dialog overflow',
    metrics.viewportMeta
      && metrics.viewportWidth === viewport.width
      && metrics.documentOverflow <= profile.browserContract.maxDocumentOverflowPx
      && metrics.surfaceWidth > 0
      && mobileTargets
      && foundationDialog,
    {
      viewportWidth: metrics.viewportWidth,
      documentOverflow: metrics.documentOverflow,
      surfaceLeft: metrics.surfaceLeft,
      surfaceRight: metrics.surfaceRight,
      minTargetWidth: metrics.minTargetWidth,
      minTargetHeight: metrics.minTargetHeight,
      foundationDialogOverflow: metrics.foundationDialogOverflow,
      foundationDialogLeft: metrics.foundationDialogLeft,
      foundationDialogRight: metrics.foundationDialogRight
    });
  check(prefix + '-INTEGRITY', subjectId + ' reduced-motion execution emits no error, identity drift, evidence or Master-ready claim',
    metrics.reducedMotion
      && !metrics.hasHutech
      && metrics.automaticClaimNodes === 0
      && metrics.masterReadyClaimed === false
      && metrics.evidenceEngineLoaded === false
      && diag.consoleErrors.length <= profile.browserContract.consoleErrorTolerance
      && diag.pageErrors.length <= profile.browserContract.pageErrorTolerance,
    {
      reducedMotion: metrics.reducedMotion,
      hasHutech: metrics.hasHutech,
      automaticClaimNodes: metrics.automaticClaimNodes,
      masterReadyClaimed: metrics.masterReadyClaimed,
      evidenceEngineLoaded: metrics.evidenceEngineLoaded,
      consoleErrors: diag.consoleErrors,
      pageErrors: diag.pageErrors
    });
}

async function onlineFlow(browser) {
  for (const viewport of VIEWPORTS) {
    for (const subjectId of SUBJECT_ORDER) {
      const prefix = 'ONLINE-' + subjectId.toUpperCase() + '-' + viewport.id.toUpperCase();
      const context = await newContext(browser, viewport, 'block');
      const page = await context.newPage();
      const diag = diagnostics(page);
      let probe = null;
      let metrics = null;
      let navigationError = '';
      try {
        await page.goto(BASE_URL + '/' + profile.subjects[subjectId].route, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await openSubjectSurface(page, subjectId);
        await page.waitForTimeout(250);
        probe = await subjectProbe(page, subjectId);
        metrics = await surfaceMetrics(page, subjectId, viewport);
        assertSurface(prefix, subjectId, viewport, probe, metrics, diag);
      } catch (error) {
        navigationError = errorText(error);
        check(prefix + '-FATAL', subjectId + ' ' + viewport.id + ' surface completes without fatal browser error', false,
          { navigationError, consoleErrors: diag.consoleErrors, pageErrors: diag.pageErrors });
      }
      onlineEvidence.push({ subjectId, viewport, navigationError, probe, metrics, diagnostics: diag });
      await context.close();
    }
  }
}

async function ensureLoggedIn(page) {
  await page.waitForFunction(() => !!window.app && !!window.auth, null, { timeout: 10000 });
  const hidden = await page.evaluate(() => document.getElementById('appRoot')?.classList.contains('hidden') === true);
  if (hidden) {
    await page.click('#loginBtn');
    await page.waitForFunction(() => {
      const root = document.getElementById('appRoot');
      return root && !root.classList.contains('hidden');
    }, null, { timeout: 10000 });
  }
}

async function preparePacks(page) {
  for (const subjectId of SUBJECT_ORDER) {
    const result = await page.evaluate(async (id) => {
      const out = await window.BaumanOfflineSubjectPackManager.prepareBase(id);
      return {
        packId: out?.packId || '',
        ok: (out?.ok || []).map((item) => ({
          pathname: new URL(item.url).pathname,
          bytes: item.bytes || 0
        })),
        failed: out?.failed || [],
        skipped: out?.skipped || []
      };
    }, subjectId);
    const pathnames = result.ok.map((item) => item.pathname);
    const missingCritical = CRITICAL_PACK_SUFFIXES[subjectId].filter((suffix) => {
      return !pathnames.some((pathname) => pathname.endsWith(suffix));
    });
    const evidence = { subjectId, ...result, missingCritical };
    packEvidence.push(evidence);
    check('PACK-' + subjectId.toUpperCase(), subjectId + ' explicit base pack captures the actual B8 surface without failed, skipped or missing critical resources',
      result.packId === 'subject-' + subjectId + '-base'
        && result.ok.length > 0
        && result.failed.length === 0
        && result.skipped.length === 0
        && missingCritical.length === 0,
      {
        packId: result.packId,
        resources: result.ok.length,
        bytes: result.ok.reduce((sum, item) => sum + item.bytes, 0),
        failed: result.failed,
        skipped: result.skipped,
        missingCritical
      });
  }
}

async function registerServiceWorker(page) {
  const result = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/service-worker.js?l7-b8=1', { scope: '/' });
    await navigator.serviceWorker.ready;
    const started = Date.now();
    while (!navigator.serviceWorker.controller && Date.now() - started < 10000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return {
      active: !!registration.active,
      controlled: !!navigator.serviceWorker.controller,
      scope: registration.scope
    };
  });
  check('OFFLINE-SERVICE-WORKER', 'existing site-root Service Worker activates and controls the offline QA context',
    result.active && result.controlled && result.scope === ORIGIN + '/', result);
}

async function offlineSubject(context, subjectId, viewport) {
  const page = await context.newPage();
  const diag = diagnostics(page);
  let navigationError = '';
  let probe = null;
  let metrics = null;
  try {
    await page.goto(BASE_URL + '/' + profile.subjects[subjectId].route, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await openSubjectSurface(page, subjectId);
    await page.waitForTimeout(250);
    probe = await subjectProbe(page, subjectId);
    metrics = await surfaceMetrics(page, subjectId, viewport);
  } catch (error) {
    navigationError = errorText(error);
  }
  const evidence = { subjectId, navigationError, probe, metrics, diagnostics: diag };
  offlineEvidence.push(evidence);
  check('OFFLINE-' + subjectId.toUpperCase(), subjectId + ' actual representative learning surface reopens from its explicit base pack',
    navigationError === ''
      && probe?.ok === true
      && metrics?.surfaceVisible === true
      && metrics?.requiredMissing?.length === 0
      && metrics?.textLength > 80
      && metrics?.headings > 0
      && metrics?.controlCount > 0
      && metrics?.unnamedControls?.length === 0
      && metrics?.focusedInsideSurface === true
      && metrics?.reducedMotion === true
      && metrics?.documentOverflow <= profile.browserContract.maxDocumentOverflowPx
      && metrics?.hasHutech === false
      && metrics?.automaticClaimNodes === 0
      && metrics?.masterReadyClaimed === false
      && metrics?.evidenceEngineLoaded === false
      && diag.consoleErrors.length === 0
      && diag.pageErrors.length === 0
      && diag.requestFailures.length === 0,
    evidence);
  await page.close();
}

async function offlineFlow(browser) {
  const viewport = { id: 'offline-desktop', width: 1280, height: 800 };
  const context = await newContext(browser, viewport, 'allow');
  const setupPage = await context.newPage();
  const setupDiagnostics = diagnostics(setupPage);
  await setupPage.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await ensureLoggedIn(setupPage);
  await preparePacks(setupPage);
  await registerServiceWorker(setupPage);
  await setupPage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await setupPage.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
  check('OFFLINE-SETUP-DIAGNOSTICS', 'pack preparation and Service Worker setup emit no page or console errors',
    setupDiagnostics.consoleErrors.length === 0 && setupDiagnostics.pageErrors.length === 0,
    setupDiagnostics);
  await context.setOffline(true);
  await setupPage.close();
  for (const subjectId of SUBJECT_ORDER) await offlineSubject(context, subjectId, viewport);
  await context.setOffline(false);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  });
  try {
    await onlineFlow(browser);
    await offlineFlow(browser);
  } catch (error) {
    failures.push('BROWSER-FATAL: ' + errorText(error));
  } finally {
    await browser.close();
  }

  const passed = checks.filter((item) => item.ok).length;
  const report = {
    schema: 'L7_B8_REFERENCE_BROWSER_QA_V1',
    release: profile.release,
    status: failures.length ? 'FAIL' : 'PASS',
    branch: 'migration/webapp-l1-audit-storage',
    generatedFor: '2026-08-27',
    baseUrl: BASE_URL,
    summary: {
      total: checks.length,
      passed,
      failed: checks.length - passed,
      onlineSurfaces: onlineEvidence.length,
      expectedOnlineSurfaces: profile.browserContract.requiredOnlineSurfaceCount,
      offlineSubjects: offlineEvidence.length,
      expectedOfflineSubjects: profile.browserContract.requiredOfflineSubjectCount,
      subjectPacks: packEvidence.length
    },
    online: onlineEvidence,
    packs: packEvidence.map((item) => ({
      subjectId: item.subjectId,
      packId: item.packId,
      resources: item.ok.length,
      bytes: item.ok.reduce((sum, resource) => sum + resource.bytes, 0),
      failed: item.failed,
      skipped: item.skipped,
      missingCritical: item.missingCritical
    })),
    offline: offlineEvidence,
    checks,
    failures,
    passMeaning: 'Nine online representative surfaces and three explicit-pack offline surfaces completed the B8 responsive, accessibility, source/runtime and claim-boundary probes. This is not manual review of all 406 lessons or resolution of the open Foundation content findings.'
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  console.log('L7-B8 reference browser QA: ' + report.status + ' (' + passed + '/' + checks.length + ')');
  console.log('Online surfaces: ' + onlineEvidence.length + '/' + profile.browserContract.requiredOnlineSurfaceCount);
  console.log('Offline subjects: ' + offlineEvidence.length + '/' + profile.browserContract.requiredOfflineSubjectCount);
  console.log('Subject packs: ' + packEvidence.length + '/3');
  console.log('Report: ' + REPORT_PATH);
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(2);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
