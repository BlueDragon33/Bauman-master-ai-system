# E135 · Header-only Theory Cleanup

Status: applied after user requested to keep only the old lesson-structure header/table and remove the redundant body UI.

## Goal

Keep the learner-facing Theory view close to the old compact header layout:

- `Cấu trúc bài học` selector area;
- `Lý thuyết` lesson card;
- lesson/chapter code chip;
- existing control buttons managed by the previous runtime.

Remove the redundant body area below it:

- long card sections;
- metadata/debug status;
- extra E134 tab bar;
- duplicated learner-facing notes;
- redundant E130 learner route toggle;
- legacy E128 importer loop source.

## What was removed

Deleted from repo:

- `subjects/math/assets/learning_clean/learning-clean-E134.css`
- `subjects/math/assets/learning_clean/learning-clean-E134.js`
- `subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.js`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.css`

Removed from runtime:

- E134 CSS/JS references in `subjects/math/index.html`.
- E132 reader polish CSS reference in `subjects/math/index.html`.
- E128 DataVault importer CSS/JS references in `subjects/math/index.html`.

## Why E128 was removed

E128 injected a legacy E127 importer panel through a MutationObserver. E129 storage suppressed that same legacy panel. This created an inject/suppress loop that made the Math module keep loading and become unresponsive.

E129 now owns the Theory storage/import route, so E128 must not be restored to the Math runtime.

## What was kept

Kept:

- E129 Theory runtime.
- E132/E133 slideshow runtime for `Trình chiếu`.
- DataVault source files.
- `theory_lecture_content.json`.
- E130 Program Frame data/API, but learner UI injection is disabled.

## Main patches

Patched:

- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/program_frame/program-view-E130.js`
- `subjects/math/index.html`

E135 header-only rules:

- hide E129 side tree in normal learner view;
- keep E129 reader header;
- hide E129 grid/cards/placeholders/status below the header;
- do not hide storage/importer when body has `e129-theory-storage`;
- keep presentation mode unaffected.

E130 learner cleanup:

- disabled route toggle injection;
- disabled nav button injection;
- remove stale E130 nodes if they already exist;
- keep Program Frame API/data for future backend use.

## Current test

After pulling and hard refresh:

1. Open `subjects/math/index.html`.
2. Confirm the Math module stops loading and becomes interactive.
3. Open Lý thuyết.
4. Confirm only the compact old header/table remains.
5. Confirm the large redundant body/card area is gone.
6. Click `Kho Lý thuyết` and confirm E129 storage/importer opens.
7. Confirm `Khung bài giảng E130` is not visible as a learner UI tab/button.
8. Click `Trình chiếu` to confirm presentation still opens.

## Rollback

Do not restore E128 or E134.

To rollback only the header-only visual rule:

1. Restore `theory-tab-E129.css` before the E135 header-only block.
2. Keep E128 deleted unless a separate non-looping importer replacement is designed.

End of E135 cleanup.
