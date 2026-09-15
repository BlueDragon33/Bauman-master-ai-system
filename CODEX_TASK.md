# CODEX_TASK

Task: `BAUMAN_CHAT_FIRST_PRESERVATION_AND_SAFE_REDESIGN`
Mode: `CHAT_FIRST / WORK_SURGICAL_ONLY`

## Mandatory execution order
1. Use normal chat/GitHub tools first for inspection, diff, code/data/UI changes, CI and regression review.
2. Restore and verify the preservation baseline before redesign.
3. Only after the baseline is green, resume the user-requested premium Hub redesign.
4. Use Work only if a required GUI/live-browser action cannot be completed from chat.

## Work policy — mandatory
If Work is used, it MUST follow all rules below:
- One narrow task only.
- No project-wide redesign or audit unless explicitly requested.
- Do not rewrite the application architecture.
- Do not replace `app.home`, route ownership, state stores, Subject Bridge or canonical data loaders.
- Do not remove, reduce, summarize away or replace existing learning content, JSON/data, progress/state or subject functionality.
- Prefer the smallest patch possible.
- If more than 8 files or an architecture change appears necessary: STOP and return to chat for review.
- No force reset, no unnecessary branch/version proliferation, no production publish unless explicitly authorized after QA.
- Report only changed files, preserved contracts, tests, failures and commit SHA.

## Current technical objective
First stabilize the authoritative pre-V2 Hub runtime. Then redesign it to resemble the approved premium Bauman Master Hub reference while preserving the existing application model.

Required final visual behavior:
- Premium navy/gold Bauman visual language.
- Left navigation, search/top controls, hero, connected subject/progress/schedule/AI information.
- Real Bauman subjects and real state only; no fake academic content.
- Keep `Giao diện` with theme/font/text-size controls; density may be added without replacing state ownership.
- Responsive targets: laptop 16:9, iPad/tablet 3:2, iPhone portrait 19.5:9.

## Preservation acceptance before redesign
- Eight canonical subjects remain present.
- Home, roadmap, subjects, schedule and research routes remain usable.
- Device Gate remains intact.
- Hub↔subject identity/task/progress handshake remains intact.
- Math and Russian regressions remain green.
- No horizontal overflow at representative laptop/tablet/phone viewports.
- No blocking console/page/network/HTTP errors.

## Protected contracts
- Preserve accepted §1.4–§1.6 behavior and content.
- Preserve §1.6 `22/22`, one-to-one, `compression: false`.
- No new slideshow engine.
- E235 unchanged; E236/E237/E238 disabled.
- Preserve `UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED`.

## Publication
W4 is BLOCKED until the safe redesign completes and receives a new W3 acceptance lineage. Never use an older publication manifest as authorization for the current runtime.
