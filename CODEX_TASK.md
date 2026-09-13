# CODEX_TASK

Task: `THEORY_C01_L06_SELECTION_ROUTE_SYNC_PASS_18`
Mode: selection-route-identity synchronization, deterministic verification before browser acceptance.

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
2. `subjects/math/THEORY_C01_L06_RUNTIME_PASS17.json`
3. `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js`
4. `subjects/math/assets/theory_skin/theory-presenter-route-lock-E243.js`
5. `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js`
6. `subjects/math/assets/theory_skin/theory-content-source-E240.js`
7. E241/E242 self-check contracts and the durable §1.6 record only as needed for synchronization evidence
8. `subjects/math/THEORY_C01_L05_RUNTIME_PASS18.json` only as structural precedent.

## Goal
Verify and, only if required, repair the existing selection/route/identity chain so §1.6 opens the existing Reader/Reader Pro deck under one canonical lesson identity without stale fallback, ghost routes or cross-lesson state leakage.

## Preconditions
- Pass 17 status is `PASS_17_MULTI_LESSON_READER_RICHNESS_STATIC_VERIFY_PASS`.
- E244 exposes three lesson entries and twelve optional/lazy sources.
- E241 explicitly supports L04/L05/L06 and E242 preserves richness counts `22/8/9/16`, `22/9/10/18`, `22/11/22/22`.
- The durable §1.6 record exists once and retains `22/22`, `compression: false` and one-to-one mapping.

## Selection, route and identity requirements
- The selected §1.6 item must resolve to `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140` and `§1.6 · Từ vector sang ma trận dữ liệu`.
- E210 must prefer canonical ID fields and use the existing E244/E240 identity sources.
- E243 must treat the active deck/Reader identity as authoritative, stamp the exact L06 ID/title and block fallback to a stale registered lesson.
- E241 actions and E242 richness must resolve the same active lesson as the selection and deck.
- Switching among §1.4, §1.5 and §1.6 must not leave stale controls, markers, caches, route IDs or titles on the active deck.
- Use the existing public APIs, renderer, data sources and state store; do not create replacements.
- Preserve all accepted academic artifacts and Pass 15–17 runtime behavior.

## Deterministic verification
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS18.json` with checks covering:
- E210/E243 syntax and release identities;
- exact canonical ID/title resolution for L04, L05 and L06;
- the durable-record selection identity and E244/E240 resolver agreement;
- E210 deck/chip identity stamping and E243 authoritative route behavior;
- E241/E242 active-lesson agreement and absence of stale fallback/ghost identity;
- unchanged Pass 17 richness counts and source/runtime `22/22` mapping;
- no change to approved artifacts, E202, E211, E235 or disabled E236/E237/E238 load state.

## Runtime protection
Do not modify during Pass 18 unless a verified synchronization defect requires the narrowest possible repair:
- durable theory content;
- accepted Reference, Full View, Normalization or Slideshow artifacts;
- E241/E242 richness behavior;
- `subjects/math/index.html`;
- manifest;
- the E202 slideshow engine or E211 Reader Pro base;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when selection, route and canonical identity synchronization is deterministic and clean for §1.4–§1.6.
Then set status `PASS_18_SELECTION_ROUTE_SYNC_STATIC_VERIFY_PASS` and advance to `THEORY_C01_L06_CHROMIUM_FINAL_ACCEPTANCE_PASS_19`.
