# CODEX_STATE

Current task: `BAUMAN_CHAT_FIRST_PRESERVATION_AND_SAFE_REDESIGN`

Status: `SAFE_REDESIGN_R1_ACTIVE`

Date: 2026-09-17
Branch: `work/math-presenter-runtime-gate`
Base main: `f86c8ac3c68177d873c4bf702c621b5cb560c247`

## Operating policy
- CHAT FIRST. Use normal chat/GitHub tools for repo inspection, diffs, code/data/UI fixes, CI and review whenever possible.
- WORK LAST. Work is allowed only when a required GUI/live-browser workflow cannot be completed from chat.
- Work must be surgical: one narrow task, minimum files, no whole-project rewrite.
- Keep one active working branch plus `main`; do not create extra working branches unless explicitly requested.

## Preservation baseline — GREEN
- Windows checkout: PASS.
- Cloudflare Preview boundary: PASS.
- Whole-system static validation + changed JavaScript parse: PASS.
- Whole-system browser acceptance: PASS.
- Math Study Command Center browser acceptance: PASS.
- Hub V2 responsive acceptance, including 1536x864: PASS.
- Packaged owner-private ChatGPT Site browser acceptance: PASS.
- Packaged Hub V2 responsive acceptance: PASS.
- The transient `hub-mountains.svg net::ERR_ABORTED` request did not reproduce on rerun or post-merge main validation and was not masked by weakening the test.

## Current safe redesign state
- The preservation baseline requirement is satisfied; premium Hub redesign may proceed.
- Authoritative runtime remains `assets/js/main.js` + Planning + Academic 2026 + Scheduler + Device Gate.
- `hub-safe-shell.js` remains additive and does not replace `app.home()`, route ownership or canonical state.
- Dormant legacy V2 orchestration files remain non-authoritative and are not booted by root `index.html`.
- Safe Redesign R1 adds only a presentation stylesheet: `assets/css/hub-safe-redesign-r1.css`.
- R1 improves premium depth, subject-card hierarchy, focus visibility and reduced-motion behavior without changing dashboard heights or hiding functions.

## Gate state for R1
- R1 CI/regression validation: pending current branch run.
- W4 publication: BLOCKED until the safe redesign sequence is completed and receives a fresh W3 acceptance lineage.

## Protected contracts
- Preserve all existing learning content, JSON/data, progress/state, schedule, routes and subject apps.
- Preserve §1.4, §1.5, §1.6 accepted Math runtime behavior.
- §1.6 remains 22 source slides -> 22 runtime slides, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not weaken Device Gate outside the explicit owner-private ChatGPT Site package boundary.
- No simulation changes unless explicitly requested.

## Safe redesign rule
Continue in small additive/presentational slices. Do not replace `app.home`, route ownership, canonical state stores, subject registries or existing learning content. Each slice must pass whole-system, Math, Hub responsive and packaged ChatGPT Site gates before merge.
