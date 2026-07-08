# CODEX_STATE

Current task: `THEORY_DATA_PATH_SYNCHRONIZATION_C01_L04_PASS_17`

Status: `PASS_17_DATA_PATH_SYNC_STATIC_VERIFY_PASS`

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
- Runtime completion workflow: 3/6 passes complete.
- Runtime steps complete: 16/34.
- Runtime steps remaining: 18/34.
- Source slideshow slides: 22.
- Runtime slides: 22.
- Minimum slide count: 16.
- Maximum slide count: none.
- Slide compression: prohibited for the accepted §1.4 package.

## Pass 15 result

### Minimum slide contract
Created:
- `subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js`
- `subjects/math/THEORY_SLIDE_COUNT_CONTRACT_E239.md`

Release:
`E239_MINIMUM_16_SLIDES_NOT_MAXIMUM`

Verified:
- 15 slides is below minimum;
- 16 slides is valid;
- 22 slides is valid;
- no maximum slide count;
- extended semantic roles are allowed;
- no slide compression is permitted merely to silence a warning.

Pass 15 status:
`PASS_15_MINIMUM_16_SLIDES_PATCHED_STATIC_VERIFY_PASS`

## Pass 16 result

### Durable content merge
Target:
`subjects/math/data/theory_lecture_content.json`

Import source:
`subjects/math/data/theory_integration/theory_lecture_content_c01_l04_import.json`

Target lessonId:
`MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`

Verification:
- File SHA-256 before: `81d807aa17e770ffc4481b447583ce98c31510afa8eb41ea725be35419ee655f`
- File SHA-256 after: `dc5462df37227b49ab1759f8631f0dc682816cb59733ef2193688366d23dfb1e`
- Record count before/after: `18/18`
- Target occurrence before/after: `1/1`
- Target index: `3`
- Previous lessonId: `MATH-VN-C01-vector_trong_khong_gian_-L03-dot-angle-projection-e139`
- Next lessonId: `MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`
- Previous record hash unchanged: `true`
- Next record hash unchanged: `true`
- All other record hashes unchanged: `true`
- Runtime slides: `22`
- Source slide mapping: `22/22`
- Formula trace: `F1-F12 complete`
- Duplicate lesson IDs: `0`
- JSON validation: `pass`
- Security scan: `pass`
- UGV invariants: `pass`
- Browser smoke test: `not run`

Pass 16 status:
`PASS_16_DURABLE_MERGE_STATIC_VERIFY_PASS`

Durable merge commit:
`1a1c881cde58d181430678f42d6ffabe3660d543`

## Pass 17 result

### Data-path inspection
Verified:
- E129 reads `theory_lecture_content` and applies E129 overlay to `window.DB.theory_lecture_content`.
- E202 C01 fallback derives slides from the currently rendered E129 DOM and observes DOM mutations.
- E211 originally fetched and cached `data/theory_lecture_content.json` independently.
- Without synchronization, a same-page E129 import could leave E211 on a stale record while E129 used the overlay.

### Shared content source bridge
Created:
`subjects/math/assets/theory_skin/theory-content-source-E240.js`

Release:
`E240_SHARED_THEORY_CONTENT_SOURCE_BRIDGE`

Priority:
1. `window.DB.theory_lecture_content`
2. E129 localStorage overlay
3. durable `data/theory_lecture_content.json`

Behavior:
- Intercepts only requests whose path is exactly `/data/theory_lecture_content.json`.
- Returns the runtime DB payload when available.
- Falls back to the saved E129 overlay when DB has not been initialized yet.
- Uses the durable JSON request unchanged when no runtime payload exists.
- Wraps the public E129 `commitContent` and `clearContentOverlay` methods.
- After a successful same-tab import or overlay clear, dispatches `bauman:theory-content-updated` and performs a controlled reload.
- The reload guarantees E129, E202 and E211 reconstruct from the same payload.
- No academic record, Reader Pro layout, formula renderer or slideshow UI was redesigned.

### Runtime load order
Updated:
`subjects/math/index.html`

Load order:
1. E129
2. E239
3. E240
4. learning path and slideshow/Reader extensions

E240 therefore establishes the shared source before E211 performs its direct content fetch.

### Static verification
Verified:
- E240 exists and exposes `BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE`.
- DB payload requires a valid object with `records[]`.
- localStorage overlay is parsed defensively.
- durable JSON remains the fallback.
- the bridge matches only `data/theory_lecture_content.json`.
- E129 public API is wrapped once only.
- import and clear operations synchronize through reload.
- E202 source behavior remains unchanged.
- E211 code remains unchanged, but its existing fetch now receives the shared payload.
- existing lessons continue to use the durable source when no overlay is active.
- E234 and E235 are unchanged.
- E236, E237 and E238 remain disabled.

Pass 17 status:
`PASS_17_DATA_PATH_SYNC_STATIC_VERIFY_PASS`

Browser verification:
`not run`

## Files created in Pass 17
- `subjects/math/assets/theory_skin/theory-content-source-E240.js`

## Files updated in Pass 17
- `subjects/math/index.html`
- `CODEX_STATE.md`

## Pass 17 commits
- Shared source bridge: `a22ce86f7063abed4bb7ba47316433a0a209f5b1`
- Load E240 in Math index: `575c8d843e6b078b3ee1dcc86094d1798f860dc1`

## Important limitation
Pass 17 uses a controlled page reload after a same-tab import or overlay clear. This is deliberate: E211 maintains private in-memory indexes that cannot be safely replaced through its current public API. The reload is the narrowest reliable synchronization boundary without rewriting Reader Pro in this pass.

Browser QA in Pass 20 must verify:
- durable source with no overlay;
- E129 import followed by synchronized reload;
- E129, E202 and E211 all show the same 22-slide §1.4 record;
- clearing the overlay restores the durable source;
- no reload loop occurs.

## Next task
PASS 18/20 — Runtime integration of approved Reference and Full View artifacts, 6 steps:
1. inspect the current Reader Pro controls and manifest registration narrowly;
2. register reference/full-view/normalization sources without making them globally required for unrelated lessons;
3. bind `Tham khảo thêm` to the approved reference artifact for §1.4;
4. bind `Xem đầy đủ` to the approved 11-section full-view artifact;
5. keep the formula-detail popup as a separate control and preserve E234/E235;
6. run static regression checks and update state without claiming browser acceptance.
