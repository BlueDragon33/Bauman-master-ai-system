# CODEX_STATE

Current task: `L8-B2_OOP_SOLID_PATTERNS`

Status: `L8_B1_PASS_L8_B2_READY`

Date: 2026-09-03
Branch: `migration/webapp-l1-audit-storage`
Base branch: `main`
Main sync status: `branch_only`

Files changed:
- `assets/data/lesson/programming-prerequisite-policy-v1.json`
- `assets/data/lesson/programming-prerequisite-graph-v1.generated.json`
- `scripts/academic/l8-b1-programming-prerequisite-roadmap-audit.cjs`
- `docs/migration/L8_B1_PROGRAMMING_PREREQUISITE_ROADMAP.md`
- `docs/migration/L8_B1_PROGRAMMING_PREREQUISITE_ROADMAP.generated.json`
- `.github/workflows/migration-l8-programming.yml`
- `assets/data/lesson/reference-implementation-registry-v1.json`
- `scripts/academic/l7-b9-reference-implementation-checkpoint-regression.cjs`
- `docs/migration/L7_B9_REFERENCE_IMPLEMENTATION_CHECKPOINT.md`
- `docs/migration/L7_B9_REFERENCE_IMPLEMENTATION_CHECKPOINT.generated.json`
- `assets/data/lesson/reference-subject-qa-profile-v1.json`
- `scripts/academic/l7-b8-reference-visual-pedagogical-regression.cjs`
- `scripts/academic/l7-b8-reference-browser-regression.cjs`
- `docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.md`
- `docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.generated.json`
- `assets/data/lesson/reference-subject-evidence-review-v1.json`
- `assets/js/platform/universal-lesson/reference-subject-evidence-review-v1.js`
- `scripts/academic/l7-b7-reference-evidence-review-regression.cjs`
- `docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.md`
- `docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.generated.json`
- `assets/data/lesson/foundation-preparatory-bridge-v1.json`
- `assets/js/platform/universal-lesson/foundation-preparatory-bridge-v1.js`
- `scripts/academic/l7-b6-foundation-preparatory-completion-regression.cjs`
- `docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.md`
- `docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.generated.json`
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
- Audited all 48 current Programming lessons across six stages while retaining
  the `programming-v2-specialist` engine, route, source authority, offline
  policy and exact Subject Factory distribution of 28 programming, four
  database and sixteen software-design lessons.
- Recorded that no authoritative Programming lesson currently declares a
  prerequisite/dependency field; B1 therefore creates only a read-only,
  system-curated review-candidate graph rather than silently changing source
  order, navigation, assessment or learner state.
- Partitioned exactly sixteen `vn`/`prep` lessons into twelve mandatory-core
  and four Data/Database branch-introduction lessons, across six primary
  strands. Added seventeen concept-dependency candidates with five roots;
  every edge remains manual-review-required, runtime-inactive and
  assessment-non-blocking.
- Kept `PR17`–`PR48` registered but deliberately unsequenced for their owning
  L8-B2 through B14 steps, with explicit handoff boundaries that do not claim
  those later steps complete.
- Preserved the L7 reference contract: all 48 Programming terminology records
  remain Russian-Twin source-aligned, while Math continues to provide only
  non-blocking `supports` links for `PR06` and `PR20`.
- Retained six open findings covering absent source prerequisites, unapproved
  Python depth, thin Algorithms/Data Structures coverage, advanced Database
  gaps, unqualified auxiliary assessment content and the planned-only code
  runner/SQL playground. Each finding keeps a later L8 owner and blocks its
  corresponding completion or Master-ready claim.
- Added a dedicated L8 workflow plus 56 fail-closed checks and fourteen
  protection mutations. The generated graph object digest is
  `9a91971995b7b7c91bafadbdac0a340362cdbe6b1427607a0f19c5cf7fe612d0`.
- Locked remote evidence for feature commit
  `6d82643e90ada63f49ee26c350911b62b3daf45e`: L8 run `33701368108`, L7 run
  `33701368085`, L6 run `33701368097` and full L5 browser/offline run
  `33701368049` all succeeded. L8 artifact `9873627642` has digest
  `sha256:e718271a39befdfba33078b4afc5de3c5c93684ca46f4fd25ab25388db550105`;
  `migration/l8-b1-programming-prerequisite` is `success` and `main` remains
  `e383912354673bdce7a0059d6b9a23799d74e689`.
- Designated exactly Russian and Math as the official, capability-specific
  reference implementations for later subject work; Foundation remains a
  supporting preparatory bridge and single reviewed pilot.
- Added exact cross-reference bindings for Programming (L8), AI and Signal
  (L9), Systems (L10) and Research (L11) while retaining each subject's own
  engine, route, type profiles, widgets, source, storage, evidence and
  assessment authority.
- Kept Russian Twin source-aligned only for the current 48 Programming
  terminology units; AI/Signal/Systems/Research remain explicitly unavailable
  pending reviewed alignment and continue their source lessons unchanged.
- Kept all Math downstream links as non-blocking `supports` review candidates;
  no inferred prerequisite can affect assessment or Master-ready before a
  reviewed objective binding.
- Fixed stale Russian Twin type metadata for Foundation, Signal and Systems,
  then strengthened B3 to require exact type/default parity for all eight
  Subject Factory subjects instead of Programming alone.
- Retained the Russian missing build/apply target disposition, all three Math
  coverage/prerequisite findings, the global no-evidence finding and all four
  Foundation B8 finding dispositions without claim escalation.
- Added 52 fail-closed B9 checks, 12 protection mutations, an evidence artifact
  and the final remote contexts `migration/l7-b9-reference-implementation` and
  `migration/l7-reference-subjects-complete` without changing runtime, source,
  learner state, offline policy, Service Worker or `main`.
- Added a fail-closed visual/pedagogical QA profile for the exact 406-lesson
  Russian/Math/Foundation reference catalog without modifying subject source.
- Bound Russian to its current 26-lesson/1,138-slide specialist surface, Math
  to 347 legacy lessons plus 18 reviewed overlays/5,852 blocks, and Foundation
  to the exact single B11 pilot while preserving specialist runtime ownership.
- Added a 3×3 online matrix for desktop, tablet and mobile plus three explicit
  base-pack offline probes, with headings, named controls, focus, reduced
  motion, reflow, identity and no-evidence/no-Master-ready checks.
- Kept Foundation template content, non-qualified assessment and simulation
  stage drift claim-blocking and routed them to L21 Content Operations and
  Curriculum Governance; B8 PASS does not hide or resolve those findings.
- Added integrity baselines, eleven protection mutations and CI browser
  evidence without changing runtime, storage, Service Worker, offline policy or
  `main`.
- Added a read-only evidence/review catalog and deterministic schedule
  materializer for all 26 Russian, 365 Math and 15 Foundation lessons.
- Declared 2,030 missing evidence slots across 406 lessons and 1,250
  unscheduled spaced-review templates, including 812 required retention
  windows; B7 does not backfill evidence or schedule reviews implicitly.
- Preserved all 104 Russian B2 targets and added the missing `build-apply`
  dialogue-turn target; preserved all 1,825 Math B5 targets and left all 75
  Foundation checkpoint slots unqualified instead of promoting templates.
- Required an explicit UTC anchor only after verified pre-retention stages and
  an explicit `asOf`; early attempts cannot satisfy a retention window.
- Required varied prompts, protected-answer separation, score/source integrity
  and an authorized verifier. AI, self and peer review remain advisory only.
- A passing set of required review windows creates only a Master-ready
  verification candidate; the hooks cannot write learner state, cut over a
  runtime or assert Master-ready.
- Added deterministic, mutation and CI gates without changing subject source,
  runtime, storage, Service Worker, offline policy or `main`.
- Added a three-track Foundation preparatory bridge covering classroom
  Russian, math/computing/science transition and study method.
- Assigned all five current preparatory modules and all fifteen lessons exactly
  once, preserving curriculum order, exact source locators and deterministic
  Subject Factory lesson types.
- Defined nine capability checkpoints with Russian classroom/technical cues;
  every evidence target remains `target-defined-not-collected` with no mastery
  effect before B7.
- Preserved the single reviewed B11 runtime reference at `f_s01_l1`, kept all
  later-subject handoffs route-only without inferred lesson equivalence and
  made unknown/look-alike IDs fail closed.
- Measured current source limitations instead of hiding them: shared template
  theory/mastery text, 22 preparatory template questions, one observation and
  one practice scenario, plus simulation stage drift remain open for B7/B8.
- Added deterministic and mutation gates without changing Foundation source,
  runtime, learner state, offline policy, Service Worker or `main`.
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
- L7-B9/full L7 GitHub Actions run `33035599795`: PASS
- L6 full deterministic/browser/offline run `33035599823`: PASS
- Full L5 runtime/browser/offline run `33035599789`: PASS
- Remote contexts `migration/l7-b9-reference-implementation` and
  `migration/l7-reference-subjects-complete`: PASS
- L7-B9 evidence artifact `9631893058`, digest:
  `sha256:4c607a7433758eb2681f4ef9ba08065929aa7ee497c26cdac51740d68069abe9`
- L7-B9 reference checkpoint regression, 52/52 checks: PASS
- L7-B9 protection mutations, 12/12 expected failures observed: PASS
- Official references, 2/2; downstream subject bindings, 5/5: PASS
- Russian Twin/Subject Factory type and default parity, 8/8 subjects: PASS
- L7-B9 generated report stable SHA-256:
  `fc01c0a4c9099e4fce9ba82604823bf1890ec60606ebe3820da6e19839f65466`
- L7-B9 registry projection SHA-256:
  `c4ef2a479b5d7a9e4a88383984a84528a4c810b10491dc70f87bf39eb8c3bfbe`
- Feature commit `a67514aacf1a11f66cc2cf9a67c2285f88dfc1ef`; L5 bot checkpoint
  `455a0911fb18d2d872954bb3ba1141a07ef6e587`.
- Local sequential deterministic regressions L7-B1 through B9 and L6-B1
  through B11 plus L5 syntax/static/runtime gates: PASS
- Local Chromium remained unavailable; authoritative B8/B9 progression browser
  evidence is the successful remote L7/L6/L5 runs above.
- L7-B8 GitHub Actions run `33034607212`: PASS
- L6 full deterministic/browser/offline run `33034607221`: PASS
- Full L5 runtime/browser/offline run `33034607213`: PASS
- L7-B8 deterministic visual/pedagogical regression, 86/86 checks: PASS
- L7-B8 protection mutations, 11/11 expected failures observed: PASS
- L7-B8 browser QA, 44/44 checks: PASS
- Online representative surfaces, 9/9 (3 subjects × 3 viewports): PASS
- Explicit offline subject surfaces and subject packs, 3/3 and 3/3: PASS
- L7-B8 generated report stable SHA-256:
  `5a46c2ff18d656fdcd20ab176a7e034b95668eae0e6abe9fab4407aa4f7f269a`
- L7-B8 profile projection SHA-256:
  `5734de560783fb4c188b472bbcfe9fe884ee7d382497fdedf36569833d38356c`
- Remote browser evidence artifact `9631549026`, digest:
  `sha256:144913ba2c79fdde9d061559ec4b5f9fe0bcda9b6f3f23f7d11a71047a9ba08d`
- Local sequential deterministic regressions L7-B1 through B8, L6-B1
  through B11 and L5 static/runtime gates: PASS
- Local Chromium remained unavailable; the authoritative B8 browser/offline
  result is the successful remote L7 run above.
- L7-B7 GitHub Actions run `32944104639`: PASS
- L6 full deterministic/browser/offline run `32944104642`: PASS
- Full L5 runtime/browser/offline run `32944104588`: PASS
- L7-B7 evidence/review regression, 83/83 checks: PASS
- L7-B7 protection mutations, 10/10 expected failures observed: PASS
- Reference coverage, 406/406 lessons and 2,030/2,030 evidence slots: PASS
- Review coverage, 1,250 templates and 812 required windows: PASS
- L7-B7 catalog SHA-256:
  `99bb3bec7ad202ecc81cf309da2171adb9b2876792c76b585af83afbdf7255aa`
- L7-B7 schedule fixture SHA-256:
  `be57fbf4d1a46527b29495f28d6d9381bdc4f7a81cfff7c14231d89fe8a85644`
- L7-B7 generated report stable SHA-256:
  `8c296cb9a6114ca429032634f9e67976e4843895a3b42836ceff29c1a9e3b5b3`
- Local sequential deterministic regressions L7-B1 through B7, L6-B1
  through B11 and L5 static/runtime gates: PASS
- Local Chromium was unavailable; authoritative browser/offline evidence is
  supplied by the successful remote L6 and L5 runs above.
- L7-B6 GitHub Actions run `32942456784`: PASS
- L6 full regression/browser run `32942456752`: PASS
- Full L5 runtime/browser/offline run `32942456698`: PASS
- L7-B6 Foundation preparatory completion, 51/51 checks: PASS
- L7-B6 protection mutations, 8/8 expected failures observed: PASS
- Foundation bridge coverage, 3/3 tracks, 5/5 modules, 15/15 lessons and
  9/9 capability checkpoints: PASS
- L7-B6 pack SHA-256:
  `1fad88fd68b49ee4d614bddea21671af0fa11a0aea24d944e6e381e5a14a7c47`
- L7-B6 generated report stable SHA-256:
  `8da9b3cde176aca2b95895e7e5850ad1377838af2b014df6204e79b4c0d0ae0a`
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
- L7 and its final progression gate have passed, but do not merge to `main`;
  continue L8 sequentially on the same draft branch until the roadmap's final
  release gates authorize cutover.

Next recommended task:
- Begin L8-B1: build the Programming fundamentals roadmap from real
  prerequisites and the existing 48-lesson source, using the B9 Russian/Math
  reference lanes without copying either specialist UI or activating
  non-reviewed Math support links.

Next actor:
- Codex

Codex required:
- yes
- Reason: L8-B1 needs an exact Programming lesson/prerequisite audit and a
  source-preserving roadmap baseline before later code runner, database and
  software-design expansion.

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
