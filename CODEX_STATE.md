# CODEX_STATE

Current task: E212 Reader Pro content summary panel and layout balance.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js?v=212`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js?v=212`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 only adds lesson identity labels.
- E211 now supplies canonical Reader Pro content plus Reader Pro layout overrides.
- E212 reader-fit still adjusts Reader Pro card typography.
- E210/E211/E212 do not control next/previous/open/close.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User request:
- Increase the width/priority of the upper content area because it contains the main lesson content.
- The lower card area often has little content and should not dominate the slide.
- The right Reader Pro panel must show real slide summary/key ideas, not just a generic notice.

Files changed:
- Updated `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js` to release `E212_READER_PRO_CONTENT_AND_LAYOUT`.
- Updated `subjects/math/index.html` so E211 is loaded with `?v=212`.
- Updated `CODEX_STATE.md`.

Patch summary:
- E211/E212 still fetches canonical data from `data/theory_lecture_content.json`.
- Reader Pro now adds a class `e211-reader-pro` to the active deck.
- Reader Pro layout is rebalanced:
  - hero/top area is wider and taller.
  - left content column is prioritized.
  - right Reader Pro panel is narrower but more informative.
  - bottom card grid is constrained so it no longer dominates the slide.
- Reader Pro right panel now displays a real summary panel:
  - lesson title
  - current slide title
  - 2-4 key bullets from canonical slide blocks
  - formula/keyline when available
- Reader Pro cards still use canonical block titles and bodies.
- E212 reader-fit remains loaded after E211 to adapt typography in cards.
- C02/C03 Level C should not be overridden by this Reader Pro bridge.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open Reader Pro example such as §1.1 or §1.2.
   - Upper content area should be wider/taller.
   - Lower cards should take less visual priority.
   - Right Reader Pro panel should show real summary bullets, not a generic message.
   - The lesson title and current slide title should be visible.
   - Content must come from canonical JSON blocks, not raw DOM text.
4. Test short and long Reader Pro slides.
   - Short content should not look tiny in a huge empty card.
   - Long content should not overflow badly.
5. Open C02/C03 Level C.
   - Expected: Level C mode and content remain unchanged.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next safe task after smoke passes:
- Continue creating Level C JSON for the next chapter.
- Long-term: fold E210/E211/E212 into E202 in a controlled patch when tooling allows, then remove bridge scripts.
