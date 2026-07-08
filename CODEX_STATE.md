# CODEX_STATE

Current task: `THEORY_FORMULA_LAYOUT_NORMALIZATION_C01_L04_PASS_13`

Status: `PASS_13_FORMULA_LAYOUT_NORMALIZATION_APPROVED`

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
Each lesson passes through 14 passes and 73 controlled steps.

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
- Completed: 13/14 passes
- Remaining: 1/14 pass
- Completed steps: 66/73
- Remaining steps: 7/73

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.

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

### Formula and layout normalization
- Path: `subjects/math/data/theory_normalization/theory_normalization_c01_l04.json`
- Version: `NORMALIZATION_C01_L04_V1_APPROVED`
- Status: `approved_across_core_reference_slideshow_full_view`
- Quality gate: `formula_layout_normalization_approved`
- Manifest: `subjects/math/data/theory_normalization/theory_normalization_manifest.json`
- Manifest version: `NORMALIZATION_MANIFEST_V1_1`
- Canonical formulas: 12
- Canonical notation entries: 11
- Resolved display variants: 11
- Unit and quantity rules: 5
- Semantic conflicts: 0
- Source artifacts rewritten: 0
- Reader baseline: `E235_READER_PRO_FORMULA_STANDARD_R2`

## Runtime and presentation boundary
- `subjects/math/data/theory_lecture_content.json` remains unchanged.
- No HTML, CSS, JavaScript, runtime loader or Reader Pro file was changed.
- E235 remains unchanged and is referenced only as a semantic compatibility baseline.
- E236, E237 and E238 remain disabled.
- PASS 13 created a canonical normalization overlay and manifest only.

# PASSES 01–09 — CORE PHASE
Status: COMPLETE AND APPROVED.

Delivered:
- scope, academic map and pedagogical spine;
- 10 learning outcomes;
- 16 notation rules;
- 9 concepts and 9 mechanisms;
- 12 formula contracts and 12 assumption gates;
- mathematics and engineering reviews;
- verified UGV worked case;
- 20 misconceptions and 18 failure modes;
- assessment and implementation contract.

# PASS 10 — `THAM KHẢO THÊM`
Status: COMPLETE AND APPROVED.

Delivered compact concept, formula, comparison, method, assumption, failure, UGV and transfer reference layers.

# PASS 11 — SLIDESHOW
Status: COMPLETE AND APPROVED.

Delivered 22 slides, four arcs, 8 diagram specs, 9 retrieval checks and 16 misconception intercepts.

# PASS 12 — `XEM ĐẦY ĐỦ`
Status: COMPLETE AND APPROVED.

Delivered 11 reading sections, 12 formula mappings, 8 diagrams, 14 cautions and 9 retrieval anchors.

# C01-L04 PASS 13 — FORMULA AND LAYOUT NORMALIZATION

## Step 1 — Cross-layer formula and notation inventory

Inspected:
- core `notationRules` and `mainFormulas`;
- reference `notationLookup` and `formulaTable`;
- slideshow formula references and formula-bearing content blocks;
- full-view `formulaRegistry`, reading-flow formulas and Reader compatibility contract.

Audit result:
- semantic conflicts: 0;
- worked-case conflicts: 0;
- formula-ID conflicts: 0;
- notation-meaning conflicts: 0;
- display variants: 11.

The differences were lexical or display-level:
- spaces around operators;
- `such that` versus colon notation;
- `z_i=0 for all i` versus vector statement `z=0`;
- ASCII `<-` versus semantic target-source arrow;
- ordered family `B` versus column matrix `B_mat`;
- text `delta_ij` versus δ notation;
- dot-product spacing;
- residual norm versus squared norm wording;
- units and degree/time formatting;
- artifact-specific density.

No approved source needed rewriting.

## Step 2 — Canonical semantic notation and formula contract

Created:
`subjects/math/data/theory_normalization/theory_normalization_c01_l04.json`.

Canonical notation contains 11 semantic entries:
- target space;
- basis vector;
- ordered family;
- coefficient column;
- coordinate column;
- basis matrix;
- residual;
- standard basis;
- coordinate transform;
- Kronecker delta;
- Euclidean norm.

Each entry records:
- source aliases;
- canonical plain text;
- display LaTeX;
- semantic meaning.

Created one canonical entry for each F1–F12 with:
- stable formula ID;
- canonical text;
- display LaTeX;
- accepted source aliases;
- meaning;
- application condition.

Core meaning remains authoritative.

## Step 3 — Normalize arrows, indices, matrices, vectors, units and tolerance wording

Canonical decisions:
- display vectors in bold when renderer support exists;
- keep ordered family `B` distinct from its column matrix `B_mat` or bold matrix B;
- use vector zero in vector equations;
- use `∈`, `∃`, `⇔` and `⇒` for display mathematics;
- use `P_{target←source}` and never infer direction from prose;
- keep `[v]_B` intact as one semantic token;
- keep transpose on the complete coordinate tuple;
- use centered dot for inner product;
- distinguish residual norm from squared vector norm;
- do not invent a fixed tolerance without scale and source.

Unit rules:
- velocity: `m/s`, display equivalent `m s^{-1}`;
- angle: degrees with route heading and robot yaw kept distinct;
- time: `ms`, kept in metadata/prose rather than coordinate formulas;
- squared velocity norm: label as squared quantity;
- dimensionless directions: only when the physical model declares them dimensionless.

F9 policy:
- orthonormal shortcut remains F9;
- orthogonal non-unit quotient stays a method condition;
- no F13 was introduced.

UGV values remain unchanged:
- transform direction `W←R`;
- coordinate order `(parallel,left)`;
- residual norm `0`;
- norm squared `26`.

## Step 4 — Layout-density and block-integrity contract

Recorded E235 baseline:
`E235_READER_PRO_FORMULA_STANDARD_R2`.

Global semantic layout rules:
- one primary mathematical claim per formula block;
- meaning and conditions remain adjacent to their formula;
- warnings remain attached to the constrained formula/example;
- do not split coordinate tokens, matrix rows or transform subscripts across blocks;
- examples separate setup, calculation, result and interpretation;
- ordinary sections do not imitate slide numbering;
- repeat a formula only when the new block performs a new derivation or check.

Layer profiles:
- core: complete semantic contract;
- reference: one compact formula per row;
- slideshow: one learning beat and normally one main formula per slide;
- full view: continuous reading with three to six semantic blocks per ordinary section.

FV08 is the explicit worked-case exception and may use numbered steps.

No pixel, CSS, JavaScript or animation rule was introduced.

## Step 5 — Cross-layer verification

Verified:
- all four source versions match;
- F1–F12 are present exactly once in the canonical registry;
- 11 canonical notation keys are unique;
- 11 display variants have explicit resolutions;
- five unit rules are present;
- ordered family, matrix and coordinates remain distinct;
- transform direction is explicit;
- vector zero is not conflated with scalar zero;
- no new formula ID exists;
- no source artifact was rewritten;
- no Reader Pro or runtime file changed;
- quality gate is `formula_layout_normalization_approved`;
- next pass is `PASS_14_FINAL_INTEGRATION_ACCEPTANCE`.

## Normalization manifest

Created:
`subjects/math/data/theory_normalization/theory_normalization_manifest.json`.

Manifest registers:
- all four approved source versions;
- 12 canonical formulas;
- 11 notation entries;
- 11 display variants;
- 5 unit rules;
- zero semantic conflicts;
- zero source rewrites;
- E235 semantic baseline.

## PASS 13 verdict
PASS. FORMULA AND LAYOUT NORMALIZATION APPROVED AND REGISTERED.

No browser smoke test is claimed because PASS 13 changed presentation-independent JSON only.

## Files read
- `CODEX_STATE.md`
- `subjects/math/data/theory_core/theory_core_c01_l04.json`
- `subjects/math/data/theory_reference/theory_reference_c01_l04.json`
- `subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`
- `subjects/math/data/theory_full_view/theory_full_view_c01_l04.json`

## Files created
- `subjects/math/data/theory_normalization/theory_normalization_c01_l04.json`
- `subjects/math/data/theory_normalization/theory_normalization_manifest.json`

## Files updated
- `CODEX_STATE.md`

## Next task
PASS 14/14 — Final integration and acceptance, consisting of 7 steps:
1. verify the complete artifact graph and source precedence;
2. define one lesson integration record for core, reference, slideshow, full view and normalization;
3. validate IDs, versions, counts, traceability and UGV invariants;
4. inspect existing integration/loader conventions narrowly;
5. bind data only when a safe existing convention is confirmed, without redesigning Reader Pro;
6. perform appropriate static or browser verification if runtime binding occurs;
7. record final acceptance, unresolved limitations and handoff state.

PASS 14 must not redesign UI. E235 remains the visual baseline. E236, E237 and E238 remain disabled.

## Relevant commits
- C01-L04 core approval: `ba57f4c302200d30506cd586892dfb0deb170f51`
- C01-L04 reference table: `565e3b1bc04d47527c390e1e6c67784c46e30d72`
- C01-L04 slideshow verified: `982d7535f30d314361aaa541fb0bf8c9a8945bcb`
- C01-L04 full view: `ddc561ce4d98b7f02d24a00c6e4ac4fede97d382`
- C01-L04 normalization overlay: `6595960f5c893ad2e5372d6860cfb66aa4d678a1`
- C01-L04 normalization manifest: `96391421572ad0610588271148ff435dea992311`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
