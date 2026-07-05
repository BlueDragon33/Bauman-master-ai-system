# CODEX_STATE

Current task: E214 Reader Pro non-duplicated summary panel.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js?v=214`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js?v=213`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 only adds lesson identity labels.
- E211 supplies canonical Reader Pro content and the right-side summary panel.
- E212 includes balance guard and adaptive card typography.
- E210/E211/E212 do not control next/previous/open/close.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User finding:
- The right Reader Pro summary panel repeated content already shown in the lower cards.
- Blocks such as `Diễn giải kỹ thuật`, `Câu hỏi tự kiểm`, and similar self-check/question blocks should not appear in the small right panel.
- If the right panel has little text, the typography should scale up instead of leaving a large empty box.

Files changed in E214:
- Updated `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js` to release `E214_READER_PRO_NON_DUPLICATED_SUMMARY`.
- Updated `subjects/math/index.html` cache busters:
  - E211 `?v=214`
  - E212 `?v=213`
- Updated `CODEX_STATE.md`.

Patch summary:
- Right summary panel no longer builds a bullet list from every canonical block.
- It now uses a compact slide brief:
  - lesson title
  - current slide title
  - one concise main idea from the first core block
  - formula/keyline only if present
- Repeated lower-card blocks are excluded from the small panel:
  - `Diễn giải kỹ thuật`
  - `Câu hỏi tự kiểm`
  - `Câu hỏi đúng cần đặt`
  - other self-check/question variants
- Summary panel gets density classes:
  - `e211-summary-light` for short content: larger text.
  - `e211-summary-normal` for normal content.
  - `e211-summary-dense` for long content.
- Lower cards still retain canonical detailed blocks.
- C02/C03 Level C should not be affected.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the Reader Pro slide from the screenshot.
   - Right panel must not show `Diễn giải kỹ thuật` or `Câu hỏi tự kiểm`.
   - Right panel should show a concise brief only.
   - If brief is short, text should be larger and not look tiny in an empty box.
4. Check lower cards:
   - detailed technical explanation/self-check may remain below.
   - no duplicate content should appear in the right panel.
5. Test next, previous, Escape, and close.
6. Browser console: 0 errors.

Next safe task:
- Only continue content wiring after Reader Pro layout is confirmed stable by local browser smoke.
