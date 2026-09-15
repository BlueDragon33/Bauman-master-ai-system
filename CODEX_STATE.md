# CODEX_STATE

Current task: `WHOLE_SYSTEM_QA_W3_HUB_REDESIGN`

Status: `W3_REOPENED_FOR_HUB_REFERENCE_RESPONSIVE_REVALIDATION`

Date: 2026-09-15
Branch: `main`

## Reason W3 was reopened
The user explicitly requested a runtime redesign of Bauman Master Hub based on the approved premium dashboard reference. Runtime changed after the previous W3 acceptance, therefore W4 publication is blocked again until the new Hub runtime is revalidated.

## New Hub runtime scope
- Keep existing auth, planning state, schedules, Subject Bridge and subject applications authoritative.
- Use the premium Bauman navy/gold dashboard visual target: left navigation, global search, hero, subject cards, Continue Learning, AI Assistant, today's schedule, achievements and overall progress.
- Use real Bauman subjects/data instead of fake reference-only subjects.
- Keep the `Giao diện` control and allow theme, font, text size and density adjustment.
- Explicit responsive modes: laptop 16:9, iPad/tablet 3:2, iPhone portrait 19.5:9.
- New device contract stylesheet: `assets/css/hub-device-layout.css`.
- `hub-premium-v2.js` remains the UI orchestration layer and keeps Main routes/data authoritative.

## Gate state
- W0: PASS.
- W1 §1.6 runtime: PASS.
- W2 system audit/repair: PASS.
- Prior W3: PASS for the previously verified runtime.
- Current W3 revalidation: ACTIVE for the Hub redesign.
- W4 publication: BLOCKED until this new runtime passes static/integration/browser/responsive checks.

## Protected contracts
- §1.4, §1.5, §1.6 accepted academic/runtime behavior must remain unchanged.
- §1.6 remains 22 source slides -> 22 runtime slides, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.
- Do not weaken the Device Gate security contract for non-Site channels.

## Acceptance required before W4 resumes
1. Hub loads with the premium reference composition.
2. Existing navigation and subject routes still work.
3. Main -> subject task/identity/progress handshake remains intact.
4. `Giao diện` controls remain functional.
5. Laptop 16:9, iPad 3:2 and iPhone 19.5:9 responsive smoke pass.
6. No blocking console/page/network/HTTP errors.
7. Math/Russian regressions remain green.
