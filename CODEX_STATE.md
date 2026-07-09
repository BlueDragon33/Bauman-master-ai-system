# CODEX_STATE

Current task: `THEORY_SLIDESHOW_RICHNESS_RUNTIME_INTEGRATION_C01_L04_PASS_19`

Status: `PASS_19_SLIDESHOW_RICHNESS_STATIC_VERIFY_PASS`

Date: 2026-07-09
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only for work where it adds material value, such as deep multi-file refactors, repository-wide dependency analysis, complex browser automation or large-file transformations that cannot be safely performed through the available connector.
- If Codex is required, create a new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.

## §1.4 overall status
- Academic workflow: 14/14 passes, 73/73 steps complete.
- Runtime completion workflow: 5/6 passes complete.
- Runtime steps complete: 28/34.
- Runtime steps remaining: 6/34.
- Source slideshow slides: 22.
- Runtime slides: 22.
- Minimum slide count: 16.
- Maximum slide count: none.
- Slide compression: prohibited for the accepted §1.4 package.

## Pass 15 result
- Status: `PASS_15_MINIMUM_16_SLIDES_PATCHED_STATIC_VERIFY_PASS`
- E239 defines 16 as the minimum, not an exact count or maximum.
- 15 slides fails the minimum check; 16 and 22 pass.

## Pass 16 result
- Status: `PASS_16_DURABLE_MERGE_STATIC_VERIFY_PASS`
- Durable target: `subjects/math/data/theory_lecture_content.json`
- Target lessonId: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Record count before/after: `18/18`
- Target occurrence before/after: `1/1`
- Runtime slides: `22`
- Source mapping: `22/22`
- Duplicate lesson IDs: `0`
- JSON/security/UGV checks: `pass`
- Commit: `1a1c881cde58d181430678f42d6ffabe3660d543`

## Pass 17 result
- Status: `PASS_17_DATA_PATH_SYNC_STATIC_VERIFY_PASS`
- E240 source priority:
  1. `window.DB.theory_lecture_content`
  2. E129 localStorage overlay
  3. durable `data/theory_lecture_content.json`
- Same-tab import/clear uses controlled reload for E129/E202/E211 consistency.

## Pass 18 result
- Status: `PASS_18_REFERENCE_FULL_VIEW_STATIC_VERIFY_PASS`
- E241 integrates approved Reference, Full View and Normalization artifacts for §1.4 only.
- `Tham khảo thêm`: seven approved lookup sections.
- `Xem đầy đủ`: FV01–FV11.
- `Công thức đầy đủ`: existing E211 formula modal remains separate.

## Pass 19 objective
Restore the approved slideshow richness into the existing 22-slide runtime deck without changing mathematics, slide count or the E202/E211 visual architecture:
- expose all 8 approved diagram specifications;
- expose all 9 approved retrieval checks;
- expose all 16 approved misconception intercepts;
- keep one source slide mapped to one runtime slide;
- avoid adding extra panels that would overload the fixed slide viewport.

## Pass 19 inspection

Approved source:
`subjects/math/data/theory_slideshow/theory_slideshow_c01_l04.json`

Version:
`SLIDESHOW_C01_L04_V1_APPROVED`

Verified source contract:
- presentation data only;
- runtime independent;
- no CSS or JavaScript embedded in the artifact;
- one primary learning beat per slide;
- diagrams are semantic specifications only;
- no new mathematics;
- source trace required.

Verified counts:
- slides: `22`;
- diagram specifications: `8`;
- retrieval checks: `9`;
- misconception intercepts: `16`.

### Diagram mapping
- SL01: same vector in two coordinate grids
- SL02: linear-combination contributions
- SL03: one-direction span versus two-direction span
- SL04: redundant third vector in an existing span
- SL06: ordered-basis swap
- SL14: UGV world/route basis setup
- SL17: left/right normal sign convention
- SL20: near-parallel basis sensitivity

### Retrieval mapping
- SL02: RCHECK01
- SL03: RCHECK02
- SL05: RCHECK03
- SL10: RCHECK04
- SL11: RCHECK05
- SL17: RCHECK06
- SL19: RCHECK07
- SL20: RCHECK08
- SL22: RCHECK09

### Misconception mapping
- SL01, SL03, SL04, SL05, SL06, SL07, SL08, SL11
- SL12, SL13, SL14, SL17, SL18, SL19, SL20, SL21

## Pass 19 implementation

Created:
`subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`

Release:
`E242_APPROVED_SLIDESHOW_RICHNESS`

### Data validation
E242 rejects the artifact unless all conditions pass:
- lessonId exactly matches §1.4;
- version exactly matches `SLIDESHOW_C01_L04_V1_APPROVED`;
- slide count is 22;
- diagram count is 8;
- retrieval-check count is 9;
- misconception count is 16;
- source slide IDs remain ordered exactly SL01–SL22.

The source is registered in `SUBJECT_ADAPTER.dataSourceMeta` as:
- optional;
- lazy;
- lesson-scoped;
- not a global required dependency.

### Density-preserving runtime mapping
No new fourth or fifth card is added to E202.

For each visible slide:
- `diagramSpec`, when present, replaces the existing generic visual panel;
- `misconceptionIntercept`, when present, replaces the existing Application/Meaning card;
- `retrievalCheck`, when present, replaces the existing Self-check card;
- absent features leave the corresponding E202 card or visual untouched.

This preserves the current fixed slide layout and avoids content overflow caused by stacking extra panels.

### Semantic diagram behavior
E242 does not invent geometric drawings.

It renders only approved source fields:
- diagram type;
- purpose;
- entities/labels as a semantic flow;
- mathematical constraints.

No pixels, animation instructions or unsupported geometric claims are taken from the artifact.

### Misconception behavior
The misconception card shows:
- the approved wrong belief as the headline;
- the approved correction as the body.

Wrong beliefs and corrections are visually distinguished without rewriting their content.

### Retrieval behavior
The retrieval card shows:
- approved check ID;
- approved prompt;
- misconception target;
- collapsible expected evidence.

Expected evidence is hidden by default so retrieval remains an active recall step rather than an answer dump.

### Runtime synchronization
E242 reads the visible E202 counter to map runtime index 1–22 to source SL01–SL22.

It observes deck rerenders and reapplies only when the visible slide changes or E202/E211 rebuilds the slide DOM.

The bridge is lesson-scoped and requires the exact §1.4 lesson identity/title context before modifying the deck.

## Runtime load order
Updated:
`subjects/math/index.html`

Relevant order:
1. E202 renderer
2. E210 identity
3. E211 Reader Pro content
4. E241 Reference/Full View
5. E242 slideshow richness
6. E224 formula accuracy
7. E234 typesetting
8. E235 fraction alignment
9. E212 fit

E242 therefore works on the stable Reader Pro DOM while leaving formula-specific layers available afterward.

## Pass 19 static verification
Verified:
- E242 source path and version are exact;
- count validation covers 22/8/9/16;
- SL01–SL22 order is explicitly validated;
- diagrams use only artifact labels/entities/constraints;
- retrieval expected evidence is collapsed by default;
- misconception text comes directly from the approved artifact;
- no slide is added, removed, merged or reordered;
- E202 source file is unchanged;
- E211 source file is unchanged;
- E234 and E235 are unchanged;
- E236, E237 and E238 remain disabled;
- no academic artifact was modified;
- no global required source was added;
- Codex was not used because the task was a narrow, controlled runtime bridge.

Browser verification:
`not run`

Pass 19 status:
`PASS_19_SLIDESHOW_RICHNESS_STATIC_VERIFY_PASS`

## Files created in Pass 19
- `subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`

## Files updated in Pass 19
- `subjects/math/index.html`
- `CODEX_STATE.md`

## Pass 19 commits
- Create E242 richness bridge: `039e802077d64d54c1fa11c1ecc3d1e70f96888a`
- Load E242 in Math index: `a6f2434a95322d75e0019f514c0f99a645c319b4`

## Final browser QA required in Pass 20
1. validate JSON and runtime source availability;
2. open §1.4 and navigate all 22 slides with buttons and keyboard;
3. verify the 8 diagram slides, 9 retrieval slides and 16 misconception slides at their exact positions;
4. verify Reference, Full View and Formula controls independently;
5. verify overlay import, controlled reload, durable fallback, clear-overlay behavior and other-lesson regression;
6. correct any browser-only defect, remove temporary test scaffolding, update manifest/state and issue final acceptance only for checks actually run.

## Next task
PASS 20/20 — Browser QA and final runtime acceptance, 6 steps.

Codex decision for Pass 20:
- start with direct high-reasoning inspection and available repository/browser tooling;
- use Codex only if a real browser automation or multi-file defect requires capabilities not safely available through the current connector;
- do not call Codex merely to repeat static checks already completed.
