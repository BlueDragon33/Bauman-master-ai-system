# E161 · E132 Static Smoke and Browser Checklist

Status: STATIC_SMOKE_PASS_BROWSER_RUNTIME_PENDING.

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: post-E160 verification without editing content or UI.

No files were patched during the smoke check.

## What was verified statically

Files inspected:

- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`

## Static smoke result

PASS by code inspection.

Verified facts:

1. E132 release is now `E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE`.
2. Default mode is initialized as `full`.
3. `openDeck()` resets mode to `full` before rendering.
4. `rawBlocks()` reads all block pairs from E129 slide DOM.
5. `readModel()` stores both `fullBlocks` and `compactBlocks`.
6. Full render path uses `s.fullBlocks`.
7. Full render path does not use `LIMIT`.
8. Full render path does not use `blocks.slice(0,max)`.
9. Full render path does not use `sentenceBits`.
10. Full body text is rendered through `.e132-full-body`.
11. Compact mode remains optional through button and keyboard shortcuts.
12. Self-check exposes `fullLectureModeDefault:true`, `compactContent:false`, `compactModeOptional:true`, `currentRawBlockCount`, and `displayedBlocks`.
13. CSS has a full mode rule with stacked cards and scrollable grid area.
14. CSS includes `.e132-full-body` with `white-space:pre-wrap`.

## Important limitation

This is not a browser/runtime visual PASS.

A real browser smoke test is still required because static inspection cannot confirm:

- actual DOM structure after E129 enters presenting mode;
- whether `.e129-theory-shell.presenting` exists at runtime;
- whether scroll behavior is comfortable on real screens;
- whether keyboard events are captured without conflict;
- whether long C01 slides visually fit and remain readable.

## Required browser smoke test

Run locally or with Codex browser/runtime access.

### Setup

1. Open the Math module on branch `codex/e150-c01-l01-clean-replacement`.
2. Use Live Server or equivalent local static server.
3. Open the Theory tab.
4. Select C01.

### Test lessons

Check at least:

- `§1.1 · Vector như dữ liệu kỹ thuật`
- `§1.4 · Cơ sở, span và tọa độ`
- `§1.5 · Không gian con và biểu diễn dữ liệu`
- `§1.6 · Từ vector sang ma trận dữ liệu`

### Required checks

For each selected lesson:

1. Open slideshow/presenting mode.
2. Confirm deck header shows `E160 Theory Deck`.
3. Confirm mode label shows `Full lecture` by default.
4. Pick a slide with 4 JSON blocks and confirm 4 cards are displayed.
5. Confirm the slide count text includes `4 blocks` for a 4-block slide.
6. Confirm body text is not truncated with ellipsis.
7. Confirm long body text is reachable through scrolling.
8. Press Compact and confirm compact preview works.
9. Press Full and confirm it returns to full lecture mode.
10. Test keyboard: Right, Left, Space, F, C, Esc.
11. Confirm Esc exits cleanly and returns to the E129 reader.
12. Confirm browser console has no errors.

## Pass criteria

Runtime PASS only if:

- full lecture mode is default;
- displayed block count equals raw block count for full mode;
- no content is truncated in full mode;
- scrolling works for long cards/slides;
- compact mode is optional and reversible;
- keyboard navigation works;
- Esc exits cleanly;
- no console errors;
- no content JSON files changed.

## Next recommended task

If browser smoke passes:

- Mark C01 baseline as ready: content + semantic QA + display baseline.
- Then choose either C02 content-depth packages or branch merge strategy.

If browser smoke fails:

- Patch only E132 UI files again.
- Do not edit content.
