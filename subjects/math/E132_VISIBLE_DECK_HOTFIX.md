# E132 · Visible Deck Hotfix

Status: applied after the user reported that slideshow decoration still did not visibly change.

## Problem

The first E132 implementation added slideshow CSS and JS, but the actual E129 slide markup was still too plain. E129 emitted simple article-style slide nodes without role badges, slide counters, visual wrappers, or strongly distinct slide-role classes.

A second issue was browser caching: `index.html` still loaded E132 assets with version `v=132`, so local browser cache could keep old CSS/JS even after repo changes.

## Files changed

- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/index.html`

## Commits

- `681fed7b6d98c11dbba3addc143430724190dabe`
- `43af703b2774d94735f9f9c4ebafa8f151a59389`
- `762292353b1c6af147cd273cafb138d45f3c5332`

## Runtime behavior after hotfix

The E132 JS now decorates E129 slides at runtime with:

- visible role badge;
- slide number / total counter;
- visual orb accent;
- structured slide body wrapper;
- role classes for formula, lab, warning, Q&A, bridge, and problem slides;
- `visibleDeckHotfix: true` in self-check;
- `decoratedSlides` count in self-check.

The E132 CSS now makes presentation mode visibly different:

- full-screen deck mode;
- sidebar and topbar hidden during presentation;
- stronger dark academic-tech background;
- large active slide canvas;
- strong border, shadow, gradient and accent orb;
- formula/lab/warning/Q&A slides get different visual treatment;
- active slide is forced visible with high-specificity CSS.

`index.html` now uses `v=133` for E132 assets to avoid stale browser cache.

## Required local test

After pulling:

1. Hard refresh the browser.
2. Open `subjects/math/index.html` with Live Server.
3. Go to Lý thuyết.
4. Select stage `vn` and chapter C01.
5. Open lesson `§1.1 · Vector như dữ liệu kỹ thuật`.
6. Click `Trình chiếu`.
7. Confirm full-screen deck styling appears.
8. Run:

```js
BAUMAN_MATH_THEORY_E132.selfCheck()
```

Expected while in presentation mode:

```js
{
  visibleDeckHotfix: true,
  decoratedSlides: 16,
  slidesDetected: 16
}
```

If it still does not show, clear the E129 content overlay and reload:

```js
BAUMAN_MATH_THEORY_E129.clearContentOverlay()
```

Then hard refresh again.

## Source-of-truth reminder

Content remains in:

- `subjects/math/data/theory_lecture_content.json`

Do not move content to `lessons.json`.

End of hotfix note.
