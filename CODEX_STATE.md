# CODEX_STATE

Current task: `RUSSIAN_LISTENING_VISUAL_FIRST_ARCHITECTURE`

Status: `RUSSIAN_RECONCILIATION_PROMOTION_DECISION`

Project phase: `5/5 — RECONCILIATION & PROMOTION DECISION`

Date: 2026-09-19
Branch: `work/russian-listening-visual-first-architecture`
PR: `#55 — Draft`
Parent checkpoint: `676fe08d05e6d92ff4479620ad9bf00abe5f8da6`
Latest accepted 9/9 checkpoint: `1d0c75e72acb8f0b23f250afc54a4278671d8949`

## Responsibility

**Subject Web App — Russian learning architecture**

This branch does not expand Foundation authority and must not merge unpromoted Foundation history into `main`.

## Architecture already completed

1. Listening/speaking is the first learning step.
2. Alphabet recognition + handwriting is an explicit early step.
3. Existing lesson, speaking, vocabulary, grammar, assessment and learner-state datasets remain preserved.
4. Vietnam-stage vocabulary is visual/context-first:
   - no learner-facing Vietnamese translation as the flashcard answer;
   - no English-equivalent answer;
   - image/symbol + Russian explanation + situational usage instead.
5. Learner-facing “Lật nghĩa” wording was removed in favor of contextual hints.
6. AI vocabulary helper no longer exposes an English-equivalent answer.
7. Seven-step learning-flow/evidence contracts are gated.
8. Handwriting presentation is explicitly non-canonical unless a vetted authority exists.

## Handwriting hardening completed

### R-HW1 — Deterministic recognition foundation
- capability/presentation authority boundary;
- print → handwriting recognition drill;
- recognition evidence never auto-masters alphabet;
- exact writing resume + Review Queue integration;
- direct/package/offline parity and adversarial audit.

### R-HW2–R-HW4 — Browser and persistence hardening
- deterministic browser acceptance;
- direct + packaged runtime parity;
- miss/reload persistence;
- exact Review Queue item and writing resume route retained.

### R-HW5 — Weak-letter recovery scheduler
- a missed letter remains weak after one later correct answer;
- first correct confirmation schedules a later review;
- two consecutive correct confirmations after the latest miss are required before removal;
- due weak letters are prioritized;
- no mastery/completed fabrication.

### R-HW6 — Trusted glyph authority gate
- system fonts are preview-only;
- production scoring is blocked by default;
- scoring requires `bundled-vetted` authority metadata;
- test scoring authority remains isolated to E2E fixtures.

### R-HW7 — Authority promotion contract
- `blocked` and `ready` states are audited;
- ready authority requires real local font + license + verification metadata;
- remote URLs/path traversal are rejected.

### R-HW8 — Integrity + 33-letter coverage
- SHA-256 metadata for font, license and coverage manifest;
- promotion audit hashes repo files and compares digests;
- coverage must enumerate the exact 33 handwriting alphabet IDs;
- coverage font families must match trusted authority families.

### R-HW9 — Authority cache freshness
- authority JS is network-first online;
- cached authority remains an offline fallback;
- PWA cannot remain indefinitely on stale `blocked` authority after a valid promotion.

### R-HW10 — Runtime authority verification
Accepted checkpoint: `8d05924dfd04f11403f47a14e4f03ee4fac708b6`

- browser runtime downloads bundled font/license/coverage;
- SHA-256 is recomputed in browser with Web Crypto;
- coverage is revalidated against all 33 current alphabet IDs;
- bundled font is loaded via `FontFace`;
- Cyrillic glyph probe must pass after loading;
- `canScore=true` only after runtime status becomes `verified`;
- direct and packaged Russian Handwriting Recognition Acceptance PASS;
- full checkpoint: 9/9 workflows PASS.

### R-HW11 — Offline Promotion Completeness
Accepted checkpoint: `3187b4e1e7f967c862d5b63deb5709073983ed0e`

- ready authority font/license/coverage must live under `assets/handwriting-authority/`;
- all three assets must be Service Worker precached;
- authority namespace stays network-first with offline cache fallback;
- Cloudflare build must copy the complete `subjects/` tree;
- ChatGPT Site build must preserve the accepted runtime tree;
- policy self-tests reject tampered digests, 32/33 coverage, missing precache, wrong namespace and remote assets;
- full checkpoint: 9/9 workflows PASS.

### R-HW12 — Ready Authority Offline Browser Acceptance
Accepted checkpoint: `58a0414dd0287bf2407190ac967c926b4ea20f78`

- isolated temporary ready-authority fixture; production authority/assets remain untouched;
- real Service Worker installs and controls the Russian runtime;
- font/license/coverage are verified present in the app-shell cache;
- browser is forced fully offline and reloaded from Service Worker/cache;
- runtime remains `verified`, `canScore=true`, exposes four choices and records a scored miss offline;
- transport-level offline resource noise is retained as evidence but application/page errors remain forbidden;
- full checkpoint: 9/9 workflows PASS.

### R-HW13 — Packaged Ready Authority Offline Parity
Accepted checkpoint: `4010e23c527adeda9950b20a4452bf21c1a0f5c8`

- R-HW12 fixture can source either repository runtime or materialized `dist/`;
- packaged fixture mutation remains isolated in a temporary tree;
- packaged Russian Service Worker installs and controls the test runtime;
- packaged authority remains runtime-verified and score-capable after a fully offline reload;
- separate source and packaged offline evidence are retained;
- full checkpoint: 9/9 workflows PASS.

## Phase 4 closure

### R-HW14 — Phase-4 Closure & Promotion-Slice Audit
Accepted checkpoint: `1d0c75e72acb8f0b23f250afc54a4278671d8949`

- promotion slice is computed from parent checkpoint `676fe08d05e6d92ff4479620ad9bf00abe5f8da6`;
- closure audit runs with full Git history;
- no `foundation/**`, Academic or Content Resolution authority path exists in the Russian slice;
- source + packaged recognition and ready-authority offline parity remain green;
- full checkpoint: 9/9 workflows PASS;
- Phase 4/5 is CLOSED.

## Active auto-generated work

### R-P1 — Clean Main-Based Promotion Candidate

Goal: reconstruct the accepted Russian promotion slice on top of current `main` without inheriting unrelated branch history.

1. Start a separate candidate branch from current `main`.
2. Copy only files whose `main` version equals the parent checkpoint or which were newly added after the parent.
3. Exclude working-state metadata (`CODEX_STATE.md`, `CODEX_TASK.md`) from the promotion candidate.
4. For `.github/workflows/system-integration-ci.yml`, reapply only Russian post-parent CI additions onto the current `main` file.
5. For `tests/system-browser-acceptance.mjs`, reapply only the Russian post-parent assertion onto current `main`.
6. Compare candidate against `main` and reject any Foundation/Academic/Content Resolution path.
7. Run candidate CI without changing PR #55 or merging `main`.
8. Resolve any candidate-only compatibility failures.
9. Produce an explicit promotion decision checkpoint; merge remains a separate explicit action.

## Validation policy

Every accepted checkpoint must keep all of these green:
- Russian Reference UI Gate
- Whole System Integration Gate
- Packaged Hub Responsive Acceptance
- Academic 2026 Prerequisite Gate
- Bauman Runtime Device Gate CI
- Bauman Cloudflare Preview CI
- Windows checkout safety
- Foundation Domain Model Gate
- Content Asset Provenance Gate
- Content Resolution & Runtime Delivery Gate

The branch uses fail-closed behavior: missing, stale, malformed, unlicensed, unhashed or unverified handwriting authority must never enable recognition scoring.

## Remaining phase before merge

Current position is **Phase 4/5: Hardening & Promotion Readiness**.

Phase 5 is not feature development. It consists of:
1. finish remaining hardening gaps found by audits/browser tests;
2. reconcile branch history so this Russian slice cannot accidentally promote unrelated Foundation commits;
3. make an explicit promotion decision;
4. only then merge the accepted Russian slice into `main`.

## Branch/merge rule

Do not merge to `main` until:
- all active hardening checks are green;
- branch history is reconciled;
- no unpromoted Foundation work is pulled in;
- explicit promotion decision is made.
