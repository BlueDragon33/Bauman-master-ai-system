# CODEX_STATE

Current task: `THEORY_FINAL_INTEGRATION_C01_L04_PASS_14`

Status: `PASS_14_FINAL_INTEGRATION_ACCEPTED_IMPORT_READY`

Date: 2026-07-08
Branch: `main`

## Codex session rule
- Prefer direct ChatGPT-to-GitHub work when repository tools are available.
- If Codex is required, create a new Codex session for one narrow task.
- Never continue an old Codex session.
- A new Codex session must read this file and only the explicitly named source files.

## Workflow result for §1.4
- Completed passes: 14/14
- Remaining passes: 0/14
- Completed steps: 73/73
- Remaining steps: 0/73
- Academic package: FINAL
- Runtime import package: FINAL AND IMPORT-READY
- Automatic runtime binding: DEFERRED BY SAFETY BOUNDARY

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Chapter ID: `MATH-VN-C01-vector_trong_khong_gian_`
- Runtime contract: `E129_THEORY_CONTENT_IMPORTER`
- Reader baseline: `E235_READER_PRO_FORMULA_STANDARD_R2`

## Final approved artifact graph

### Core
- Path: `subjects/math/data/theory_core/theory_core_c01_l04.json`
- Version: `CORE_C01_L04_V1_APPROVED`
- Status: `approved_against_gold_standard`
- Quality gate: `content_review_approved`

### Reference
- Path: `subjects/math/data/theory_reference/theory_reference_c01_l04.json`
- Version: `REFERENCE_C01_L04_V1_APPROVED`
- Status: `approved_against_core`
- Quality gate: `reference_review_approved`

### Slideshow
- Path: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`
- Version: `SLIDESHOW_C01_L04_V1_APPROVED`
- Slides: 22
- Narrative arcs: 4
- Diagram specifications: 8
- Retrieval checks: 9
- Misconception intercepts: 16

### Full view
- Path: `subjects/math/data/theory_full_view/theory_full_view_c01_l04.json`
- Version: `FULL_VIEW_C01_L04_V1_APPROVED`
- Sections: 11
- Formula entries: 12
- Diagram mappings: 8
- Cautions: 14
- Retrieval anchors: 9

### Formula and layout normalization
- Path: `subjects/math/data/theory_normalization/theory_normalization_c01_l04.json`
- Version: `NORMALIZATION_C01_L04_V1_APPROVED`
- Canonical formulas: 12
- Canonical notation entries: 11
- Resolved display variants: 11
- Unit rules: 5
- Semantic conflicts: 0

### Final integration
- Path: `subjects/math/data/theory_integration/theory_integration_c01_l04.json`
- Version: `INTEGRATION_C01_L04_V1_ACCEPTED`
- Status: `final_acceptance_import_ready`
- Manifest: `subjects/math/data/theory_integration/theory_integration_manifest.json`
- Manifest version: `INTEGRATION_MANIFEST_V1_1`

### E129 runtime import package
- Path: `subjects/math/data/theory_integration/theory_lecture_content_c01_l04_import.json`
- Version: `C01_L04_E129_IMPORT_V1_APPROVED`
- Target: `theory_lecture_content`
- Mode: `merge`
- Merge key: `lessonId`
- Records: 1
- Runtime slides: 16
- Source slideshow slides: 22
- Preferred E129 role order: matched
- Security scan: pass

## Pass 14 execution

### Step 1 — Artifact graph and precedence
Verified the complete chain:
`core → reference → slideshow → full view → normalization → runtime projection`.

Core remains the mathematical source of truth. No downstream layer may override core meaning.

### Step 2 — Lesson integration record
Created one integration record binding:
- core;
- reference;
- slideshow;
- full view;
- normalization;
- E129 runtime projection.

The integration record includes IDs, versions, source precedence, mappings, acceptance checks, UGV invariants, runtime boundaries and handoff instructions.

### Step 3 — IDs, versions, counts and invariants
Verified:
- lesson ID matches all layers;
- chapter ID matches the theory frame;
- all source versions match;
- C1–C9 are covered;
- F1–F12 are covered;
- MECH1–MECH9 are covered;
- LO1–LO10 are covered;
- all four slideshow arcs are represented;
- all 11 full-view sections are represented;
- canonical formula count is 12;
- canonical notation count is 11;
- semantic conflicts are zero.

UGV invariants remain:
- `[v]_W=(5,1)^T m/s`;
- `t=(0.6,0.8)`;
- `n=(-0.8,0.6)`;
- `[v]_R=(3.8,-3.4)^T m/s`;
- `P_{W←R}=[[0.6,-0.8],[0.8,0.6]]`;
- reconstruction `(5,1)`;
- residual `(0,0)`;
- residual norm `0`;
- norm squared `26` in both representations;
- route heading `53.1301°`;
- robot yaw `50°`;
- max transform age `20 ms`;
- reordered basis coordinates `(-3.4,3.8)`;
- right-normal coordinate `+3.4`.

### Step 4 — Runtime convention inspection
Inspected narrowly:
- `subjects/math/data/theory_lecture_frame.json`;
- `subjects/math/data/theory_lecture_content.json`;
- `subjects/math/subject-manifest.json`;
- `subjects/math/assets/subject-adapter.js`;
- `subjects/math/index.html`;
- `subjects/math/assets/theory_skin/theory-tab-E129.js`.

Confirmed:
- E129 reads frame and content separately;
- primary content file is `data/theory_lecture_content.json`;
- record key is `lessonId`;
- required record fields are `lessonId`, `chapterId`, `lessonTitle|title`, `slides`;
- importer supports `merge`, `patch`, `replace`;
- merge replaces only the matching `lessonId`;
- the existing L04 runtime record is present in the monolithic content file;
- E129 recommends 16 preferred slide roles.

### Step 5 — Safe binding decision
Created a merge-import package with one L04 record and exactly 16 preferred E129 roles:
1. problem_framing
2. deep_essence
3. counter_intuition
4. real_bridge
5. notation
6. core_formula
7. assumption_gate
8. mini_case
9. interpretation
10. simulation
11. common_mistakes
12. application
13. practice
14. professor_qa
15. bridge
16. takeaway

The approved 22-slide narrative is projected into these 16 runtime roles without changing mathematical meaning.

Automatic binding was not performed because:
- E129 import writes a user-local overlay to localStorage;
- invoking it automatically would mutate user-local state;
- the durable source is a large monolithic JSON file;
- rewriting that file without preserving every record would be unsafe.

No fetch monkeypatch, loader hack or implicit localStorage write was introduced.

### Step 6 — Verification
Static verification passed:
- package target is `theory_lecture_content`;
- mode is `merge`;
- one valid record exists;
- lesson ID and chapter ID are present;
- 16 slides exist;
- preferred role order matches E129;
- no duplicate lesson IDs exist;
- no forbidden script, javascript URL, inline handler, object-string, TODO, FIXME, lorem or dirty text pattern exists;
- formula IDs F1–F12 remain traceable;
- UGV values are unchanged;
- no UI/runtime source was changed.

Browser smoke test was not run because runtime binding was not performed. Browser acceptance is required after explicit E129 merge import or a durable monolithic-file merge.

### Step 7 — Final acceptance and handoff
Final verdict:
`PASS_14_ACCEPTED_WITH_RUNTIME_BINDING_DEFERRED`

Accepted:
- academic package;
- reference layer;
- 22-slide slideshow;
- 11-section full view;
- formula/layout normalization;
- final integration record;
- E129 merge-import package.

Handoff action:
1. Open `Kho Lý thuyết` in E129.
2. Import `subjects/math/data/theory_integration/theory_lecture_content_c01_l04_import.json`.
3. Select `Merge` mode.
4. Open lesson §1.4 by its exact lesson ID.
5. Verify all 16 runtime slides and E234/E235 formula rendering.
6. Verify UGV values, direction, reconstruction and invariants.
7. Export the merged `theory_lecture_content` and commit it only after visual verification if durable repo binding is required.

Do not:
- use Replace mode for the whole content store;
- overwrite the monolithic file without preserving all records;
- re-enable E236, E237 or E238;
- redesign Reader Pro during the durable merge.

## Runtime and UI boundary
Unchanged:
- `subjects/math/data/theory_lecture_content.json`;
- `subjects/math/data/theory_lecture_frame.json`;
- `subjects/math/index.html`;
- `subjects/math/subject-manifest.json`;
- `subjects/math/assets/subject-adapter.js`;
- E129 loader;
- Reader Pro;
- E235;
- E236, E237 and E238 remain disabled.

## Files created in Pass 14
- `subjects/math/data/theory_integration/theory_lecture_content_c01_l04_import.json`
- `subjects/math/data/theory_integration/theory_integration_c01_l04.json`
- `subjects/math/data/theory_integration/theory_integration_manifest.json`

## Files updated in Pass 14
- `CODEX_STATE.md`

## Relevant commits
- Runtime import package: `937603e48c4049034153756f1d47ced2d6c5f5d2`
- Final integration record: `62c5fcb0b239b9717587f27be392dd1f9a6d3f91`
- Integration manifest: `bd04ef1948cd829f8355d014d0185e4ab81c9c62`

## Project continuation
The §1.4 pipeline is complete. A new lesson must start again from Pass 1 unless the task is an explicit post-import runtime verification or durable merge of this accepted package.
