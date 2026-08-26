# CODEX_STATE

Current task: `L7-B6_FOUNDATION_PREPARATORY_COMPLETION`

Status: `L7_B5_PASS_B6_READY`

Date: 2026-08-26
Branch: `migration/webapp-l1-audit-storage`
Base branch: `main`
Main sync status: `branch_only`

Files changed:
- `assets/js/platform/universal-lesson/math-universal-adapter-v1.js`
- `scripts/academic/l7-b5-math-universal-adapter-regression.cjs`
- `docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.md`
- `docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.generated.json`
- `assets/data/lesson/math-prerequisite-policy-v1.json`
- `assets/data/lesson/math-prerequisite-graph-v1.generated.json`
- `scripts/academic/l7-b4-math-coverage-prerequisite-audit.cjs`
- `docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.md`
- `docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.generated.json`
- `assets/data/lesson/russian-twin-registry-v1.json`
- `assets/data/lesson/russian-twin-glossary-v1.generated.json`
- `assets/js/platform/universal-lesson/russian-twin-generator-v1.js`
- `scripts/academic/l7-b3-russian-twin-registry-regression.cjs`
- `docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.md`
- `docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.generated.json`
- `assets/js/platform/universal-lesson/russian-universal-adapter-v1.js`
- `scripts/academic/l7-b2-russian-universal-adapter-regression.cjs`
- `docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.md`
- `docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.generated.json`
- `.github/workflows/migration-l7-reference-subjects.yml`
- `scripts/academic/l7-b1-russian-coverage-audit.cjs`
- `docs/migration/L7_B1_RUSSIAN_COVERAGE_AUDIT.md`
- `docs/migration/L7_B1_RUSSIAN_COVERAGE_AUDIT.generated.json`
- `.github/workflows/migration-l6-academic.yml`
- `assets/data/lesson/universal-lesson-renderer-contract-v1.json`
- `assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js`
- `assets/js/platform/universal-lesson/legacy-lesson-bridge-v1.js`
- `scripts/academic/l6-b10-renderer-bridge-regression.cjs`
- `docs/migration/L6_B10_UNIVERSAL_LESSON_RENDERER_BRIDGE.md`
- `docs/migration/L6_B10_RENDERER_BRIDGE_REGRESSION.generated.json`
- `docs/migration/MIGRATION_PLAN.md`
- `CODEX_STATE.md`

What changed:
- Added a pure read-only Math → Universal v2 adapter with exact-ID source
  resolution: reviewed overlays remain separate, legacy IDs keep legacy
  fallback, and unknown/look-alike IDs fail closed without fuzzy promotion.
- Projected all 347 legacy lessons plus 18 reviewed overlays as 365
  schema-valid lessons while preserving all 5,552 legacy and 300 overlay
  slides one-to-one, including both accepted 22-slide decks.
- Kept formula, worked-step, parameter-simulation and professor-oral behavior
  under the existing Math specialist owners; B5 does not cut over runtime.
- Kept all 341 system-derived prerequisite candidates inactive and all 1,279
  downstream support refs non-mastery/read-only.
- Kept all seven empty standalone Math banks explicitly unavailable with no
  completion or Master-ready claim; 18 overlays remain truthful partial
  coverage rather than a replacement for the 347-lesson legacy catalog.
- Added deterministic, mutation and CI gates for B5 without changing Math
  source, learner state, specialist runtime, Service Worker or `main`.
- Added a read-only Math coverage audit preserving all 347 legacy lessons,
  41 chapter IDs, six stages and all sixteen semantic slide roles per lesson.
- Recorded the reviewed theory path truthfully as 18 overlays across three
  chapters with 16–22 slides (300 total), not full 347-lesson coverage.
- Confirmed external exercise/simulation/test/question-bank records remain
  empty while every legacy lesson still retains embedded practice, simulation,
  application and professor-Q&A roles.
- Added a non-blocking review-candidate prerequisite graph with 347 nodes and
  341 system-derived within-stage source-order edges; every edge requires
  review and cannot block assessment or change Master-ready.
- Mapped twelve Math domains to 1,279 stable downstream support refs across
  AI/Data, Signal, Systems, Programming/Database, Research, Foundation and
  Russian without mutating source or learner state.
- Kept three findings open for B5/B7: partial theory overlays, empty external
  banks and system-derived prerequisites.
- Added a latent Russian Twin registry covering all eight Subject Factory
  subjects without activating multilingual learner UI.
- Generated the first truthful source-aligned glossary pack from the existing
  48/48 Programming trilingual terminology records: 48 glossary records and
  48 hidden technical-terminology Twin units.
- Kept missing Russian/Math/Foundation/AI/Signal/Systems/Research alignments
  explicitly unavailable; no generic dictionary or AI translation is used.
- Moved Programming database/software-design classification into registry data
  and verified exact parity with Subject Factory; generator code has no lesson
  ID classification constants.
- Fixed unavailable-record source indexing and added a regression that proves
  the original input index survives filtering.
- Added a pure read-only Russian → Universal v2 adapter for all 26 lessons and
  1138 source slides without changing the Russian source/runtime/state.
- Preserved dialogue, deep speaking, basic speaking, handwriting, writing,
  assessment, simulation and speaking-link ownership as specialist references.
- Fixed two contract mismatches found by the first real validator run: locators
  now use structured `sourcePath/sourceAnchors`, and deterministic offline
  fallback resolves to a declared subject-pack resource while retaining the
  unchanged legacy runtime entry.
- Recorded stale L3/L4 baseline-guard modernization inside L21 governance; the
  guards currently reject already-approved later-round Math/Russian/Foundation
  files even though their own functional regressions pass.
- Expanded the audited master plan from 23 rounds / 218 steps to 25 rounds /
  235 steps by adding Content Operations & Curriculum Governance and Learning
  Quality / Accessibility / Acceptance gates.
- Added a read-only Russian coverage audit for the exact six stages and four
  preparatory/technical/academic/defense capability tiers.
- Kept all 26 Russian lesson IDs/titles and specialist source families
  untouched; B1 does not project, render, migrate or write learner state.
- Implemented the exact-allowlist B11 reference activation for
  `foundation:f_s01_l1` without rewriting the Foundation source or learner
  state, and preserved explicit fallback to the unchanged legacy lesson modal.
- Added one truthful external oral capability using browser MediaRecorder with
  current-modal memory only; upload, persistence and automatic Master-ready
  claims remain forbidden.
- Added responsive reference-lesson styling, secure bootstrap/module loading,
  source/dependency/render digest pins and three-layer rollback behavior.
- Added deterministic and Playwright browser/offline B11 gates plus the remote
  status context `migration/l6-b11-reference-runtime`.
- Locked L6-B6 after GitHub Actions run `32717062541` reported B1-B6 contexts
  successful at commit `39dc6f08…`.
- Defined latent source-aligned Russian Twin and English Research hooks without
  translated navigation, duplicate lesson progress or automatic activation.
- Defined explicit language roles, alignment/glossary/protected-token
  provenance, progressive rescue, assessment and Master-ready boundaries.
- Added eight Russian and eight English modes plus exact hook profiles for all
  eight lesson types using only registered B4 evidence outputs.
- Bounded review authority: AI can create only unreviewed drafts; source,
  curator, instructor and integrity actors have distinct status permissions.
- Preserved Russian 26/26 titles, Research 45 eLearning lessons and Roadmap V3
  Russian/research priority hooks as read-only references.
- Added the deterministic B7 gate and B7 commit-status context.
- Locked L6-B7 after GitHub Actions run `32718320781` reported B1-B7 contexts
  successful at commit `4997800c…`.
- Added the formal Universal Lesson V2 JSON Schema, browser-native validator,
  source-family migration registry and pure dry-run version migrator.
- Added SHA-256 stable-JSON integrity, complexity/security guards, semantic
  duplicate/evidence/offline checks and exact Bauman program identity fields.
- Added deterministic, source-preserving and rollbackable projections from
  Universal V1 and eLearning V1.1. Candidates remain manual-review-only; apply,
  commit and write requests fail closed.
- Kept Russian/Mathematics rich sources adapter-only. Real sources return
  `ADAPTER_REQUIRED`; no direct conversion, learner-state write or runtime
  cutover occurs in B8.
- Validated all 45 Research eLearning V1.1 lessons as dry-run V2 candidates and
  retained wrapper/unmapped fields without placeholder blocks.
- Added B8 negative fixtures, six mutation tests, generated evidence and the
  planned remote status context `migration/l6-b8-schema-migration`.
- Locked L6-B8 after GitHub Actions run `32721005666` reported B1-B8 contexts
  successful at feature commit `b627464e5691972c2367de1367b371a657f851db`.
- Audited all eight current Main subjects, three specialist adapters, five
  light manifests/runtimes, source inventories and L5 offline limits.
- Added the read-only B9 Subject Factory registry and secure resolver for
  subject, primary lesson type, widget, data-source and offline-policy lookup.
- Locked Foundation to deterministic module mappings and held `f_m201` /
  `f_m202` at `UNCLASSIFIED_LESSON` instead of forcing a wrong default.
- Preserved Russian required-lazy persistence semantics, Mathematics
  authoritative theory precedence and the five light runtime simulation
  supplements without changing any existing subject runtime or content.
- Added the deterministic B9 gate, eight mutation tests and planned remote
  context `migration/l6-b9-subject-factory`.
- Locked L6-B9 after GitHub Actions run `32723374054` reported B1-B9 contexts
  successful at feature commit `7d76270e1e5bbd1141465a722794f2fde5cd6290`.
- Added the pure B10 Universal Lesson Renderer, exact B3 policy resolution,
  safe semantic HTML and a read-only legacy routing bridge.
- Preserved Russian, Mathematics and Programming specialist ownership through
  `DELEGATE_SPECIALIST_ENGINE`; no rich source projection or state rewrite.
- Added recursive official-attempt disclosure protection, truthfully filtered
  capability providers and SHA-256 rollback routing.
- Recorded `LIGHT-POLICY-CAPABILITY-GAP`: current generic light widgets cannot
  satisfy strict external capabilities; B10 keeps all five sources review-only
  and assigns one reviewed reference path to existing B11 scope.
- Added deterministic B10 gate, nine mutation tests and planned remote context
  `migration/l6-b10-renderer-bridge`.
- Locked L6-B10 after GitHub Actions run `32725455874` reported all B1-B10
  contexts successful at feature commit
  `fa7eb674782444593f7035acfd70cba018495362`.
- Did not change learner content, subject runtime, storage, offline policy,
  service worker or `main`.

Verification:
- L7-B5 GitHub Actions run `32940546331`: PASS
- L6 full regression run `32940546329`: PASS
- Full L5 runtime/browser/offline run `32940546352`: PASS
- L7-B5 Math Universal adapter regression, 52/52 checks: PASS
- L7-B5 protection mutations, 6/6 expected failures observed: PASS
- Math Universal projections, 365/365 schema-valid; source blocks,
  5,852/5,852 preserved one-to-one: PASS
- L7-B5 projection SHA-256:
  `d9f37b5f88d05688dc6c01c0b77fe7d5e8dbaa9a091bc3cfcb69e13601fc8210`
- L7-B4 GitHub Actions run `32859657749`: PASS
- L6 full regression run `32859657535`: PASS
- Full L5 runtime/browser/offline run `32859657567`: PASS
- L7-B4 Math coverage/prerequisite audit, 25/25: PASS
- Math legacy coverage, 347/347 lessons; overlay, 18 records/3 chapters: PASS
- L7-B4 graph SHA-256:
  `e768723bbfa66196edf1d3182d97f3bb39abf65ae64c043448926edea7757871`
- L7-B3 GitHub Actions run `32858803630`: PASS
- L6 full regression run `32858805155`: PASS
- Full L5 runtime/browser/offline run `32858805279`: PASS
- L7-B3 registry/generator/glossary regression, 27/27: PASS
- Programming glossary records/Twin units, 48/48 and 48/48: PASS
- L7-B3 pack SHA-256:
  `bfa9b6fbf57df4a5558728fe9720abcb20e26b6f4a3fe615ab03456afac517d8`
- L7-B2 GitHub Actions run `32803834381`: PASS
- L6 regression run `32803834330`: PASS
- Full L5 runtime/browser/offline run `32803834294`: PASS
- L7-B2 Universal adapter regression, 17/17: PASS
- Russian Universal projections: 26/26 lessons, 1138/1138 slides: PASS
- L7-B2 projection SHA-256:
  `8f0b9b8acd74fafc75bed0e5a69f3fe17aff1c2d983fea6e33f323d5fe7e64ba`
- L7-B1 GitHub Actions run `32803058030`: PASS
- L7-B1 context `migration/l7-b1-russian-coverage`: PASS
- L6 full sequential regression after 25-round expansion, run `32803174543`: PASS
- L5 full runtime/browser/offline regression, run `32803174494`: PASS
- L7-B1 Russian coverage audit, 21/21: LOCAL PASS
- Russian lessons, 26/26; ordered stages, 6/6; capability tiers, 4/4: PASS
- L7-B1 report stable across consecutive runs, SHA-256:
  `c49d2300a5594294851711d330bd864f21df4c1240bac1aa8ae4a8e767046472`
- L6-B11 GitHub Actions run `32792582696`: PASS
- L6-B11 remote context `migration/l6-b11-reference-runtime`: PASS
- L6-B11 browser regression, 21/21: PASS
- L6-B11 responsive viewports, 3/3: PASS
- L6-B11 explicit offline subject packs, 3/3: PASS
- Foundation/Mathematics/Russian offline routes, 3/3: PASS
- Full L5 runtime/browser/offline regression run `32792704340`: PASS
- L5 workflow YAML startup defect was fixed by quoting the job-level condition;
  the repaired workflow completed successfully.
- L6-B11 deterministic activation/rollback regression, 39/39: LOCAL PASS
- L6-B11 protection mutations, 12/12 expected failures observed: LOCAL PASS
- L6-B11 report deterministic SHA-256:
  `01ed21470098c4d6ebbfe3aa832134930b2862fd9b904223a8d75a43cb4b7d3c`
- L6-B1 through L6-B11 sequential deterministic gates: LOCAL PASS
- Local sandbox had no Chromium binary, so the authoritative browser/offline
  evidence is the successful remote CI run above.
- L6-B1 deterministic audit, 44/44 checks: PASS
- L6-B2 deterministic contract regression, 35/35 checks: PASS
- L6-B3 deterministic block-policy regression, 37/37 checks: PASS
- L6-B3 GitHub Actions run `32713846615`: PASS
- L6-B4 deterministic lesson-type regression, 36/36 checks: PASS
- L6-B4 GitHub Actions run `32714596099`: PASS
- L6-B5 deterministic Master-ready regression, 44/44 checks: PASS
- L6-B5 GitHub Actions run `32715744137`: PASS
- L6-B6 deterministic visual-teaching regression, 75/75 checks: PASS
- L6-B6 GitHub Actions run `32717062541`: PASS
- L6-B7 deterministic language-layer regression, 96/96 checks: PASS
- L6-B7 GitHub Actions run `32718320781`: PASS
- L6-B8 deterministic schema/migration regression, 110/110 checks: LOCAL PASS
- L6-B8 mutation tests, 6/6 expected failures observed: LOCAL PASS
- Research eLearning V1.1 dry-run projection, 45/45 candidates: LOCAL PASS
- B8 report SHA-256:
  `4e405706231995f6067a460717536b138da878a04a803f0f55613291b24f6be6`
- B8 workflow YAML and JavaScript syntax: LOCAL PASS
- L5 clean-baseline regression after B8: routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline 75/75, 8 subjects with 0 data-load
  failures, diagnostics 14/14, offline integrity 5/5: PASS
- L6-B8 GitHub Actions run `32721005666`: PASS
- L6-B8 remote context `migration/l6-b8-schema-migration`: PASS
- L6-B9 deterministic Subject Factory regression, 340/340 checks: LOCAL PASS
- L6-B9 source resolution, 128/128 current sources: LOCAL PASS
- L6-B9 current lesson classification/held outcomes, 631/631: LOCAL PASS
- L6-B9 mutation tests, 8/8 expected failures observed: LOCAL PASS
- L6-B9 report deterministic SHA-256:
  `af8145f87c739400cfa5c4c04ec8c015914d5920fce89e146f15591d894e78a3`
- L6-B1 through L6-B9 sequential local gates: PASS
- L5 clean-baseline regression after B9: routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline 75/75, 8 subjects with 0 data-load
  failures, diagnostics 14/14, offline integrity 5/5: PASS
- B9 workflow YAML and JavaScript syntax: LOCAL PASS
- L6-B9 GitHub Actions run `32723374054`: PASS
- L6-B9 remote context `migration/l6-b9-subject-factory`: PASS
- L6-B1 through L6-B8 contexts in the same run: PASS
- L6-B10 deterministic renderer/bridge regression, 189/189: LOCAL PASS
- L6-B10 canonical type policy/render matrix, 8/8: LOCAL PASS
- L6-B10 specialist unchanged delegates, 3/3: LOCAL PASS
- L6-B10 light review-only source routes, 5/5: LOCAL PASS
- L6-B10 mutation tests, 9/9 expected failures observed: LOCAL PASS
- L6-B10 report deterministic SHA-256:
  `3157bed5c4494209b65a539c9c08a5a2794cc2b888991858ea6e7e7445b93ce8`
- L6-B1 through L6-B10 sequential local gates: PASS
- L5 clean-baseline regression after B10: routing 9/9, service worker 17/17,
  academic runtime 36/36, roadmap/offline 75/75, 8 subjects with 0 data-load
  failures, diagnostics 14/14, offline integrity 5/5: PASS
- L6-B10 GitHub Actions run `32725455874`: PASS
- L6-B10 remote context `migration/l6-b10-renderer-bridge`: PASS
- L6-B1 through L6-B9 contexts in the same run: PASS
- B1-B7 report hashes stable over consecutive runs: PASS
- B7 mutation tests (activation, review authority, English coverage,
  rescue evidence, assessment leakage), 5/5 expected failures observed: PASS
- Workflow YAML parse: PASS
- Russian/Mathematics runtime and content diff: NONE
- L5 static routing, 9/9: PASS
- L5 service-worker lifecycle, 17/17: PASS
- L5 academic runtime V3, 36/36: PASS
- L5 roadmap/offline static, 75/75: PASS
- L5 data-loading audit, 8 subjects and 0 failures: PASS
- L5 runtime diagnostics, 14/14: PASS
- L5 offline-report integrity, 5/5 with one expected sandbox block: PASS
- Russian 26/26, Research 45/45 eLearning v1.1, Roadmap hook signals: PASS
- GitHub Actions L6-B7 gate: PASS

Main sync / pull instruction:
- The work is branch-only on `migration/webapp-l1-audit-storage`.
- Do not pull `main` for this task; `main` does not contain L6.
- Do not merge to `main` until the remaining L7 gates and final progression
  gate pass; B5 remains draft-branch-only.

Next recommended task:
- Begin L7-B6 by auditing Foundation against the preparatory target:
  classroom Russian, math/science transition and study-method bridge. Preserve
  current source/runtime/state and fail closed on unsupported completion.

Next actor:
- Codex

Codex required:
- yes
- Reason: Foundation source/coverage audit, preparatory-gap closure, legacy
  compatibility, deterministic regression and remote CI verification.

ChatGPT can do:
- Targeted content/schema review and small documentation-only corrections on
  the working branch.

Codex prompt file:
- None.

---

## Historical Math content state

Historical current task: `THEORY_C01_L06_CORE_CONTENT_PASS_07`

Historical status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`

Historical branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it materially improves a deep multi-file refactor, broad dependency analysis or unavailable complex automation.
- If Codex is required, create one new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.

## Protected constraints
- Minimum 16 slides, with no maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Preserve one source slide to one runtime slide.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## §1.4 accepted baseline
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Academic workflow: `14/14` complete.
- Runtime workflow: `6/6` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.
- Historical Chromium report commit: `918daa85f0bf2af28f798dd5a669dea8f23ee460`.

## §1.5 accepted package

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`

Lesson title:
`§1.5 · Không gian con và biểu diễn dữ liệu`

Final status:
- academic passes: `14/14`;
- runtime passes: `5/5`;
- browser QA: `PASS_CURRENT_HEAD`;
- source slides: `22`;
- runtime slides: `22`;
- compression: `false`;
- final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`.

Accepted reports and artifacts:
- academic acceptance: `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json`;
- runtime Pass 15: `subjects/math/THEORY_C01_L05_RUNTIME_PASS15.json`;
- runtime Pass 16: `subjects/math/THEORY_C01_L05_RUNTIME_PASS16.json`;
- runtime Pass 17: `subjects/math/THEORY_C01_L05_RUNTIME_PASS17.json`;
- runtime Pass 18: `subjects/math/THEORY_C01_L05_RUNTIME_PASS18.json`;
- current-head Chromium acceptance: `subjects/math/THEORY_C01_L05_RUNTIME_PASS19.json`.

Runtime acceptance details:
- merge commit: `6d5883619899227d51cd945cf906cc3ddc37c134`;
- tested runtime head: `cb328018e2221d5a5d3650d8ef753e0ca173016e`;
- E242 repair: `58bab8bd2e131b8250f01a83eb6b611afa0fd2f0`;
- E245 authoritative route: `8792f6350247a6cbb08b23e13ee4c4dcb248c5d1`;
- E245 index load order: `3f9a0af0fd0af7e81330cae7b18649daa7348f34`;
- evidence artifact: `lesson-1-5-pass19-revalidation-v4`;
- §1.4 and §1.5 verified: `22/22` slides each;
- missing required richness markers: `0`;
- stale richness markers: `0`;
- cross-lesson identity leaks: `0`;
- unregistered §1.6 inherited controls/richness: `0`;
- console errors, page errors, local HTTP errors and route ghosts: `0`;
- E235 preserved; E236/E237/E238 disabled.

## §1.6 academic workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Lesson title:
`§1.6 · Từ vector sang ma trận dữ liệu`

Progress:
- academic passes complete: `6/14`;
- academic passes remaining: `8/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files:
  - `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.md`;
  - `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.json`.
- Durable record: index `5` of `18`.
- Current runtime slides: `16`.
- Current slide IDs: absent in all `16` baseline slides.
- Current content blocks: `36` text, `18` Q&A, `7` formula and `3` code.
- Canonical formula references: `0`.
- Existing specialist artifacts: `0`; missing: `11`.
- Exact target-ID matches outside durable content: none.
- Durable content, runtime readers, manifest and E235 unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates: `P1–P4` locked.
- Learning outcomes: `LO1–LO9` locked.
- Mastery evidence groups: `E1–E8` locked.
- Misconception intercepts: `M1–M8` locked.
- Canonical convention: `X in R^(m x n)`, rows are observations, columns are features.
- Alternative column-observation convention is allowed only when declared and translated explicitly.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Fixed raw shape: `X_raw in R^(8 x 6)`.
- Locked feature order: left wheel speed, right wheel speed, longitudinal acceleration, lateral acceleration, yaw rate, battery current.
- Raw, centred and scaled matrices must use distinct notation.
- Gram, covariance, rank, SVD and PCA claims remain assumption-gated or deferred.
- Numeric values, centering mean, scale vector and thresholds remain unlocked until Pass 5.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Convention ownership layers: project, mathematics, array/API and engineering.
- Source anchors: `S1–S12`.
- Claim trace set: `C01–C24`.
- Trilingual terminology: `T01–T40`.
- Symbol contract covers observations, rows, columns, slices, transpose, raw/centred/scaled matrices and Gram objects.
- Usage rules: `U1–U12`.
- NumPy operation map is locked to the row-observation project convention.
- Legacy 16-slide disposition is locked role by role.
- Rank, singular-value, PCA, missing/outlier policy and physical-mode claims are deferred or rewritten.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs: `F01–F18`.
- Core coverage: matrix assembly, entry/row/column/block access, transpose conversion, linear score, mean and centering.
- API equivalents: row-wise and column-wise NumPy stacking.
- One-dimensional transpose trap and valid reshape forms are locked.
- Feature and observation Gram matrices are preview-only.
- Scaling, covariance, feature transformation and rank are preview-only and assumption-scoped.
- SVD and PCA formulas remain deferred.
- Dimensional failures `D01–D05` and forbidden shortcuts are locked.
- Numeric case values remain unlocked until Pass 5.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`.
- Case version: `CASE_C01_L06_V1_LOCKED`.
- Shape: `8 x 6`, observations as rows.
- Observation IDs: `UGV-W01–UGV-W08`; timestamps strictly increasing by 250 ms.
- Feature schema, order, units, version and checksum locked.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Centered column sums and reconstruction pass at `1e-12`.
- Four negative variants locked: swapped columns, wrong units, wrong orientation and schema-version mismatch.
- Scale vector, fault threshold, PCA result and physical mode count remain unlocked/prohibited.
- Runtime content, readers, manifest and E235 unchanged.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions: `M01–M18`.
- Failure classes: conceptual, notation, API, metadata, engineering inference and scope.
- All four invalid case variants are mapped to explicit misconceptions and expected detections.
- Orientation, one-dimensional transpose, stacking, schema, units, slicing and preprocessing failures are locked.
- Covariance, rank, PCA and physical-fault overclaims are explicitly blocked.
- Retrieval distribution and code-audit requirements are locked.
- Runtime content, readers, manifest and E235 unchanged.

## Current task requirements

`THEORY_C01_L06_CORE_CONTENT_PASS_07`

Pass 7 must:
- create the canonical theory core artifact for §1.6;
- map every section to LO1–LO9, C01–C24, F01–F18, M01–M18 and CASE_C01_L06_V1_LOCKED;
- teach the governing question, canonical orientation, compatibility gate, assembly, indexing, slicing, transpose, mean and centering;
- use the locked UGV case without changing any numeric value, feature order, unit, observation ID or timestamp;
- distinguish core, API-equivalent and preview content;
- include retrieval checks and misconception intercepts throughout the core;
- defer missing/outlier policy, scaling choice, rank interpretation, SVD and PCA;
- produce source sections that can later expand to at least 16 slides without compression;
- avoid runtime modification.

## Maintenance patch · E215 Reader Pro extension panel and fit rules

Date: 2026-07-10
Status: `BROWSER_SMOKE_PASS_CURRENT_HEAD`

Scope:
- inspected only `CODEX_STATE.md`, `subjects/math/index.html`, E211 reader content, E212 reader fit and E242 slideshow richness, plus the loaded formula layers needed to trace duplicated relation signs;
- preserved the active §1.6 Pass 07 task and all accepted §1.4/§1.5 records;
- did not create a slideshow engine and did not enable E190, E191, E192, E193 or E195.

Patched files:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`;
- `subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`;
- `subjects/math/index.html` cache versions for E212 and E242.

Behavior locked by the patch:
- right-side Reader Pro panel title is forced to `Nội dung mở rộng`;
- panel content is checked against the three lower cards and replaced with a non-summary extension note when it duplicates them or contains `Diễn giải kỹ thuật`, `Câu hỏi tự kiểm` or `Câu hỏi đúng cần đặt`;
- light content receives larger type and stronger weight;
- dense content receives controlled smaller type and an internal body scrollbar;
- the panel keeps a fixed title row and scrollable content row, preventing visual overflow without removing other boxes;
- responsive layout keeps the extension panel present instead of hiding it below 1100 px;
- duplicated relation operators are sanitized after formula typesetting, including `≥=`, `≤=`, `≠=`, `>==`, `<==` and analogous repeated-equals forms;
- E242 semantic diagrams are embedded inside the extension panel's scrollable body instead of replacing the entire `.e202-visual` panel;
- E242 diagram, misconception and retrieval richness remains registered and verifiable;
- E235 was not modified.

Browser verification:
- JavaScript syntax check: PASS for the patched E212 file;
- Playwright Chromium workflow: `E215 Reader Pro browser smoke`, run `29082358198`, conclusion `success`;
- tested runtime URL: `http://127.0.0.1:4173/subjects/math/index.html`;
- tested viewports: `1280 x 720` and `900 x 720`;
- both viewports: panel title PASS, duplicate guard PASS, forbidden-label guard PASS, density rules PASS, internal scrolling PASS, geometric containment PASS and responsive visibility PASS;
- relation repair PASS: `>==`, `<==`, `≥=`, `≤=` and `≠=` no longer remain in rendered/raw probes;
- E242 richness PASS with `22` slides, `8` diagrams, `9` retrieval checks and `16` misconception intercepts for the tested §1.4 package;
- console errors: `0`; page errors: `0`; local HTTP errors: `0`;
- tested runtime fix commits: E242 `2f4b3d761b5446a4d348a642a005177954a157d6`, index cache `d3fb88643183520520df70f22e3745b861a5e268`;
- evidence artifact: `e215-browser-smoke-evidence`, artifact ID `8223302254`, digest `sha256:424d069d4fb391c153fa011c887013dd29fc564730794f3cbf72070ed4aff656`;
- final state: `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD`.
