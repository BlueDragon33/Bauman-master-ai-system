# E159 · C01 Visual/Render QA Report

Status: VISUAL_QA_FAIL_E132_COMPRESSION.

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: visual/render logic QA only for C01 §1.1-§1.6.

No content was edited. No UI was edited.

## QUALITY_LOCK_RULES status

- Content task did not edit UI: PASS
- UI task did not edit content: PASS
- This task only inspected render logic: PASS
- CODEX_STATE was read first: PASS
- Report created: PASS

## Files inspected

- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`

## E129 reader verdict

E129 normal reader: PASS for full-block display by code inspection.

Evidence:

- `normalizeSlide` preserves `blocks` and accepts `body/content/text` fallback.
- `blockHtml` reads `b.body || b.content || b.text`.
- `slideHtml` maps all blocks with `blocks.map(blockHtml).join('')`.
- No block count limit is applied in the normal E129 reader.

Implication:

- C01 rich JSON content should be visible in the normal theory reader if the CSS layout can scroll normally.

## E132 slideshow verdict

E132 slideshow: FAIL for full-content teaching display.

Reason:

- The slideshow file identifies itself as compact deck:
  - `RELEASE='E133_ISOLATED_OVERLAY_DECK_COMPACT'`
  - comment says E133 adds content compression so slides stay clean and compact.
- It defines per-role block limits in `LIMIT`.
- `compressBlocks` uses `blocks.slice(0,max)`, so extra blocks are dropped from slideshow.
- Text blocks are converted through `sentenceBits(b.body,2)`.
- `sentenceBits` truncates each sentence through `compact(x,155)` and only returns up to `max` sentence bits.
- `compact` truncates text by character count.
- The public self-check reports `compactContent:true`.

Implication:

- Even though C01 JSON now contains rich academic blocks, the slideshow can still show a shortened version.
- This creates a false visual impression that content is thinner than it is.
- This directly conflicts with the user's requirement to view lesson content, not a compressed teaser deck.

## E132 CSS observation

The CSS supports card scrolling inside `.e132-clean-card { overflow:auto }`, but the JS compresses the content before it reaches the card.

So this is not only a CSS capacity problem. The main issue is JavaScript truncation/compression before render.

## Verdict

C01 content should not proceed to broad rollout until the slideshow display mode is fixed or separated into two modes:

1. Compact presentation mode, optional.
2. Full lecture mode, default for academic reading/slideshow.

## Next recommended task

E160 UI-only patch plan or patch:

- Do not edit content.
- Do not edit `theory_lecture_content.json`.
- Patch only E132 slideshow JS/CSS unless inspection proves a tiny E129 hook is required.
- Remove or bypass `LIMIT`, `compact`, and `sentenceBits` in full lecture mode.
- Render all blocks from each slide using `title + body/content/text`.
- Keep compact deck optional if useful, but full lecture display must not drop blocks.
- Keep keyboard navigation and overlay behavior.
- Verify no content files changed.
