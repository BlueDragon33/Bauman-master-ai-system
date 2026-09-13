# CODEX_TASK

Task: `THEORY_C01_L06_MULTI_LESSON_READER_RICHNESS_PASS_17`
Mode: existing-reader richness-integration, static verification first.

## Work handoff execution order — mandatory
When this project is continued in ChatGPT Work, do not jump directly to implementation or publishing. Execute in this order:

### Phase W0 · GitHub reconciliation first
Before changing runtime or the wider system:
- inspect the current `main` HEAD, `CODEX_STATE.md`, `CODEX_TASK.md`, accepted reports, active/merged PR state and relevant CI/workflow results;
- reconcile what has actually been committed with the project state recorded in the repo;
- identify stale/duplicate branches, obsolete temporary versions, unmerged work and any mismatch between claimed state and GitHub evidence;
- preserve accepted §1.4/§1.5 behavior and the academically accepted §1.6 package;
- produce a concise reconciliation checkpoint before proceeding.

Do not redo accepted work merely because an older branch/file exists. GitHub `main` plus accepted reports are the primary operational truth unless a verified inconsistency is found.

### Phase W1 · Finish the current §1.6 runtime workflow
After W0 reconciliation, execute Pass 15 → Pass 19 sequentially with gates:
1. Pass 15 · Durable merge + static verification.
2. Pass 16 · Runtime source registration.
3. Pass 17 · Multi-lesson Reader/Reader Pro richness integration and verification.
4. Pass 18 · Selection/route/identity synchronization verification.
5. Pass 19 · Chromium/browser revalidation and final runtime acceptance.

If any pass fails, stop at that gate, repair it and re-verify before advancing.

### Phase W2 · Whole-system comprehensive work
Only after §1.6 runtime acceptance, review and improve the project as one integrated system rather than treating §1.6 in isolation. Cover the repository-level architecture and the active Bauman system end-to-end, including:
- Bauman Master Hub and subject Web Apps;
- Math and Russian subject integration/data contracts;
- shared navigation, identity, state/progress handshakes and subject boundaries;
- runtime packaging/deployment readiness;
- responsive behavior, offline/PWA behavior where already part of the architecture, error states and recovery;
- existing administration/device/access flows that belong to this repository/system;
- consistency of UI/content/runtime contracts;
- removal or quarantine of stale temporary paths/duplicate versions when safe;
- regression protection for already accepted lessons/apps.

Do not perform cosmetic rewrites that break accepted contracts. Prefer clean, unified architecture and explicit compatibility checks.

### Phase W3 · Whole-system QA gate
Before any ChatGPT Site publication:
- run the strongest available static, integration and browser checks;
- verify critical routes and subject entry points;
- verify there are no blocking console/page/network errors in tested flows;
- verify accepted lesson slide counts and identities remain intact;
- verify no regression in previously accepted §1.4/§1.5 and completed §1.6 runtime;
- record remaining non-blocking limitations separately from blockers.

Publishing is prohibited while a blocking defect remains.

### Phase W4 · Publish to ChatGPT Site last
Only after W0–W3 are complete and the whole-system QA gate is PASS:
- publish the approved final system to ChatGPT Site using the existing project/site workflow available in Work;
- do not publish an intermediate/debug build as the final site;
- after publication, verify the live site/critical routes and record the published state.

The required order is therefore:
`GitHub reconciliation → §1.6 runtime completion → whole-system comprehensive work → whole-system QA → ChatGPT Site publication`.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/THEORY_C01_L06_RUNTIME_PASS16.json`
3. `subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`
4. `subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`
5. the accepted §1.6 Reference, Full View, Normalization and Slideshow artifacts
6. `subjects/math/THEORY_C01_L05_RUNTIME_PASS17.json` only as structural precedent.

## Goal
Integrate the accepted §1.6 artifact schemas into the existing multi-lesson Reader/Reader Pro and E202 richness bridges without altering the accepted academic package or regressing §1.4/§1.5.

## Preconditions
- Pass 16 status is `PASS_16_RUNTIME_SOURCE_REGISTRATION_STATIC_VERIFY_PASS`.
- E244 exposes three lesson entries and twelve optional/lazy sources.
- The §1.6 source files match the registered lesson ID and approved versions.
- §1.6 source/runtime slide counts are `22/22`, with `compression: false` and one-to-one mapping.

## Reader and richness requirements
- Extend E241 schema routing explicitly for §1.6; do not route it through the §1.4 fallback.
- Render the eight §1.6 reference areas, formula table F01–F18, extraction/API/preprocessing gates, locked UGV case, troubleshooting, terminology and interpretation limits.
- Render all twelve §1.6 Full View reading sections and their accepted content blocks.
- Use the active lesson's §1.6 Normalization artifact for canonical formula text.
- Preserve per-lesson caches and exact lesson/version validation.
- Extend E242 only as needed to represent meaningful §1.6 richness from accepted fields in the existing E202/E211 surfaces; do not edit the approved source artifacts.
- Keep §1.4 and §1.5 reader/richness behavior and counts unchanged.

## Static verification
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS17.json` with deterministic checks covering:
- E241/E242 syntax and release identities;
- E241 explicit §1.6 schema support, lesson-scoped cache and twelve-section Full View rendering;
- E242 lesson-scoped cache and existing-engine use;
- unchanged §1.4/§1.5 richness counts;
- §1.6 `22/22` identity/mapping and meaningful richness integration;
- no change to approved source artifacts, E202, E211, E235 or disabled E236/E237/E238 load state.

## Runtime protection
Do not modify during Pass 17:
- durable theory content;
- E244 registration except for a verified expected-count refinement required by E242 validation;
- route/identity synchronization logic;
- `subjects/math/index.html`;
- manifest;
- the E202 slideshow engine or E211 Reader Pro base;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when static multi-lesson reader/richness verification is clean.
Then set status `PASS_17_MULTI_LESSON_READER_RICHNESS_STATIC_VERIFY_PASS` and advance to `THEORY_C01_L06_SELECTION_ROUTE_SYNC_PASS_18`.
