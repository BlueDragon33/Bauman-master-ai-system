# E133 · Slideshow Rebuild Plan

Status: opened after user reported that E132 was still overridden and visually too rough.

## Diagnosis

The E132 hotfix still decorated the E129 presentation DOM. That is fragile because E129 and the host app can re-render or handle keyboard events, pulling the user back toward the old view.

The deck also needed a cleaner layout: less visual noise, more compact content, card-level overflow, and stronger separation between reader mode and presentation mode.

## Target

Build presentation as an isolated overlay deck:

- E129 still owns data and reader.
- E132/E133 reads the currently rendered E129 slides.
- The deck itself is a separate full-screen overlay.
- Keyboard events are captured by the overlay and stopped before host handlers.
- Slide content is rendered into a clean role/sidebar plus compact card layout.

## Planned rounds

1. Navigation isolation and overlay deck shell.
2. Clean visual system and overflow control.
3. Content compression and slide-role templates.
4. Browser regression test using C01 seed lesson.
5. Narrow fixes from screenshots/console only.
6. Final handoff.

## Work already done in this pass

- Updated `subjects/math/assets/theory_skin/theory-slideshow-E132.js` to use an isolated overlay deck.
- Updated `subjects/math/assets/theory_skin/theory-slideshow-E132.css` with a cleaner overlay deck layout.
- Updated `subjects/math/index.html` E132 asset versions to `v=134`.

## Commits

- `f5efbf48852b1680b6237c3875894f356ba75202`
- `0e5f041445b15c1b4824a2081cc905eef1ee9cf1`
- `983115ed322108bfab178ea9ca754e03047c80ad`

## Required manual test

After pulling:

1. Hard refresh browser.
2. Open `subjects/math/index.html` with Live Server.
3. Open Lý thuyết, stage `vn`, chapter C01.
4. Open `§1.1 · Vector như dữ liệu kỹ thuật`.
5. Click `Trình chiếu`.
6. Use ArrowRight / ArrowLeft / Space / Enter.
7. Confirm the overlay stays in the new clean deck and does not revert to the old view.
8. Press Escape and confirm it exits cleanly.
9. Run `BAUMAN_MATH_THEORY_E132.selfCheck()`.

Expected:

```js
{
  release: "E132_ISOLATED_OVERLAY_DECK",
  isolatedOverlay: true,
  keyboardCaptured: true,
  slidesDetected: 16
}
```

End of plan.
