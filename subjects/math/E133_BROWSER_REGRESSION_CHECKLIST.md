# E133 · Browser Regression Checklist

Status: Round 5 checklist after compact overlay deck changes.

## Runtime files currently loaded

`subjects/math/index.html` loads:

- `assets/theory_skin/theory-slideshow-E132.css?v=136`
- `assets/theory_skin/theory-slideshow-E132.js?v=136`

The optional support diagnostics file exists but is not loaded automatically:

- `assets/theory_skin/theory-slideshow-support-E133.js`

## Required test path

1. Pull origin.
2. Hard refresh browser.
3. Open with Live Server: `subjects/math/index.html`.
4. Open Lý thuyết.
5. Select stage `vn`.
6. Select chapter C01.
7. Open lesson `§1.1 · Vector như dữ liệu kỹ thuật`.
8. Click `Trình chiếu`.

## Expected console result

Run:

```js
BAUMAN_MATH_THEORY_E132.selfCheck()
```

Expected key fields:

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

## Keyboard test

While the overlay is open:

- ArrowRight should go next.
- ArrowLeft should go previous.
- Space should go next.
- Enter should go next.
- Escape should exit.

The UI must not return to the old article-style slide view during ArrowRight/ArrowLeft/Space/Enter.

## Visual test

The deck should show:

- fixed full-screen overlay;
- compact role sidebar;
- large title;
- 1-3 compact cards;
- bullets instead of long paragraphs;
- formula cards as monospaced pre blocks;
- no sidebar/topbar from the old app while presenting.

## If still broken

Capture and send:

1. Screenshot immediately after clicking `Trình chiếu`.
2. Screenshot after pressing ArrowRight.
3. Console output of `BAUMAN_MATH_THEORY_E132.selfCheck()`.
4. Browser console errors, if any.

Do not start another UI layer before this checklist is tested.

End of checklist.
