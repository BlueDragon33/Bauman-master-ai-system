# E137 · Clean Theory Lock

Status: applied after user confirmed the Math module no longer enters the loading loop.

## Goal

Lock the stable Math boot and keep the normal Theory learner view clean.

## What E137 changed

Patched:

- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/index.html`

Changes:

- Hide learner-facing technical labels in normal mode:
  - `#subjectSubtitle`
  - `#coreLabel`
  - `#pageSub`
  - `#saveState`
- Polish the remaining old compact header/table area.
- Keep storage/importer visible when `body.e129-theory-storage` is active.
- Keep slideshow/presentation mode unaffected.
- Bump E129 CSS cache from `v=136` to `v=137`.

## Current boot runtime

Scripts:

- `assets/subject-adapter.js?v=123`
- `assets/program_frame/program-frame-E130.js?v=130`
- `assets/theory_skin/theory-tab-E129.js?v=129`
- `assets/theory_skin/theory-slideshow-E132.js?v=136`

Styles:

- `assets/core.css?v=123`
- `assets/math.css?v=123`
- `assets/theory_skin/theory-tab-E129.css?v=137`
- `assets/theory_skin/theory-ui-tokens-E132.css?v=136`
- `assets/theory_skin/theory-slideshow-E132.css?v=136`

## Do not restore into boot

- E128 importer;
- E134 learning-clean runtime;
- E130 Program View learner injection;
- E130 Program CSS in learner boot;
- E126 legacy theory adapter;
- empty `core.js`;
- E132 reader polish.

## Final smoke test

1. Hard refresh.
2. Open Math subject.
3. Confirm no loading loop.
4. Open Lý thuyết.
5. Confirm only the clean compact old header/table remains.
6. Click Kho Lý thuyết and confirm importer opens.
7. Click Trình chiếu and confirm slideshow opens.

End of E137 lock.
