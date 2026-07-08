# CODEX_STATE

Current task: `THEORY_FULL_VIEW_C01_L04_PASS_12`

Status: `PASS_12_FULL_VIEW_APPROVED`

Date: 2026-07-08
Branch: `main`

## Mandatory development order
1. Core content
2. `Tham khảo thêm` reference table
3. Slideshow
4. `Xem đầy đủ`
5. Final formula and layout normalization
6. Final integration and acceptance

Do not skip ahead.

## Codex session rule
- Direct ChatGPT-to-GitHub work is preferred when repository tools are available.
- If Codex is required, create a **new Codex session** for the next narrow task.
- Do not continue an old Codex session.
- The new Codex session must first read `CODEX_STATE.md` and only the source files named for that task.
- One Codex session should handle one Pass or one tightly scoped objective.

## Per-lesson workflow
Each complete lesson passes through 14 passes and 73 controlled steps.

Core-content passes:
1. Scope lock — 4 steps
2. Bauman academic map — 5 steps
3. Pedagogical spine — 5 steps
4. Core academic content — 6 steps
5. Independent mathematics review — 5 steps
6. Engineering-model review — 5 steps
7. Complete worked case — 6 steps
8. Misconceptions and failure modes — 5 steps
9. Assessment and implementation contract — 5 steps

Presentation and integration passes:
10. `Tham khảo thêm` reference table — 4 steps
11. Slideshow — 6 steps
12. `Xem đầy đủ` — 5 steps
13. Formula and layout normalization — 5 steps
14. Final integration and acceptance — 7 steps

## Progress for §1.4
- Completed: 12/14 passes
- Remaining: 2/14 passes
- Completed steps: 61/73
- Remaining steps: 12/73

## Approved artifacts

### Core
- Path: `subjects/math/data/theory_core/theory_core_c01_l04.json`
- Version: `CORE_C01_L04_V1_APPROVED`
- Status: `approved_against_gold_standard`
- Quality gate: `content_review_approved`
- Manifest: `subjects/math/data/theory_core/theory_core_manifest.json`
- Manifest version: `CORE_MANIFEST_V1_4`

### Reference table
- Path: `subjects/math/data/theory_reference/theory_reference_c01_l04.json`
- Version: `REFERENCE_C01_L04_V1_APPROVED`
- Status: `approved_against_core`
- Quality gate: `reference_review_approved`
- Manifest: `subjects/math/data/theory_reference/theory_reference_manifest.json`
- Manifest version: `REFERENCE_MANIFEST_V1_1`

### Slideshow
- Path: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`
- Version: `SLIDESHOW_C01_L04_V1_APPROVED`
- Status: `approved_against_core_and_reference`
- Quality gate: `slideshow_review_approved`
- Manifest: `subjects/math/data/theory_slideshow/theory_slideshow_manifest.json`
- Manifest version: `SLIDESHOW_MANIFEST_V1_1`
- Slides: 22
- Narrative arcs: 4
- Diagram specifications: 8
- Retrieval checks: 9
- Misconception intercepts: 16

### Full view
- Path: `subjects/math/data/theory_full_view/theory_full_view_c01_l04.json`
- Version: `FULL_VIEW_C01_L04_V1_APPROVED`
- Status: `approved_against_core_reference_slideshow`
- Quality gate: `full_view_review_approved`
- Manifest: `subjects/math/data/theory_full_view/theory_full_view_manifest.json`
- Manifest version: `FULL_VIEW_MANIFEST_V1_1`
- Reading sections: 11
- Formula registry entries: 12
- Diagram mappings: 8
- Cautions: 14
- Retrieval anchors: 9
- Reader baseline: `E235_READER_PRO_FORMULA_STANDARD_R2`

## Runtime and presentation boundary
- `subjects/math/data/theory_lecture_content.json` remains unchanged.
- No HTML, CSS, JavaScript, runtime loader or Reader Pro file was changed.
- E235 remains unchanged and is recorded only as a semantic compatibility baseline.
- E236, E237 and E238 remain disabled.
- PASS 12 created full-view data only.

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Approved core source: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Approved reference source: `subjects/math/data/theory_reference/theory_reference_c01_l04.json`.
- Approved slideshow source: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`.

# PASSES 01–09 — CORE PHASE
Status: COMPLETE AND APPROVED.

Delivered:
- scope and academic map;
- pedagogical spine;
- 10 learning outcomes;
- 16 notation rules;
- 9 concepts and 9 mechanisms;
- 12 formula contracts and 12 assumption gates;
- mathematics and engineering-model reviews;
- verified UGV worked case;
- 20 misconceptions and 18 failure modes;
- assessment blueprint, scoring policy and implementation contract;
- approved core and core manifest registration.

# PASS 10 — `THAM KHẢO THÊM`
Status: COMPLETE AND APPROVED.

Delivered:
- concept map and notation lookup;
- 12-row formula table;
- family comparison and method selection;
- assumption checklist and quick failure guide;
- verified UGV snapshot;
- engineering transfer and mastery compass;
- reference manifest registration.

# PASS 11 — SLIDESHOW
Status: COMPLETE AND APPROVED.

Delivered:
- 22 slides in four narrative arcs;
- F1–F12 distributed by learning beat;
- 8 semantic diagram specifications;
- 9 retrieval checks;
- 16 misconception intercepts;
- verified UGV slide sequence;
- slideshow manifest registration.

# C01-L04 PASS 12 — `XEM ĐẦY ĐỦ`

## Step 1 — Full-view information architecture

Created 11 reading sections:
1. thesis and reading map;
2. linear combination and span;
3. independence and basis;
4. ordered basis, coordinates and reconstruction;
5. general-basis coordinate solve;
6. orthonormal and orthogonal non-unit methods;
7. change of basis;
8. complete UGV world-route worked case;
9. failure modes, redundancy and near dependence;
10. robot, signal, feature and embedding transfer;
11. decision checklist and mastery close.

The full view is a complete reading flow, not a concatenation of the core, reference and slideshow files.

Source precedence is locked:
1. approved core;
2. approved reference;
3. approved slideshow.

Core remains the source of truth.

## Step 2 — Complete reading flow

Created a continuous reading structure with:
- section leads;
- definitions;
- explanations;
- formulas with meaning and conditions;
- derivations;
- examples;
- comparisons;
- warnings;
- worked steps;
- checks;
- engineering transfer;
- closing summaries.

The full view does not copy:
- the complete assessment blueprint;
- Python reference implementation;
- telemetry contract;
- CSS or runtime behavior;
- every source paragraph verbatim.

## Step 3 — Formula, diagram, worked-case, caution and retrieval mapping

Created a 12-entry formula registry covering F1–F12.

Every formula records:
- formula text;
- target section;
- mathematical meaning;
- application condition.

Mapped all 8 semantic slideshow diagrams:
1. same vector in two coordinate grids;
2. linear-combination contributions;
3. one-direction versus two-direction span;
4. redundant third vector;
5. ordered-basis swap;
6. UGV world-route basis;
7. left/right normal convention;
8. near-parallel basis sensitivity.

Created 14 caution entries covering:
- tuple versus vector;
- basis-change invariance;
- span versus uniqueness;
- vector count versus independent directions;
- solver output versus uniqueness;
- basis order and sign convention;
- residual versus model truth;
- arbitrary-basis dot-product misuse;
- orthogonal versus orthonormal;
- transform direction and version;
- route frame versus body frame;
- free vector versus affine point;
- exactness versus stability;
- equal shape/dimension versus compatibility.

Mapped 9 retrieval anchors into the reading flow.

### Verified UGV worked case
- Object: free velocity vector.
- World coordinates: `[v]_W=(5,1)^T m/s`.
- Route tangent: `t=(0.6,0.8)`.
- Left normal: `n=(-0.8,0.6)`.
- Basis order: `(parallel,left)`.
- Route heading: `53.1301°`.
- Robot yaw: `50°`.
- Transform age limit: `20 ms`.
- Route coordinates: `[v]_R=(3.8,-3.4)^T m/s`.
- Interpretation: `3.8 m/s` along route and `3.4 m/s` to the right.
- Transform: `P_{W<-R}=[[0.6,-0.8],[0.8,0.6]]`.
- Reconstruction: `(5,1)`.
- Residual norm: `0`.
- Norm squared: `26` in both representations.
- Reordered basis `(n,t)`: `(-3.4,3.8)`.
- Right-normal lateral coordinate: `+3.4`.

## Step 4 — Full-view data contract

Created schema:
`bauman_math_theory_full_view_v1`.

Contract requires:
- complete reading flow;
- presentation data only;
- runtime independence;
- approved source precedence;
- no new mathematics;
- no contradiction with sources;
- no full assessment duplication;
- no implementation code;
- formula meaning, conditions and warnings;
- worked-case reconstruction;
- source traceability;
- no CSS, JavaScript, runtime wiring or Reader Pro patch.

### E235 compatibility

Recorded baseline:
`E235_READER_PRO_FORMULA_STANDARD_R2`.

Compatibility is semantic only:
- symbols and indices remain semantic;
- transform directions remain explicit;
- formulas remain separate from prose that could alter meaning;
- theoretical blocks contain no implementation code;
- block vocabulary is limited to stable content types.

No E235 source file was opened for modification or changed.

## Step 5 — Verification

Verified:
- source paths and versions match approved core, reference and slideshow;
- lesson ID and title match;
- information architecture and reading flow both contain FV01–FV11;
- C1–C9 are covered;
- F1–F12 are covered;
- MECH1–MECH9 are covered;
- LO1–LO10 are covered;
- all four slideshow arcs are represented;
- formula registry count is 12;
- diagram mapping count is 8;
- caution count is 14;
- retrieval anchor count is 9;
- UGV numbers, signs, direction and invariants match approved sources;
- vector/coordinate, existence/uniqueness, exactness/stability and compatibility/dimension distinctions remain visible;
- no UI/runtime source was modified;
- quality gate is `full_view_review_approved`;
- next pass is `PASS_13_FORMULA_LAYOUT_NORMALIZATION`.

## Full-view manifest

Created:
`subjects/math/data/theory_full_view/theory_full_view_manifest.json`.

Manifest record contains:
- C01/L04 identity;
- all three approved source versions;
- E235 semantic baseline;
- 11 sections;
- 12 formulas;
- 8 diagrams;
- 14 cautions;
- 9 retrieval anchors;
- approved status.

## PASS 12 verdict
PASS. FULL-VIEW DATA APPROVED AND REGISTERED.

No browser smoke test is claimed because PASS 12 created presentation-independent JSON only.

## Files read
- `CODEX_STATE.md`
- `subjects/math/data/theory_core/theory_core_c01_l04.json`
- `subjects/math/data/theory_reference/theory_reference_c01_l04.json`
- `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`

Repository searches confirmed that no prior standardized `theory_full_view` schema existed.

## Files created
- `subjects/math/data/theory_full_view/theory_full_view_c01_l04.json`
- `subjects/math/data/theory_full_view/theory_full_view_manifest.json`

## Files updated
- `CODEX_STATE.md`

## Next task
PASS 13/14 — Formula and layout normalization, consisting of 5 steps:
1. inventory formulas and notation across core, reference, slideshow and full view;
2. create a canonical semantic notation and formula-display contract;
3. normalize source/target arrows, subscripts, superscripts, matrices, vectors, units and tolerance wording in data artifacts;
4. define layout-density and content-block constraints compatible with E235 without changing runtime;
5. verify consistency across all four approved artifact layers.

PASS 13 may modify the four C01-L04 data artifacts and their manifests only when normalization is required. It must not modify `theory_lecture_content.json`, Reader Pro, HTML, CSS, JavaScript, E235, E236, E237 or E238.

## Relevant commits
- C01-L04 core approval: `ba57f4c302200d30506cd586892dfb0deb170f51`
- C01-L04 reference table: `565e3b1bc04d47527c390e1e6c67784c46e30d72`
- C01-L04 slideshow verified: `982d7535f30d314361aaa541fb0bf8c9a8945bcb`
- C01-L04 slideshow manifest: `ef70fc7a116686d1a2652fef810476e0bd5a5ea4`
- C01-L04 full view: `ddc561ce4d98b7f02d24a00c6e4ac4fede97d382`
- C01-L04 full-view manifest: `47fcfa672a6446aea695261da6aeb5abc737ad15`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
