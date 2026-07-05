# CODEX_STATE

Current task: E212 Reader Pro adaptive text fit.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js?v=211`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js?v=212`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 only adds lesson identity labels.
- E211 only corrects Reader Pro content from canonical theory JSON.
- E212 only adjusts Reader Pro card labels and typography.
- E210/E211/E212 do not control next/previous/open/close.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User request:
- In Reader Pro, the first content card should clearly be the slide key summary.
- If a content box has little text, increase font size to fill the space.
- If a content box overflows, reduce font size.

Files changed in E212:
- Added `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`.
- Updated `subjects/math/index.html` to load E212 after E211.
- Updated `CODEX_STATE.md`.

Patch summary:
- E212 applies only when the active deck is in `Reader Pro` mode.
- E212 changes the first Reader Pro card kicker to `Tóm tắt ý chính của slide`.
- E212 assigns adaptive density per card:
  - `light`: larger heading/body when text is short and there is empty space.
  - `normal`: default balanced size.
  - `dense`: smaller text for longer content.
  - `overflow`: compact text if the card still overflows.
- E212 checks card scroll height after render and tightens the density if content overflows.
- E212 does not override C02/C03 Level C cards.

Reader Pro content source remains E211:
- E211 fetches `data/theory_lecture_content.json`.
- E211 uses canonical lesson records and block titles.
- Reader Pro should not use raw DOM text extraction anymore.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open a Reader Pro lesson such as §1.2.
   - First card label should be `Tóm tắt ý chính của slide`.
   - Short card content should appear larger and fill the box better.
   - Long card content should shrink enough to avoid obvious overflow.
   - Content should still come from canonical JSON blocks.
4. Open C02/C03 Level C.
   - Expected: E212 should not modify Level C typography/cards.
5. Test next, previous, Escape, and close.
6. Browser console: 0 errors.

Next safe task after E212 smoke passes:
- Continue creating Level C JSON for the next chapter.
- Long-term: fold E210/E211/E212 into E202 in a controlled patch when tooling allows, then remove bridge scripts.
