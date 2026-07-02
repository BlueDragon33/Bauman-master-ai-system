# E133 · Final Conditional Handoff

Status: conditional handoff after the slideshow rebuild/hardening pass.

This is not a claim that the browser UI is perfect. It is the repo-side closure for E133 until user-side screenshots/console logs confirm or reveal the next narrow bug.

## Why E133 was opened

The user reported two real problems after E132:

1. Keyboard navigation could fall back to the old E129 article-style presentation.
2. The deck looked too rough: content was long, loose, and not clean enough for real lecture slides.

## Core architecture decision

E133 changed the slideshow direction from decoration-on-E129-DOM to an isolated overlay deck.

E129 still owns:

- frame/content loading;
- lesson selection;
- `theory_lecture_content` import/export;
- reader mode.

E133/E132 slideshow now:

- reads the currently rendered E129 slide articles;
- builds a separate overlay deck;
- captures keyboard navigation inside the overlay;
- compresses long slide text into compact bullet/card blocks;
- keeps content source-of-truth in `theory_lecture_content.json`.

## Files changed in E133

Runtime:

- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/index.html`

Diagnostics/support:

- `subjects/math/assets/theory_skin/theory-slideshow-support-E133.js`

Documentation:

- `subjects/math/E133_SLIDESHOW_REBUILD_PLAN.md`
- `subjects/math/E133_BROWSER_REGRESSION_CHECKLIST.md`
- `subjects/math/E133_FINAL_HANDOFF.md`

## Current loaded runtime

`subjects/math/index.html` currently loads the main slideshow runtime:

- `assets/theory_skin/theory-slideshow-E132.css?v=136`
- `assets/theory_skin/theory-slideshow-E132.js?v=136`

The support diagnostics file exists in the repo but is not automatically loaded:

- `assets/theory_skin/theory-slideshow-support-E133.js`

Reason: attempts to add an extra support script to `index.html` were blocked by the connector safety layer. The main loaded runtime is still the compact isolated overlay deck.

## Current expected self-check

In browser console while the overlay is open:

```js
BAUMAN_MATH_THEORY_E132.selfCheck()
```

Expected fields:

```js
{
  release: "E133_ISOLATED_OVERLAY_DECK_COMPACT",
  isolatedOverlay: true,
  keyboardCaptured: true,
  compactContent: true,
  overlayOpen: true,
  slidesDetected: 16
}
```

## Required manual test

1. Pull origin.
2. Hard refresh browser.
3. Open `subjects/math/index.html` with Live Server.
4. Open `Lý thuyết`.
5. Select stage `vn`.
6. Select chapter C01.
7. Open `§1.1 · Vector như dữ liệu kỹ thuật`.
8. Click `Trình chiếu`.
9. Test ArrowRight, ArrowLeft, Space, Enter, Escape.
10. Run `BAUMAN_MATH_THEORY_E132.selfCheck()`.

## Pass criteria

The deck passes E133 if:

- it opens as a fixed full-screen overlay;
- the old sidebar/topbar/article view is not visible while presenting;
- ArrowRight and Space move to the next slide without leaving the overlay;
- ArrowLeft moves previous without leaving the overlay;
- Escape exits cleanly;
- cards are compact bullets, not long paragraphs;
- formula slides use formula/pre styling;
- self-check reports `isolatedOverlay: true`, `keyboardCaptured: true`, and `compactContent: true`.

## If it fails

Do not add another broad UI layer.

Open E133 5b only with concrete evidence:

- screenshot immediately after clicking `Trình chiếu`;
- screenshot after pressing ArrowRight;
- console output of `BAUMAN_MATH_THEORY_E132.selfCheck()`;
- any browser console error.

Then patch only the observed failure.

## Rollback

To rollback E133 visual runtime only, remove the E132 slideshow runtime lines from `subjects/math/index.html`:

- `theory-slideshow-E132.css`
- `theory-slideshow-E132.js`

Keep E129 and E130 files untouched.

## Do not do next

- Do not move new content to `lessons.json`.
- Do not rewrite `theory-tab-E129.js` casually.
- Do not rewrite `subject-manifest.json` casually.
- Do not add another UI layer before browser evidence exists.
- Do not treat repo-side inspection as proof that the UI is perfect.

End of E133 conditional handoff.
