# CODEX_STATE

Current task: `THEORY_SLIDESHOW_C01_L04_PASS_11`

Status: `PASS_11_SLIDESHOW_APPROVED`

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
- Completed: 11/14 passes
- Remaining: 3/14 passes
- Completed steps: 56/73
- Remaining steps: 17/73

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

## Runtime and presentation boundary
- `subjects/math/data/theory_lecture_content.json` remains unchanged.
- No `Xem đầy đủ` artifact was created or changed in PASS 11.
- No HTML, CSS, JavaScript, runtime loader or Reader Pro file was changed.
- E235 remains the visual baseline for later full-view work.
- E236, E237 and E238 remain disabled.
- PASS 11 created slideshow data only.

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Approved core source: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Approved reference source: `subjects/math/data/theory_reference/theory_reference_c01_l04.json`.

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
- concept map;
- notation lookup;
- 12-row formula table;
- representation-family comparison;
- method-selection table;
- assumption checklist;
- quick failure guide;
- verified UGV snapshot;
- engineering transfer and mastery compass;
- reference manifest registration.

# C01-L04 PASS 11 — SLIDESHOW

## Step 1 — Narrative derivation

Created four narrative arcs:
1. `Từ vector đến không gian biểu diễn` — SL01–SL05;
2. `Tọa độ là mã có hợp đồng` — SL06–SL13;
3. `Case UGV và các lỗi biểu diễn` — SL14–SL18;
4. `Redundancy, sensitivity và transfer` — SL19–SL22.

Narrative order:
`object versus coordinates → linear combination → span → independence → basis → order → coordinates → reconstruction → uniqueness → general solve → orthonormal shortcut → non-unit orthogonal case → change of basis → UGV → redundancy → near dependence → engineering transfer → decision checklist`.

## Step 2 — Slide learning beats

Created 22 slides.

Every slide includes:
- one primary learning beat;
- a title and purpose;
- a core message;
- compact content blocks;
- a transition to the next learning beat;
- source traceability.

The deck does not stretch content to meet a slide quota. The 22-slide count follows the academic narrative and worked-case needs.

## Step 3 — Formulas, diagrams and worked-case fragments

Formula coverage:
- F1–F12 are all used;
- formulas are distributed by learning beat;
- formulas include meaning, condition or failure warning;
- no single formula-dump slide was created.

Created 8 semantic diagram specifications:
1. same vector in two coordinate grids;
2. linear-combination contributions;
3. one-direction span versus two-direction span;
4. redundant third vector in an existing span;
5. ordered-basis swap;
6. UGV world-route basis setup;
7. left/right normal sign convention;
8. near-parallel basis sensitivity.

Diagram specifications contain:
- type;
- purpose;
- entities;
- labels;
- mathematical constraints;
- source trace.

They contain no pixel positions, colors, CSS, SVG code or animation directions.

UGV values are locked to the core:
- `[v]_W=(5,1)^T m/s`;
- `t=(0.6,0.8)`;
- `n=(-0.8,0.6)`;
- `P_{W<-R}=[[0.6,-0.8],[0.8,0.6]]`;
- `[v]_R=(3.8,-3.4)^T m/s`;
- reconstruction `(5,1)`;
- residual norm `0`;
- norm squared `26` in both representations;
- route heading `53.1301°`;
- robot yaw `50°`;
- transform age limit `20 ms`.

The deck keeps route frame separate from body frame and treats the example as a free velocity vector rather than a position point.

## Step 4 — Retrieval checks and misconception intercepts

Created 9 embedded retrieval checks covering:
1. linear-combination calculation and units;
2. span membership;
3. basis/non-basis classification;
4. coordinates in a general basis;
5. orthonormal shortcut conditions;
6. basis reorder and lateral-sign convention;
7. redundant-family classification;
8. near-dependence diagnosis;
9. integrated UGV/signal/embedding representation contract.

Created 16 misconception intercepts distributed at the relevant slides, including:
- tuple versus vector;
- span versus uniqueness;
- number of vectors versus number of directions;
- basis conditions;
- basis order;
- shape/units versus full compatibility;
- residual versus model truth;
- arbitrary-basis dot shortcut;
- orthogonal versus orthonormal;
- basis change versus physical-vector change;
- route frame versus body frame;
- lateral sign convention;
- mixed frame and reversed transform;
- solver output versus uniqueness;
- exactness versus numerical stability;
- feature/embedding compatibility.

A VERIFY-ONLY check found the first aggregate metadata count said 14 intercepts while the file contained 16. The count was corrected before manifest registration.

## Step 5 — Slideshow data contract

Created schema:
`bauman_math_theory_slideshow_v1`.

Contract requires:
- presentation data only;
- runtime independence;
- no new mathematics;
- no contradiction with core/reference;
- one primary learning beat per slide;
- formula conditions and meaning;
- semantic-only diagram specs;
- source traceability;
- no CSS, JavaScript, animations or Reader Pro changes.

Created manifest:
`subjects/math/data/theory_slideshow/theory_slideshow_manifest.json`.

Manifest record includes:
- C01/L04 identity;
- source core and reference versions;
- 22 slides;
- 8 diagrams;
- 9 retrieval checks;
- 16 misconception intercepts;
- status `approved_against_core_and_reference`.

## Step 6 — Verification

Verified:
- slideshow source paths and versions match approved core/reference;
- lesson ID and title match;
- narrative contains SL01–SL22 in four complete arcs;
- all C1–C9 concepts are represented;
- all F1–F12 formulas are represented;
- all MECH1–MECH9 mechanisms are traceable;
- all LO1–LO10 outcomes are covered;
- UGV values, signs and transform direction match source artifacts;
- 8 semantic diagram specs are present;
- 9 retrieval checks are present;
- 16 misconception intercepts are present;
- no UI/runtime source was modified;
- quality gate is `slideshow_review_approved`;
- next pass is `PASS_12_FULL_VIEW`.

## PASS 11 verdict
PASS. SLIDESHOW DATA APPROVED AND REGISTERED.

No browser smoke test is claimed because PASS 11 created presentation-independent JSON only.

## Files read
- `CODEX_STATE.md`
- `subjects/math/data/theory_core/theory_core_c01_l04.json`
- `subjects/math/data/theory_reference/theory_reference_c01_l04.json`
- `subjects/math/data/theory_core/theory_core_manifest.json`
- `subjects/math/data/theory_reference/theory_reference_manifest.json`

Repository searches confirmed that no prior standardized `theory_slideshow` schema existed.

## Files created
- `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`
- `subjects/math/data/theory_slideshow/theory_slideshow_manifest.json`

## Files updated
- `CODEX_STATE.md`

## Next task
PASS 12/14 — `Xem đầy đủ`, consisting of 5 steps:
1. derive full-view information architecture from approved core, reference and slideshow;
2. write the complete reading flow without duplicating every source block;
3. map formulas, diagrams, worked case, cautions and retrieval anchors;
4. define full-view data contract without changing Reader Pro runtime;
5. verify academic completeness, source consistency and E235 compatibility.

PASS 12 may create full-view data only. It must not modify Reader Pro, CSS, JavaScript, `theory_lecture_content.json`, E235, E236, E237 or E238.

## Relevant commits
- C01-L04 core approval: `ba57f4c302200d30506cd586892dfb0deb170f51`
- C01-L04 core manifest: `4bdb2e580557e0f712bceba389b2ec4facf4aadb`
- C01-L04 reference table: `565e3b1bc04d47527c390e1e6c67784c46e30d72`
- C01-L04 reference manifest: `9c32c14af9c16e2a38714c9dfa1fb7f09fd10367`
- C01-L04 slideshow initial creation: `85084bbc1fafcb3c5db0ec0d095ffd4965ddb47c`
- C01-L04 slideshow verify-count correction: `982d7535f30d314361aaa541fb0bf8c9a8945bcb`
- C01-L04 slideshow manifest: `ef70fc7a116686d1a2652fef810476e0bd5a5ea4`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
