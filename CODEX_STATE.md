# CODEX_STATE

Current task: E210 slideshow lesson identity label.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 is not a renderer and does not control next/previous/open/close.
- E210 only adds lesson identity labels to the active slideshow DOM.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User finding:
- Reader Pro display was cleaner, but it still did not clearly show the title of the lesson currently being presented.
- This makes it hard to detect mixed/wrong content.

Files changed in E210:
- Added `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js`.
- Updated `subjects/math/index.html` to load E210 after E202.
- Updated `CODEX_STATE.md`.

Patch summary:
- E210 derives the current lesson title from:
  - Bauman/Core state keys such as `lessonTitle`, `currentLessonTitle`, `selectedTheoryTitle`, `selectedLessonId`, `e129LessonId`.
  - active lesson DOM chips/titles.
  - current slideshow heading as a fallback.
- E210 adds visible identity labels:
  - topbar chip: `Đang trình chiếu: <tên bài>`
  - hero line after the slide title: `Bài đang được trình chiếu: <tên bài>`
  - self-check card line: `Kiểm tra bài: <tên bài>`
- E210 is idempotent and only writes the label nodes it owns.
- E210 does not call E202 render, does not reopen the deck, and does not modify slideshow state.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open the Reader Pro example from the latest screenshot.
   - It should still show Reader Pro if no Level C deck exists.
   - It must visibly show `Đang trình chiếu: <tên bài>` in the topbar.
   - It must show `Bài đang được trình chiếu: <tên bài>` near the slide title.
4. Open C02 and C03 Level C lessons.
   - They should still show Level C mode.
   - They should also show the lesson identity label.
5. Test next, previous, Escape, and close.
6. Browser console: 0 errors.

Next safe task after E210 browser smoke passes:
- Continue creating/wiring Level C JSON for the next chapter using E202 routing.
- Do not add another slideshow renderer.
