# E163 · Visible Lesson Selector Patch

Status: STATIC_PATCH_PASS_BROWSER_RETEST_REQUIRED

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: UI-only repair after E162 runtime smoke failure. No learning-content JSON changed.

## Root cause repaired

E135 learner-view CSS hid the whole `.e129-placeholder`, but E129 renders the current lesson title and all `data-e129-lesson` buttons inside that container. The buttons therefore existed in DOM but had a `0x0` layout box and could not be used to switch from §1.1 to §1.4–§1.6.

## Patch

- Restore `.e129-placeholder` only in normal learner view.
- Keep technical badge/lessonId metadata hidden.
- Keep raw `.e129-slide-list` hidden so the learner view does not regress into a long textbook-like page.
- Expose the lesson buttons as a compact horizontally scrollable selector strip.
- Preserve active-state styling and add visible keyboard focus.
- Keep presentation mode and theory storage behavior unchanged.
- Bump the E129 stylesheet cache key in `subjects/math/index.html` to `v=163`.

## Static verification

- E129 click handler already routes `data-e129-lesson` to `state().e129LessonId` and rerenders the Theory reader.
- E132 slideshow reads the currently rendered E129 slide DOM, so changing the lesson updates the slideshow source without content JSON edits.
- Normal learner view now has a visible selector while raw slide bodies remain hidden until slideshow/presentation use.
- No content JSON changed.

## Remaining gate

Re-run the E162 browser smoke for §1.1, §1.4, §1.5 and §1.6. Runtime acceptance still requires clickable lesson switching, E132 full-mode block parity, scrolling, keyboard controls, clean Esc exit and zero console errors.
