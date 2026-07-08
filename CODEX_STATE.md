# CODEX_STATE

Current task: `THEORY_REFERENCE_FULL_VIEW_RUNTIME_INTEGRATION_C01_L04_PASS_18`

Status: `PASS_18_REFERENCE_FULL_VIEW_STATIC_VERIFY_PASS`

Date: 2026-07-08
Branch: `main`

## Codex session rule
- Prefer direct ChatGPT-to-GitHub work when repository tools are available.
- If Codex is required, create a new Codex session for one narrow task.
- Never continue an old Codex session.
- A new Codex session must read this file and only explicitly named source files.
- Do not scan the full repository.

## §1.4 overall status
- Academic workflow: 14/14 passes, 73/73 steps complete.
- Runtime completion workflow: 4/6 passes complete.
- Runtime steps complete: 22/34.
- Runtime steps remaining: 12/34.
- Source slideshow slides: 22.
- Runtime slides: 22.
- Minimum slide count: 16.
- Maximum slide count: none.
- Slide compression: prohibited for the accepted §1.4 package.

## Pass 15 result
- Status: `PASS_15_MINIMUM_16_SLIDES_PATCHED_STATIC_VERIFY_PASS`
- E239 defines 16 as the minimum, not an exact count or maximum.
- 15 slides fails the minimum check; 16 and 22 pass.
- Extended semantic roles are allowed.

## Pass 16 result
- Status: `PASS_16_DURABLE_MERGE_STATIC_VERIFY_PASS`
- Durable target: `subjects/math/data/theory_lecture_content.json`
- Target lessonId: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Record count before/after: `18/18`
- Target occurrence before/after: `1/1`
- Target index: `3`
- Runtime slides: `22`
- Source mapping: `22/22`
- Duplicate lesson IDs: `0`
- JSON/security/UGV checks: `pass`
- Commit: `1a1c881cde58d181430678f42d6ffabe3660d543`

## Pass 17 result
- Status: `PASS_17_DATA_PATH_SYNC_STATIC_VERIFY_PASS`
- Created: `subjects/math/assets/theory_skin/theory-content-source-E240.js`
- Source priority:
  1. `window.DB.theory_lecture_content`
  2. E129 localStorage overlay
  3. durable `data/theory_lecture_content.json`
- E240 loads before E211.
- Same-tab import/clear uses a controlled reload so E129, E202 and E211 reconstruct from one payload.
- Browser verification remains deferred to Pass 20.

## Pass 18 objective
Integrate the approved lesson-scoped artifacts into runtime controls without redesigning Reader Pro:
- `Tham khảo thêm` must use the approved Reference artifact;
- `Xem đầy đủ` must use the approved Full View artifact;
- canonical formula display must use the approved Normalization artifact;
- the existing formula-detail popup must remain a separate control;
- unrelated lessons must not require these optional files.

## Pass 18 inspection

### Approved Reference artifact
Path:
`subjects/math/data/theory_reference/theory_reference_c01_l04.json`

Version:
`REFERENCE_C01_L04_V1_APPROVED`

Verified reference information architecture:
1. R01 concept map
2. R02 formula table
3. R03 representation-family classification
4. R04 method selection
5. R05 engineering assumption gates
6. R06 failure diagnosis guide
7. R07 verified UGV case

Additional approved sections rendered:
- notation lookup;
- engineering transfer table.

### Approved Full View artifact
Path:
`subjects/math/data/theory_full_view/theory_full_view_c01_l04.json`

Version:
`FULL_VIEW_C01_L04_V1_APPROVED`

Verified:
- `readingFlow` has 11 sections, FV01–FV11;
- content is presentation data only;
- no runtime instructions are embedded in the artifact;
- formulas include meaning, conditions and warnings where required.

### Approved Normalization artifact
Path:
`subjects/math/data/theory_normalization/theory_normalization_c01_l04.json`

Version:
`NORMALIZATION_C01_L04_V1_APPROVED`

Verified:
- semantic conflicts: `0`;
- worked-case conflicts: `0`;
- canonical formula registry: `F1–F12`;
- source rewrites are not required;
- canonical rendering can be applied downstream.

## Pass 18 implementation

### Artifact reader
Created:
`subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`

Release:
`E241_APPROVED_REFERENCE_FULL_VIEW_READER`

Registry:
- Reference: `data/theory_reference/theory_reference_c01_l04.json`
- Full View: `data/theory_full_view/theory_full_view_c01_l04.json`
- Normalization: `data/theory_normalization/theory_normalization_c01_l04.json`

All three sources are registered at runtime in `SUBJECT_ADAPTER.dataSourceMeta` as:
- `required: false`
- `lazy: true`
- scoped to the exact §1.4 lessonId

The global `subject-manifest.json` was deliberately not changed because these artifacts are optional and lesson-scoped, not required sources for unrelated lessons.

### Runtime controls
For the exact §1.4 lesson only, E241 adds:
- `Tham khảo thêm`
- `Xem đầy đủ`

The old E211 formula button is relabeled:
- old label: `Xem đầy đủ`
- new label: `Công thức đầy đủ`

This keeps three distinct functions:
1. `Tham khảo thêm`: approved seven-section lookup layer.
2. `Xem đầy đủ`: approved eleven-section complete reading flow.
3. `Công thức đầy đủ`: existing E211 formula analysis popup.

### Reference behavior
`Tham khảo thêm` now renders actual approved artifact data:
- R01 concept entries;
- R02 formulas with answers, conditions and warnings;
- R03 family comparison;
- R04 method decision table;
- R05 assumption checklist;
- R06 failure/symptom/diagnosis/repair table;
- R07 UGV world-route snapshot with reconstruction, residual and norm checks;
- notation lookup;
- engineering-transfer guidance.

The old synthetic E211 summary panel is replaced for §1.4 by the approved Reference thesis and an action opening the complete lookup modal.

### Full View behavior
`Xem đầy đủ` renders every item in `readingFlow` in source order.

Supported semantic blocks include:
- lead;
- definition;
- formula;
- comparison;
- derivation;
- example;
- condition;
- warning;
- check;
- generic list/summary blocks.

The modal reports the actual section count from the artifact.

### Normalization behavior
E241 loads the approved normalization artifact together with Reference and Full View.

Formula strings matching a registered alias are rendered using `canonicalText` from the F1–F12 registry.

No source artifact is rewritten.

### Runtime load order
Updated:
`subjects/math/index.html`

E241 loads immediately after E211, before E224/E234/E235, so:
- it can distinguish and relabel the E211 formula button;
- existing formula accuracy and typesetting layers remain available;
- it does not replace Reader Pro or the formula renderer.

## Pass 18 static verification
Verified:
- exact lessonId and approved versions are checked before artifact use;
- all three artifact fetches are lazy and cached;
- missing or mismatched artifacts show an explicit error modal;
- controls are removed or not created for unrelated lessons;
- Reference exposes seven approved lookup sections;
- Full View uses all 11 `readingFlow` sections;
- Normalization exposes F1–F12 canonical formulas;
- formula popup remains separate;
- E211 source file is unchanged;
- E234 and E235 are unchanged;
- E236, E237 and E238 remain disabled;
- no academic artifact was modified;
- no global required data source was added.

Browser verification:
`not run`

Pass 18 status:
`PASS_18_REFERENCE_FULL_VIEW_STATIC_VERIFY_PASS`

## Files created in Pass 18
- `subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`

## Files updated in Pass 18
- `subjects/math/index.html`
- `CODEX_STATE.md`

## Pass 18 commits
- Initial artifact reader: `6526b6430f8b3ed30b207a479224276f8538aeda`
- Load E241 in Math index: `8012e6c9a190635bdab4312b14aafd2ac357e04b`
- Expand Reference to all approved sections: `bcaede45a9c69e6a53d656d83b2619de5b9164c8`

## Browser QA required in Pass 20
- controls appear only on §1.4;
- `Tham khảo thêm` opens all seven lookup sections;
- `Xem đầy đủ` opens FV01–FV11 in order;
- `Công thức đầy đủ` still opens the existing E211 formula modal;
- Escape, close button, backdrop and scrolling work;
- formulas remain compatible with E234/E235;
- no duplicate controls appear after slide navigation;
- other lessons retain their previous behavior.

## Next task
PASS 19/20 — Restore full approved slideshow richness, 6 steps:
1. inspect the approved slideshow diagram, retrieval and misconception structures;
2. define safe runtime block mappings without changing mathematics;
3. expose the 8 diagram specifications at their mapped slides;
4. expose the 9 retrieval checks at their mapped slides;
5. expose the 16 misconception intercepts at their mapped slides;
6. run static navigation/density regression checks and update state without claiming browser acceptance.
