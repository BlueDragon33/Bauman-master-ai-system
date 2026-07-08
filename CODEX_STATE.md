# CODEX_STATE

Current task: `THEORY_REFERENCE_C01_L04_PASS_10_REFERENCE_TABLE`

Status: `PASS_10_REFERENCE_TABLE_APPROVED`

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
- Completed: 10/14 passes
- Remaining: 4/14 passes
- Completed steps: 50/73
- Remaining steps: 23/73

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

## Runtime and presentation boundary
- `subjects/math/data/theory_lecture_content.json` remains unchanged.
- No slideshow file was created in PASS 10.
- No `Xem đầy đủ` file was changed.
- No UI, CSS, JavaScript, animation or runtime file was changed.
- E235 remains the visual baseline for later full-view work.
- E236, E237 and E238 remain disabled.

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.
- Approved core source: `subjects/math/data/theory_core/theory_core_c01_l04.json`.

# PASSES 01–09 — CORE PHASE

Status: COMPLETE AND APPROVED.

Core phase delivered:
- scope and academic map;
- pedagogical spine;
- 10 outcomes, 16 notation rules, 9 concepts and 9 mechanisms;
- 12 formula contracts and 12 assumption gates;
- independent mathematics and engineering-model reviews;
- verified UGV worked case;
- 20 misconceptions and 18 failure modes;
- assessment blueprint, scoring policy and implementation contract;
- approved core and manifest registration.

# C01-L04 PASS 10 — `THAM KHẢO THÊM` REFERENCE TABLE

## Step 1 — Information architecture

Created seven compact reference sections:
1. concept map;
2. formula table;
3. representation-family comparison;
4. method selection;
5. engineering assumption gates;
6. quick failure diagnosis;
7. verified UGV snapshot.

The reference artifact is deliberately separate from:
- the approved core;
- slideshow content;
- full-view content;
- UI/runtime rendering.

A reference contract blocks:
- new mathematics;
- contradictions with core;
- UI or runtime directives;
- slide numbering;
- untraceable summaries.

## Step 2 — Compact content selection

The approved reference artifact contains:
- 9 concept-map entries covering C1–C9;
- 9 notation lookup entries;
- 12 formula rows covering F1–F12;
- 6 representation-family comparison rows;
- 6 method-decision rows;
- 9 assumption/checklist rows;
- 12 high-value quick failure guides derived from 13 failure-mode IDs;
- 1 verified UGV numerical snapshot;
- 6 engineering-transfer rows;
- 7 mastery-compass questions.

The reference table distinguishes:
- spanning family;
- independent family;
- basis;
- orthonormal basis;
- overcomplete dictionary;
- feature set.

Method selection distinguishes:
- general basis solve;
- orthonormal dot shortcut;
- orthogonal non-unit quotient;
- redundant-family analysis;
- out-of-span approximation status;
- incompatible-frame/model alignment.

## Step 3 — Source-traceable reference writing

Every major entry points to:
- a core concept ID;
- a formula ID;
- a core field;
- or a failure-mode ID.

Traceability records:
- all C1–C9 concepts;
- all F1–F12 formulas;
- all 12 assumption gates;
- the verified worked case;
- all four misconception classes;
- selected high-value operational failures.

No assessment blueprint, Python reference implementation or full lesson prose was copied into the reference artifact.

## Step 4 — Verification against approved core

Verified:
- core source version is `CORE_C01_L04_V1_APPROVED`;
- lesson ID and title match the approved core;
- all nine concepts are represented;
- all twelve formulas include conditions and warnings;
- all twelve core assumption gates are traceable;
- UGV values match exactly:
  - `[v]_W=(5,1)^T m/s`;
  - `t=(0.6,0.8)`;
  - `n=(-0.8,0.6)`;
  - `[v]_R=(3.8,-3.4)^T m/s`;
  - residual norm `0`;
  - norm squared `26` in both representations;
- basis order, transform direction, normal convention, timestamp and point/vector cautions remain visible;
- no new theorem, algorithm or modeling claim was introduced;
- JSON opens and closes correctly;
- `qualityGate.reviewStatus=reference_review_approved`;
- `qualityGate.nextPass=PASS_11_SLIDESHOW`.

## Reference manifest

Created:
`subjects/math/data/theory_reference/theory_reference_manifest.json`

Manifest policy:
- reference files require approved core sources;
- concepts and formulas require traceability;
- worked-case numbers must match core;
- reference artifacts must stay compact;
- UI/runtime instructions are forbidden;
- downstream content cannot override core.

Registered record:
- C01/L04;
- source core version `CORE_C01_L04_V1_APPROVED`;
- status `approved_against_core`.

## PASS 10 verdict
PASS. REFERENCE TABLE APPROVED.

No browser smoke test is claimed because PASS 10 created presentation-independent JSON only.

## Next task
PASS 11/14 — Slideshow, consisting of 6 steps:
1. derive a slide narrative from the approved core and reference table;
2. select slide-level learning beats without duplicating the full lesson;
3. write formulas, diagrams and worked-case fragments with exact source traceability;
4. build retrieval checks and misconception intercepts into the narrative;
5. define slideshow data contract without changing runtime/UI code;
6. verify academic completeness, slide economy and consistency against core/reference.

PASS 11 may create slideshow data only. It must not modify `theory_lecture_content.json`, Reader Pro UI, CSS or runtime files.

## Relevant commits
- C01-L04 core approval: `ba57f4c302200d30506cd586892dfb0deb170f51`
- C01-L04 core manifest registration: `4bdb2e580557e0f712bceba389b2ec4facf4aadb`
- C01-L04 PASS 09 state: `9c7db8e0c7dcd6c05b4754d930682bd52f53356a`
- C01-L04 reference table: `565e3b1bc04d47527c390e1e6c67784c46e30d72`
- Theory reference manifest: `9c32c14af9c16e2a38714c9dfa1fb7f09fd10367`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
