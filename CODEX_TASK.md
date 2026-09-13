# CODEX_TASK

Task: `THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`
Mode: approved-import durable-merge-only, static verification first.

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
2. `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json`
3. `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`
4. durable `theory_lecture_content` data file used by the existing E129 importer
5. `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json` only as structural precedent.

## Goal
Merge exactly the academically approved §1.6 import candidate into the existing durable `theory_lecture_content` record and statically prove that no non-target lesson changes.

## Preconditions
- Academic acceptance status is `PASS`.
- Academic passes are `14/14`.
- Approved import version is `C01_L06_E129_IMPORT_V1_22_SLIDES_CANDIDATE`.
- Target lesson ID is `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`.
- Source/runtime slide counts are `22/22`.
- `compression: false` and mapping is one-to-one.

## Durable merge requirements
- Replace only the existing §1.6 record; do not append a duplicate.
- Preserve record count and target index/order unless the current durable contract explicitly requires otherwise.
- Preserve previous and next lesson identities.
- Keep every non-target record byte-equivalent or canonical-hash-equivalent.
- Runtime slide IDs must be exactly `MATH-VN-C01-L06-S01` through `S22`.
- Source mappings must be exactly `SL01` through `SL22` one-to-one.
- Preserve `F01–F18` references and locked UGV case language.
- Do not introduce deferred scale/rank/SVD/PCA/diagnosis results.

## Static verification
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json` with a deterministic merge report covering:
- durable record count before/after;
- target occurrence exactly once before/after;
- target canonical hash before/after and target content changed;
- changed non-target records = zero;
- duplicate lesson IDs = zero;
- source/runtime slide counts `22/22`;
- runtime ID and source mapping continuity;
- formula coverage `F01–F18`;
- minimum 16/no maximum/compression false;
- locked case/deferred-boundary checks;
- written JSON reparses.

## Runtime protection
Do not modify during Pass 15:
- runtime readers;
- `subjects/math/index.html` unless the durable E129 contract itself requires it (expected: no);
- manifest;
- CSS/JavaScript presentation layers;
- Reader Pro;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when static merge verification is clean.
Then set status `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS` and advance to `THEORY_C01_L06_RUNTIME_SOURCE_REGISTRATION_PASS_16`.
