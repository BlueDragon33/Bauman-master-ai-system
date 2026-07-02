# E136 · Math Runtime Stabilization

Status: applied after the Math module previously entered a continuous loading loop and became unresponsive.

## Goal

Make opening the Math subject stable before doing any further UI work.

## Boot runtime now loaded by `subjects/math/index.html`

Scripts currently loaded:

- `assets/subject-adapter.js?v=123`
- `assets/program_frame/program-frame-E130.js?v=130`
- `assets/theory_skin/theory-tab-E129.js?v=129`
- `assets/theory_skin/theory-slideshow-E132.js?v=136`
- `assets/core.js?v=123`
- `assets/theory_skin/theory-main-adapter-E126.js?v=126`

Styles currently loaded:

- `assets/core.css?v=123`
- `assets/math.css?v=123`
- `assets/theory_skin/theory-main-adapter-E126.css?v=126`
- `assets/theory_skin/theory-tab-E129.css?v=136`
- `assets/theory_skin/theory-ui-tokens-E132.css?v=136`
- `assets/theory_skin/theory-slideshow-E132.css?v=136`
- `assets/program_frame/program-frame-E130.css?v=130`

## Removed from boot/runtime

Removed from `index.html`:

- `datavault-importer-E128.css`
- `datavault-importer-E128.js`
- `theory-reader-E132.css`
- `learning-clean-E134.css`
- `learning-clean-E134.js`
- `planning-bridge.js`
- `program-view-E130.js`

Deleted from repo:

- `subjects/math/assets/datavault_importer/datavault-importer-E128.js`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.css`
- `subjects/math/assets/learning_clean/learning-clean-E134.css`
- `subjects/math/assets/learning_clean/learning-clean-E134.js`
- `subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md`

## Why these were removed

E128 caused the main loop risk because it injected a legacy E127 panel with a MutationObserver while E129 storage suppressed that panel.

E134 added a second learner UI layer, which contradicted the goal of restoring the old compact header/table.

E132 reader polish conflicted with the header-only view.

E130 Program View injected a redundant learner-facing `Khung bài giảng E130` route.

Planning Bridge is not needed to boot the Math subject and should only be loaded by the main system if needed.

## Required smoke test

After pulling:

1. Hard refresh the browser.
2. Open `subjects/math/index.html` with Live Server.
3. Confirm the page becomes interactive within a few seconds.
4. Open Lý thuyết.
5. Confirm the compact old header/table remains.
6. Click `Kho Lý thuyết`.
7. Confirm storage/importer opens and does not freeze.
8. Confirm no `Khung bài giảng E130` tab/button appears.
9. Click `Trình chiếu` and confirm slideshow still opens.

## Console checks

Run:

```js
BAUMAN_MATH_THEORY_E129.selfCheck()
BAUMAN_MATH_E130_PROGRAM_FRAME.selfCheck()
BAUMAN_MATH_THEORY_E132.selfCheck()
```

Do not run E128 checks because E128 is intentionally deleted.

## Do not restore

Do not restore these into `index.html` unless a separate no-loop replacement is designed:

- E128 importer;
- E134 learning-clean runtime;
- E130 Program View learner injection;
- E132 reader polish.

End of E136 stabilization.
