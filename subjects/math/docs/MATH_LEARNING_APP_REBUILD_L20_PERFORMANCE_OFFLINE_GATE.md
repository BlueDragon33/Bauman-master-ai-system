# Math Learning Application Rebuild — LƯỢT 20 Performance + Offline/Cache Gate

## Result
**PASS — CRITICAL-PATH / OFFLINE ARCHITECTURE GATE**

## Critical rendering path
Before this pass, `core.css` (~950 KB) was render-blocking.

The entry point now:
- loads the clean `core-subject.css` (~16 KB) synchronously;
- preloads legacy `core.css` and applies it asynchronously in its original cascade position;
- keeps a noscript fallback;
- removes Runtime Health and Regression Gate CSS/JS from the critical path.

Static entry-point audit after the change:
- active render-blocking stylesheets: 21
- render-blocking CSS bytes: ~311 KB
- legacy core blocking: false
- legacy core preload: true
- synchronous diagnostic scripts: 0

The large legacy core is not deleted yet because browser coverage has not proven it can be fully retired without breaking advanced/legacy renderer surfaces.

## Non-critical diagnostics
`math-bootstrap.js` loads Regression Gate and Runtime Health during browser idle time (with timeout fallback).

## Offline architecture
A subject-scoped `sw.js` now provides:
- minimal shell precache;
- network-first navigation;
- network-first JSON with cached fallback;
- stale-while-revalidate for static assets;
- cache version cleanup;
- same-origin GET-only interception.

Large datasets are not eagerly precached.
When they are actually requested successfully, responses within the cache budget can be cached for later offline fallback.

## Network state
Bootstrap exposes online/offline state and updates learner-facing save status when offline.
Learner progress remains local-first.

## Gate
- 950 KB legacy core removed from blocking path: PASS
- clean shell CSS first paint: PASS
- diagnostics deferred to idle: PASS
- subject-scoped service worker: PASS
- offline shell cache: PASS
- JSON offline fallback after successful fetch: PASS
- no eager precache of giant lesson datasets: PASS

Further full deletion/bundling of legacy CSS/JS requires browser coverage and belongs to the final regression/release cleanup, not guess-based optimization.
