# E132 · Theory UI + Slideshow Final Handoff

Status: final handoff for E132 Theory UI + Slideshow Standardization.

Target version:

`E132_THEORY_UI_SLIDESHOW`

E132 standardizes the dedicated Math Theory UI and adds a true slideshow/deck enhancer while preserving E129 Theory data/import ownership and E130 Program Frame routing.

## 1. Final decision

E132 is a visual/runtime enhancer.

It is not a data migration and not a replacement for E129.

E129 remains the Theory owner:

- loads Theory frame from `theory_lecture_frame`;
- loads/imports Theory content from `theory_lecture_content`;
- keeps `lessons` as legacy compatibility only.

E130 remains the Program Frame overlay:

- `block -> section -> program lecture anchor -> mapped chapters/content`;
- no import target change.

Canva remains a visual reference, not runtime source.

## 2. Files added by E132

Design contract and guidance:

- `subjects/math/THEORY_UI_SLIDESHOW_CONTRACT_E132.md`
- `subjects/math/E132_CANVA_THEORY_STYLE_GUIDE.md`
- `subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md`
- `subjects/math/E132_THEORY_UI_FINAL_HANDOFF.md`

Runtime assets:

- `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`
- `subjects/math/assets/theory_skin/theory-reader-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

Runtime load patch:

- `subjects/math/index.html`

State log:

- `CODEX_STATE.md`

## 3. Runtime load order

CSS load order should stay:

```html
<link rel="stylesheet" href="assets/theory_skin/theory-tab-E129.css?v=129">
<link rel="stylesheet" href="assets/theory_skin/theory-ui-tokens-E132.css?v=132">
<link rel="stylesheet" href="assets/theory_skin/theory-reader-E132.css?v=132">
<link rel="stylesheet" href="assets/theory_skin/theory-slideshow-E132.css?v=132">
<link rel="stylesheet" href="assets/program_frame/program-frame-E130.css?v=130">
```

Script load order should stay:

```html
<script src="assets/program_frame/program-frame-E130.js?v=130"></script>
<script src="assets/theory_skin/theory-tab-E129.js?v=129"></script>
<script src="assets/program_frame/program-view-E130.js?v=130"></script>
<script src="assets/theory_skin/theory-slideshow-E132.js?v=132"></script>
```

Reason:

- E132 tokens must load after E129 CSS.
- E132 reader/slideshow CSS must load after tokens.
- E132 JS must load after E129 exists.
- E130 Program View remains independent.

## 4. What E132 changes visually

Reader mode:

- stronger Theory reader surface;
- clearer header and metadata hierarchy;
- better cards for bridge/pure/applied layers;
- responsive slide preview grid;
- more visible `Trình chiếu` entry button;
- better formula/code card treatment.

Presentation mode:

- one active slide at a time;
- previous/next/exit controls;
- progress bar;
- keyboard navigation;
- semantic visual accents for formula/lab/warning/Q&A;
- Escape exits presentation mode.

## 5. Keyboard controls

When in presentation mode:

- `ArrowRight` / `PageDown`: next slide;
- `ArrowLeft` / `PageUp`: previous slide;
- `Escape`: exit presentation mode.

## 6. Self-check commands

After pulling and opening Live Server at `subjects/math/index.html`, use browser console:

```js
BAUMAN_MATH_THEORY_E132.selfCheck()
BAUMAN_MATH_THEORY_E129.selfCheck()
BAUMAN_MATH_E130_PROGRAM_FRAME.selfCheck()
BAUMAN_MATH_E130_PROGRAM_VIEW.selfCheck()
BAUMAN_MATH_E126_SELF_CHECK()
```

Expected E132 shape:

```js
{
  ok: true,
  release: "E132_THEORY_UI_SLIDESHOW",
  e129Detected: true,
  importTargetUnchanged: "theory_lecture_content",
  tokensCssLoaded: true,
  readerCssLoaded: true,
  slideshowCssLoaded: true,
  slideshowEnhancer: true,
  canvaReference: true,
  canvaRuntimeMapping: "subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md",
  keyboard: true,
  escapeToExit: true
}
```

Expected E129 critical fields:

```js
{
  importerTarget: "theory_lecture_content",
  legacyImporterSuppressedOnTheoryStorage: true,
  renderReplacement: true
}
```

Expected E130 Program View critical field:

```js
{
  importTargetUnchanged: "theory_lecture_content",
  e129SelectionSync: "e129ChapterId/e129Stage"
}
```

Expected E126 behavior:

```js
{
  ok: true,
  compatibility: true,
  suppressedBy: "E129"
}
```

## 7. Manual smoke test

1. Pull origin.
2. Open `subjects/math/index.html` with Live Server.
3. Open tab Lý thuyết.
4. Confirm reader mode looks polished and remains scrollable/searchable.
5. Confirm `Kho Lý thuyết` opens.
6. Confirm importer text still targets `theory_lecture_content`.
7. Open `Khung bài giảng E130`.
8. Click a chapter pill such as C01/C19 and confirm it returns to Bauman route.
9. Import or paste the C01 sample bundle only if doing content test.
10. Open a lesson with slides.
11. Click `Trình chiếu`.
12. Confirm one slide is active.
13. Use Next/Previous buttons.
14. Use Arrow keys.
15. Press Escape and confirm the reader returns.

## 8. Rollback

If E132 causes visual/runtime issues, remove only these lines from `subjects/math/index.html`:

```html
<link rel="stylesheet" href="assets/theory_skin/theory-ui-tokens-E132.css?v=132">
<link rel="stylesheet" href="assets/theory_skin/theory-reader-E132.css?v=132">
<link rel="stylesheet" href="assets/theory_skin/theory-slideshow-E132.css?v=132">
<script src="assets/theory_skin/theory-slideshow-E132.js?v=132"></script>
```

Do not delete E132 files immediately. Keep them for inspection unless a dedicated cleanup round decides otherwise.

Rollback should restore E129/E130 behavior because E132 is only an enhancer layer.

## 9. Canva boundary

Canva can provide:

- moodboard;
- reference deck;
- screenshots/mockups;
- layout examples;
- visual critique.

Canva must not become:

- DataVault;
- source of lesson content;
- source of JSON records;
- source of `chapterId`, `lessonId`, or `programLectureId`;
- source of runtime JS/CSS.

The mapping file is:

- `subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md`

## 10. Next production path

Recommended after E132:

1. Pull and test runtime.
2. Import the C01 E130 sample bundle through E129 Kho Lý thuyết.
3. Review the slide reader and slideshow rendering.
4. If content is too dense, improve content records, not the UI shell first.
5. Commit approved content into `data/theory_lecture_content.json` only after explicit approval.
6. Expand by chapter/program anchor.
7. Later run E133 only if browser screenshots reveal real UI bugs.

## 11. What not to do next

Do not:

- add another UI layer before browser testing;
- rewrite `theory-tab-E129.js` casually;
- rewrite `subject-manifest.json` during E132;
- store slide content in CSS/JS;
- turn Canva into a runtime dependency;
- import new Theory content into `lessons.json`;
- rename existing chapter IDs.

End of E132 final handoff.
