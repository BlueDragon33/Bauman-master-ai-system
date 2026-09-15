# CODEX_STATE

Current task: `BAUMAN_CHAT_FIRST_PRESERVATION_AND_SAFE_REDESIGN`

Status: `PRESERVATION_BASELINE_REVIEW_ACTIVE`

Date: 2026-09-15
Branch: `main`

## Operating policy
- CHAT FIRST. Use normal chat/GitHub tools for repo inspection, diffs, code/data/UI fixes, CI and review whenever possible.
- WORK LAST. Work is allowed only when a required GUI/live-browser workflow cannot be completed from chat.
- Work must be surgical: one narrow task, minimum files, no whole-project rewrite.

## Current recovery state
- The previous Hub V2 orchestration layer was found to replace `app.home()` and rebuild the navigation DOM.
- `hub-premium-v2.js`, `hub-premium-v2.css`, `hub-device-layout.css` and `hub-mobile-scroll-contract.css` are currently NOT booted by root `index.html`.
- Authoritative runtime remains `assets/js/main.js` + Planning + Academic 2026 + Scheduler + Device Gate.
- Work-created visual assets/files remain in the repository only as dormant reference/salvage material; they are not authoritative runtime.
- Canonical subject data/content was not intentionally deleted during recovery.

## Gate state
- Device Gate: must remain PASS.
- Windows checkout: must remain PASS.
- Academic 2026: must remain PASS.
- Whole-system static validation: PASS on preservation baseline.
- Whole-system browser preservation gate: revalidation active.
- W4 publication: BLOCKED until safe redesign is completed and revalidated.

## Protected contracts
- Preserve all existing learning content, JSON/data, progress/state, schedule, routes and subject apps.
- Preserve §1.4, §1.5, §1.6 accepted Math runtime behavior.
- §1.6 remains 22 source slides -> 22 runtime slides, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not weaken Device Gate outside the explicit owner-private ChatGPT Site package boundary.

## Safe redesign rule
The requested premium Bauman Hub design may resume only after the preservation baseline is green. New design work must be additive/presentational where possible and must not replace `app.home`, route ownership, canonical state stores, subject registries or existing content.
