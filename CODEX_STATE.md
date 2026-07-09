# CODEX_STATE

Current task: `THEORY_BROWSER_QA_FINAL_ACCEPTANCE_C01_L04_PASS_20`

Status: `PASS_20_BROWSER_QA_FINAL_ACCEPTANCE_PASS`

Date: 2026-07-09
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it adds material value, such as a deep multi-file refactor, repository-wide dependency analysis, complex browser automation unavailable through current tools, or a large transformation that cannot be performed safely through the connector.
- If Codex is required, create a new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.

## §1.4 final status
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
- Lesson title: `§1.4 · Cơ sở, span và tọa độ`
- Academic workflow: `14/14 passes`, `73/73 steps` complete.
- Runtime completion workflow: `6/6 passes` complete.
- Runtime steps: `34/34` complete.
- Runtime steps remaining: `0/34`.
- Source slideshow slides: `22`.
- Durable runtime slides: `22`.
- Minimum slide count: `16`.
- Maximum slide count: none.
- Accepted §1.4 slide compression: prohibited.
- Browser acceptance: `PASS`.

## Pass 15 result
Status:
`PASS_15_MINIMUM_16_SLIDES_PATCHED_STATIC_VERIFY_PASS`

Created:
- `subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js`
- `subjects/math/THEORY_SLIDE_COUNT_CONTRACT_E239.md`

Verified:
- 15 slides fails the minimum requirement;
- 16 slides passes;
- 22 slides passes;
- no maximum is imposed;
- the obsolete exact-count warning is removed for valid decks with 16 or more slides.

## Pass 16 result
Status:
`PASS_16_DURABLE_MERGE_STATIC_VERIFY_PASS`

Durable target:
`subjects/math/data/theory_lecture_content.json`

Verified:
- records before/after: `18/18`;
- target occurrence before/after: `1/1`;
- target index: `3`;
- source/runtime slide mapping: `22/22`;
- duplicate lesson IDs: `0`;
- formulas F1–F12 present;
- UGV invariants preserved;
- JSON and security checks passed.

Durable merge commit:
`1a1c881cde58d181430678f42d6ffabe3660d543`

## Pass 17 result
Status:
`PASS_17_DATA_PATH_SYNC_STATIC_VERIFY_PASS`

Created:
`subjects/math/assets/theory_skin/theory-content-source-E240.js`

Source priority:
1. `window.DB.theory_lecture_content`
2. E129 localStorage overlay
3. durable `data/theory_lecture_content.json`

Verified:
- E129, E202 and E211 reconstruct from one payload after import/clear;
- same-tab import and clear use a controlled single reload;
- durable fallback remains available.

## Pass 18 result
Status:
`PASS_18_REFERENCE_FULL_VIEW_STATIC_VERIFY_PASS`

Created:
`subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`

Runtime controls for §1.4:
- `Tham khảo thêm`: approved Reference artifact with R01–R07;
- `Xem đầy đủ`: approved Full View with FV01–FV11;
- `Công thức đầy đủ`: existing E211 formula modal, kept separate.

Verified:
- Reference, Full View and Normalization sources are optional and lesson-scoped;
- unrelated lessons do not require the files;
- formulas use approved canonical aliases where available;
- E234 and E235 remain unchanged.

## Pass 19 result
Status:
`PASS_19_SLIDESHOW_RICHNESS_STATIC_VERIFY_PASS`

Created:
`subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`

Approved runtime mapping:
- diagrams: `8`;
- retrieval checks: `9`;
- misconception intercepts: `16`;
- runtime slide count remains `22`;
- each runtime index maps to source SL01–SL22.

Density policy:
- diagram replaces the existing visual panel;
- misconception replaces the existing Application/Meaning card;
- retrieval replaces the existing Self-check card;
- the fixed three-card layout is preserved.

Final E242 navigation cleanup commit:
`bc85232cb912b4dc6fc1d73d4cd1c0f980191352`

## Pass 20 browser acceptance
Status:
`PASS_20_BROWSER_QA_FINAL_ACCEPTANCE_PASS`

Browser environment:
- Chromium through Playwright;
- full checked-out repository served as a static site;
- viewport: `1440 × 900`;
- final accepted execution: `2026-07-09T02:27:25.539Z`.

Accepted browser report commit:
`918daa85f0bf2af28f798dd5a669dea8f23ee460`

### Browser checks passed
- Runtime APIs loaded.
- E129 sources loaded with frame `112`, content `18`, legacy `347`.
- Minimum slide contract passed for 15/16/22 cases.
- Durable source contains exactly one target record with 22 slides.
- E129 Reader renders the correct target lesson with 22 source slides.
- Slideshow opens in Reader Pro at `01 / 22` and remains locked to §1.4.
- All 22 slides were traversed using both buttons and keyboard.
- Every slide retained exactly three cards.
- Diagram positions matched all 8 approved source positions.
- Retrieval positions matched all 9 approved source positions.
- Misconception positions matched all 16 approved source positions.
- Retrieval evidence remained collapsed by default.
- Reference and Full View controls appeared exactly once.
- Formula control appeared exactly once on a formula-bearing slide.
- Reference rendered R01–R07.
- Escape closed Reference while keeping the deck open.
- Full View rendered exactly 11 sections.
- Formula modal remained separate and closed with Escape.
- Another C01 lesson showed no §1.4 Reference, Full View or richness leakage.
- Overlay import retained 22 slides and produced no obsolete exact-16 warning.
- Overlay import caused exactly one controlled reload.
- Clearing overlay restored the durable source and caused exactly one controlled reload.
- Uncaught page errors: `0`.
- Console errors: `0`.
- Failed network requests: `0`.

## Browser-only defects found and fixed

### 1. Empty lesson match leakage
E241 and E242 could treat an empty normalized string as matching the §1.4 title.

Fixed by requiring a non-empty normalized value before matching.

### 2. Stale Reference panel
The approved Reference summary could remain after switching away from §1.4.

Fixed by removing the lesson-scoped panel outside the target lesson.

### 3. Escape event conflict
E202 could capture Escape before the E241 modal closed.

Fixed by moving the artifact-modal Escape guard to early window capture and stopping propagation only while that modal is open.

### 4. Presenter selection and routing drift
Opening the slideshow could cause the host router to fall back from §1.4 to §1.1, and decimal values in C01 content could resemble C02 lesson aliases.

Created:
`subjects/math/assets/theory_skin/theory-presenter-route-lock-E243.js`

Release:
`E243_PRESENTER_ROUTE_LOCK_R2`

Behavior:
- registers before host/core scripts;
- locks the visible E129 lesson ID before presentation opens;
- gives E202 a temporary sanitized routing clone;
- removes the clone immediately after deck construction;
- stabilizes the selected lesson at 0, 120 and 720 ms;
- does not create a new renderer.

Final E243 browser diagnostic verified:
- count: `01 / 22 · 3 cards`;
- mode: `Reader Pro`;
- current lesson: §1.4 target ID;
- source slides: `22`;
- E211 record: §1.4;
- E242 counts: `22/8/9/16`;
- routing ghost remaining: `0`;
- page errors: `0`;
- console errors: `0`.

Key commits:
- Create E243: `0a48039444f235a3b294af0e01e065e7b56c1e46`
- Load E243 before host/core: `060179f17988addccac8c0905a715266b93d9f5a`
- Stabilize selected lesson: `885ead47eeccdb1676d32632571ab0ae2ea94dec`
- Accepted deck diagnostic: `8bed85a8a17f5d8b3747129d9658d247be18f8cf`

### 5. Stale E242 richness marker
One E242 marker could survive when navigating from §1.4 to another lesson.

Fixed by clearing lesson-scoped attributes, classes and retrieval details outside the target lesson, then allowing E211 to rebuild the normal cards.

Commit:
`bc85232cb912b4dc6fc1d73d4cd1c0f980191352`

## Manifest correction
`subjects/math/subject-manifest.json` previously reported `theory_lecture_content: 347`, while the durable runtime file contains 18 records. The 347 count belongs to the legacy lesson source.

Corrected:
- `data.theory_lecture_content`: `18`;
- external `theory_lecture_content.plannedCount`: `18`;
- manifest updated date: `2026-07-09`.

Commit:
`f22f1bd6695e8ffefc8d5b4a3e7f48bf551bd831`

## Protected runtime constraints
- E235 visual/semantic baseline remains unchanged.
- E236, E237 and E238 remain disabled.
- No academic artifact was rewritten during runtime QA.
- No accepted slide was removed, merged or compressed.
- E243 is a route-lock compatibility bridge, not a slideshow engine.
- Codex was not used in Pass 20 because direct high-reasoning inspection, GitHub patches and real Chromium QA were sufficient.

## Final acceptance
§1.4 is accepted as:

`ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`

No pending step remains in the §1.4 workflow.

## Next recommended unit of work
Apply the same artifact pipeline and browser acceptance discipline to the next lesson as a new, isolated task. Do not reopen or continue old Codex sessions.
