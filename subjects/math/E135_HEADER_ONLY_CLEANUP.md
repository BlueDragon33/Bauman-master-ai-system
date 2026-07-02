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
- duplicated learner-facing notes.

## What was removed

Deleted from repo:

- `subjects/math/assets/learning_clean/learning-clean-E134.css`
- `subjects/math/assets/learning_clean/learning-clean-E134.js`
- `subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md`

Removed from runtime:

- E134 CSS/JS references in `subjects/math/index.html`.

## What was kept

Kept:

- E129 Theory runtime.
- E132/E133 slideshow runtime.
- DataVault source files.
- `theory_lecture_content.json`.
- E130 Program Frame.

## Main patch

Patched:

- `subjects/math/assets/theory_skin/theory-tab-E129.css`

Added E135 header-only rules:

- hide E129 side tree in normal learner view;
- keep E129 reader header;
- hide E129 grid/cards/placeholders/status below the header;
- keep presentation mode unaffected.

## Current test

After pulling and hard refresh:

1. Open `subjects/math/index.html`.
2. Open Lý thuyết.
3. Confirm only the compact old header/table remains.
4. Confirm the large redundant body/card area is gone.
5. Click `Trình chiếu` to confirm presentation still opens.

## Rollback

To rollback E135:

1. Restore `theory-tab-E129.css` before the E135 header-only block.
2. Re-add E134 files only if explicitly requested, but current instruction says not to restore E134.

End of E135 cleanup.
