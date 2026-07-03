# E160 · E132 Full Lecture Mode Patch Report

Status: PATCH_APPLIED_CODE_INSPECTION_PASS_RUNTIME_SMOKE_PENDING.

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: UI-only patch for E132 slideshow display.

## QUALITY_LOCK_RULES status

- Content task did not edit UI: not applicable
- UI task did not edit content: PASS
- Codex did not generate content: PASS
- Runtime JSON was not edited: PASS
- One goal only: PASS, E132 full lecture mode
- Report created: PASS
- CODEX_STATE read before patch: PASS

## Files changed

- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`

## Files intentionally not changed

- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/data/theory_lecture_frame.json`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subject-manifest.json`
- `lessons.json`
- boot/runtime files

## What changed

### JS

- Release changed to `E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE`.
- Default slideshow mode is now `full`.
- Full lecture mode renders every raw block from the E129 slide DOM.
- Full lecture mode does not use `blocks.slice(0,max)`.
- Full lecture mode does not use `sentenceBits`.
- Full lecture mode does not truncate block body text.
- Compact mode remains optional through a deck button and keyboard shortcuts.
- Self-check now reports:
  - `fullLectureModeDefault:true`
  - `compactContent:false`
  - `compactModeOptional:true`
  - `currentRawBlockCount`
  - `displayedBlocks`

### CSS

- Deck CSS updated for full lecture mode.
- Full mode stacks cards vertically and allows the card list area to scroll.
- Text blocks use `.e132-full-body` with `white-space:pre-wrap`.
- Compact mode keeps the two-column preview layout.

## Verification by code inspection

PASS:

- E132 now has a full mode and opens in full mode by default.
- The full render path uses `s.fullBlocks` built from every raw block.
- Truncation helpers remain only for optional compact mode.
- Content JSON was not edited.
- E129 normal reader was not edited.

## Pending verification

Runtime/browser smoke test is still pending.

Required browser checks:

1. Open C01 §1.1 in normal E129 reader.
2. Enter slideshow mode.
3. Confirm deck label shows `Full lecture`.
4. Confirm a 4-block slide displays 4 cards.
5. Confirm long body text is not truncated with ellipsis.
6. Toggle Compact and Full to verify optional compact mode works.
7. Check keyboard navigation and Esc exit.
8. Open §1.4-§1.6 and verify all block cards remain accessible by scrolling.

## Next recommended task

E161 runtime visual smoke test.

- Do not edit content.
- Prefer local browser check with C01 §1.1, §1.4, §1.5, §1.6.
- If smoke test passes, mark C01 content+display baseline ready.
- If smoke test fails, patch only E132 UI files again.
