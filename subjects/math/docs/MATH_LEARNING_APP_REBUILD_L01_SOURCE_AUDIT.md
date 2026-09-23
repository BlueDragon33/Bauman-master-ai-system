# Math Learning Application Rebuild — LƯỢT 1 Source Audit

## Baseline
- Repository: `BlueDragon33/Bauman-master-ai-system`
- Authoritative base: `main`
- Baseline commit: `dd00057d48634725f8fd7e336c1e359d1a6a15cd`
- Working branch: `codex/math-learning-app-rebuild`
- Scope: `subjects/math`
- Rule: do not patch UI from screenshots; source code is authoritative.

## Inventory snapshot
- Repository entries scanned: 1747
- Entries under `subjects/math`: 688
- Main Math entry: `subjects/math/index.html`
- Top-level Math areas:
  - `assets/`
  - `content_bundles/`
  - `data/`
  - `docs/`
  - `qa/`
  - `schemas/`
  - `simulations/`
  - `templates/`
  - `tools/`
- Manifest pair:
  - `subject-manifest.js`
  - `subject-manifest.json`

## Runtime entry audit
`subjects/math/index.html` currently loads:
- 23 stylesheet files
- 40 script files
- 63 local runtime asset references total
- Missing referenced assets: 0

This means the entry point is not broken by a missing-file error, but it carries a very large layered runtime surface.

### Major CSS layers
- `assets/core.css` ≈ 950 KB
- `assets/math.css` ≈ 155 KB
- plus 21 additional Math/Theory CSS files

### Major JS layers
The entry point mixes:
1. subject adapter / host bridge;
2. legacy/program-frame code;
3. many versioned `theory_skin` modules from E129 through E245;
4. newer `math-*` modules for workspace, dashboard, navigation, learning flow, library, simulation, formula, mastery, command center, regression and runtime health.

This is a concrete architecture-debt signal. Visual inconsistency is not primarily a styling problem; it is a composition/source-of-truth problem.

## Data inventory findings
The Math data directory contains both substantial authoritative-looking datasets and multiple placeholder files.

Examples of substantial datasets:
- `lessons.json` ≈ 7.8 MB
- `chapter_spine.json` ≈ 204 KB
- `curriculum.json` ≈ 118 KB
- `concepts.json` ≈ 167 KB
- `theory-framework.json` ≈ 429 KB
- `theory_lecture_content.json` ≈ 258 KB
- multiple normalized theory/reference/slideshow datasets

Examples of 2-byte placeholder datasets currently present:
- `applications.json`
- `chapter_lectures.json`
- `concept-map.json`
- `content-index.json`
- `exercises.json`
- `formulas.json`
- `knowledge-index.json`
- `mastery-map.json`
- `mindmap.json`
- `professor_qa.json`
- `question_bank.json`
- `review_packs.json`
- `simulations.json`
- `test_blueprints.json`

At the same time, corresponding frame/content files exist. The rebuild must therefore establish an adapter/normalization layer rather than assuming every legacy JSON filename is authoritative.

## Manifest inconsistency
The current manifest still contains multiple historical/finalization markers and legacy navigation concepts, including:
- `framework_only_empty_content_visible_split_vault`
- `isFinal: false`
- `final: false`
- `notFinal: true`
- historical E-series checkpoint/patch labels
- navigation entries that expose content/resource types such as Simulation, Formula, Mind map and Storage directly

This conflicts with the new learner-first requirement where content types are data sources/context tools, not primary equal-level navigation.

## Runtime/state findings
The legacy `core-subject.js` keeps learner state in localStorage and models a tab-first shell with categories such as overview / learning / practice / review / exam / projects / resources / storage / videos.

This confirms the current mental model is still partly feature/tab-first instead of:
`Stage → Module → Chapter → Lesson → Step → Activity`.

The rebuild should preserve useful persistence and planning bridge behavior but replace the primary learner mental model.

## Blockers identified
### B1 — Layered runtime architecture
23 CSS + 40 JS files at the entry point makes behavior/order difficult to reason about and encourages override-driven fixes.

### B2 — Multiple historical UI generations coexist
Versioned theory skin modules and newer Math modules load together.

### B3 — Navigation exposes implementation/data concepts
Current manifest/navigation still promotes resource types to top-level destinations.

### B4 — Data source ambiguity
Large datasets coexist with empty legacy aliases/placeholders and split frame/content stores.

### B5 — Source-of-truth ambiguity
Manifest contains contradictory "final/not final/checkpoint/latest patch" metadata and legacy architecture notes.

### B6 — Risk of fake completion/progress
Persistence exists, but before the rebuild it must be proven which modules own lesson completion, chapter progress, mastery and resume behavior. No new progress engine should be added until this ownership map is complete.

## Keep / Refactor / Merge / Retire decision

### KEEP
- Authoritative curriculum/chapter/lesson content
- Stable IDs and existing cross-referenceable academic content
- Host/planning bridge integration
- Useful local persistence primitives after ownership is clarified
- Existing simulations and formula rendering that pass mapping tests
- Existing QA/schema/tooling where still applicable

### REFACTOR
- Math application shell
- Primary navigation
- lesson runtime composition
- progress/resume ownership
- resource discovery
- data normalization/loading layer
- responsive layout ownership
- CSS token/component ownership

### MERGE
- overlapping navigation + dashboard + workspace + learning-flow responsibilities
- formula/simulation/application access into lesson context
- duplicated visual layers where the same component role exists in multiple generations

### RETIRE FROM PRIMARY NAV
- standalone Formula
- standalone Simulation
- standalone Mind map / Concept map
- Storage/Data as learner-facing primary destinations
These may remain as contextual resources or admin/advanced tools.

## Gate tests run
1. Authoritative `main` commit resolved: PASS
2. Recursive repository tree read: PASS
3. `subjects/math` inventory generated: PASS
4. Runtime entry dependency scan: PASS
5. 63 local runtime asset references verified present: PASS
6. Data-source ambiguity identified: PASS
7. Primary architecture debt mapped: PASS

## LƯỢT 1 result
**PASS**

The source is sufficiently mapped to proceed to LƯỢT 2 UX audit and LƯỢT 3 information architecture without guessing.

## Next
LƯỢT 2 must audit the actual learner journey:
- first visit;
- resume after partial lesson;
- wrong answer recovery;
- lesson completion;
- weak mastery review;
- offline/error state.

LƯỢT 3 must freeze the new information architecture before visual redesign:
- Tổng quan
- Lộ trình
- Học
- Luyện tập
- Ôn tập

Advanced resources become contextual tools / resource drawer rather than parallel learning paths.
