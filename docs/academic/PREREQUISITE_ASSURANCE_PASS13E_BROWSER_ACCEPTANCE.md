# Pass 13E · Browser/E2E Acceptance

Status: `BROWSER_E2E_BASELINE_VALIDATED`

Validated branch: `temp/bauman-master-hub-prereq-2026`

Baseline validated head: `b0e016ba6239f03aec494e9de57586d22eb35706`

Baseline GitHub Actions run: `34554949064` · SUCCESS

## Purpose

Pass13E moves the Academic 2026 integration beyond static Node validators and exercises the Hub in a real Chromium browser. The suite uses the real frontend runtime, WebCrypto/IndexedDB device client, localStorage state, Main/PlanningBridge wrappers, Academic diagnostic/risk runtime and Scheduler Preview. Only the Control API transport is mocked so CI can deterministically exercise approved, pending and offline-grace device states.

## Browser scenarios validated

- Approved device path reaches `authorized` through the real device-access client and hides the device gate.
- Login opens the Main Hub.
- PlanningBridge, Academic 2026 and Scheduler Preview wrappers coexist without duplicate Home overlays.
- Official Roadmap renders all four semesters.
- Diagnostic state transitions, failed-node repair routing and MASTERED STOP behavior execute in-browser.
- Manual and external/unknown schedule entries remain protected from preview replacement.
- Scheduler Preview does not mutate `schedule.entries`.
- Preview rollback baseline covers every proposed diff.
- Schedule fingerprint becomes stale after Main schedule changes.
- Responsive Academic Home passes at a 390px viewport without horizontal overflow.
- Legacy Academic diagnostic data migrates into the dedicated per-user diagnostic store after reload.
- Academic scheduler compatibility remains advice-only with automatic mutation disabled.
- Valid prior device verification falls back to `offline-grace` when the Control service becomes unavailable.
- A pending device remains blocked behind the device gate with its device code visible.

## Real runtime defects found by the browser gate

The browser gate found two defects that static validation had missed. Both were fixed before this pass was accepted.

### 1. Scheduler Preview init-order race

The preview runtime could patch `app.home` after the Academic globals existed but before the Academic Home wrapper itself had completed. The preview wrapper would then run before the Academic shell existed and its panel would never be inserted.

Fix: Scheduler Preview initialization now waits for the loaded prerequisite packs and `window.app.__academic2026Patched` before wrapping Home. `validate-scheduler-preview-13d.js` now guards this ordering invariant.

### 2. `stageActivationPolicy` was looked up using the wrong property

The policy records are keyed by `stage`, but the runtime used the generic `byId()` helper, which searches `id`. The result was an empty fallback policy and active prerequisites such as P1 were incorrectly reported as HOLD.

Fix: `stagePolicy()` now searches `x.stage === stageId`. `validate-risk-engine-13c.js` now asserts the exact stage-key lookup and tests P1 ACTIVE, P4 SECONDARY and P12 LOCKED for `before_stankin`.

## PWA scope note

The browser runner confirms that the browser supports Service Workers but currently observes zero registrations in this Main shell. Therefore Pass13E validates device offline-grace, not a complete PWA offline-cache lifecycle. No PWA-cache PASS is claimed here.

## Acceptance boundary

Pass13E authorizes implementation/testing of an explicit transactional Apply path. It does not authorize background/automatic schedule mutation, and it does not by itself authorize merge to `main`.