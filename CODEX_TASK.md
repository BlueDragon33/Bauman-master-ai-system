# CODEX_TASK

Task: `THEORY_C01_L06_RUNTIME_SOURCE_REGISTRATION_PASS_16`
Mode: shared-registry source-registration-only, static verification first.

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
2. `subjects/math/THEORY_C01_L06_RUNTIME_PASS15.json`
3. `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js`
4. the accepted §1.6 Reference, Full View, Normalization and Slideshow artifacts
5. `subjects/math/THEORY_C01_L05_RUNTIME_PASS16.json` only as structural precedent.

## Goal
Register the accepted §1.6 artifact sources in the existing shared E244 registry without changing reader behavior or previously accepted lesson registrations.

## Preconditions
- Pass 15 status is `PASS_15_DURABLE_MERGE_STATIC_VERIFY_PASS`.
- The durable target matches the immutable approved import record.
- Record count is `18`; target occurrence is exactly one at index `5`.
- Source/runtime slide counts are `22/22`, with `compression: false` and one-to-one mapping.

## Runtime source registration requirements
- Modify only `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js` for runtime behavior in this pass.
- Add exactly one registry entry for `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`.
- Register optional lazy sources:
  - Reference: `data/theory_reference/theory_reference_c01_l06.json` / `REFERENCE_C01_L06_V1_PASS11`.
  - Full View: `data/theory_full_view/theory_full_view_c01_l06.json` / `FULL_VIEW_C01_L06_V1_PASS12`.
  - Normalization: `data/theory_normalization/theory_normalization_c01_l06.json` / `NORMALIZATION_C01_L06_V1_PASS12`.
  - Slideshow: `data/theory_slideshow/theory_slideshow_c01_l06.json` / `SLIDESHOW_C01_L06_V1_PASS13`, expected `22` slides.
- Preserve §1.4 and §1.5 registry entries and resolver behavior.
- Keep source IDs unique and every source optional/lazy.
- Do not change the existing E244 load position in `subjects/math/index.html`.

## Static verification
Create `subjects/math/THEORY_C01_L06_RUNTIME_PASS16.json` with deterministic checks covering:
- exactly three lesson entries and twelve unique sources in E244;
- all four §1.6 paths exist and lesson ID/version match;
- §1.4/§1.5 registration fingerprints remain unchanged;
- E244 remains loaded after SUBJECT_ADAPTER/E211 and before E245/E241 consumers;
- no reader, manifest, E235, disabled E236/E237/E238 or slideshow-engine change.

## Runtime protection
Do not modify during Pass 16:
- durable theory content;
- runtime readers or route/identity synchronization logic;
- `subjects/math/index.html`;
- manifest;
- CSS/JavaScript presentation layers;
- Reader Pro;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance
Pass only when static registration verification is clean.
Then set status `PASS_16_RUNTIME_SOURCE_REGISTRATION_STATIC_VERIFY_PASS` and advance to `THEORY_C01_L06_MULTI_LESSON_READER_RICHNESS_PASS_17`.
