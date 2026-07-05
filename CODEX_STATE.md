# CODEX_STATE

Current task: E211 Reader Pro content source fix.

Status: PATCHED_NEEDS_BROWSER_SMOKE

Date: 2026-07-05
Branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js?v=209`
- `subjects/math/assets/theory_skin/theory-slideshow-identity-E210.js?v=210`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js?v=211`

Design rule:
- E202 remains the only slideshow renderer/engine.
- E210 only adds lesson identity labels.
- E211 only corrects Reader Pro content from the canonical theory JSON.
- E210/E211 do not control next/previous/open/close.
- Do not re-enable E190/E191/E192/E193/E195.
- 16 slides is the minimum, not the maximum.

User finding:
- The slideshow title/identity problem was partly fixed, but the displayed Reader Pro content was still not academically correct.
- Example: §1.2 Reader Pro content was being built by raw DOM text extraction, causing merged text and generic cards.

Root cause verified:
- The canonical content exists in `subjects/math/data/theory_lecture_content.json`.
- For §1.2, the canonical record is:
  - lessonTitle: `§1.2 · Chuẩn vector và khoảng cách`
  - first slide title: `Khoảng cách biến dữ liệu thành không gian có thể đo`
  - proper blocks: `Vấn đề học tập`, `Góc nhìn kỹ thuật`, `Câu hỏi đúng cần đặt`, `Câu hỏi tự kiểm`
- E202 Reader Pro was extracting rendered DOM text from E129 instead of using this canonical structured content.

Files changed in E211:
- Added `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`.
- Updated `subjects/math/index.html` to load E211 after E210.
- Updated `CODEX_STATE.md`.

Patch summary:
- E211 fetches `data/theory_lecture_content.json` with `cache:no-store`.
- E211 maps records by `lessonId`, `lessonTitle`, and `title`.
- When the active deck is in `Reader Pro` mode, E211 finds the matching canonical record and rewrites only Reader Pro slide content:
  - slide title
  - lesson identity line
  - insight paragraph
  - formula strip when the canonical slide has a formula block
  - 3 cards based on canonical blocks:
    1. first text/formula/qa block
    2. second text/code/formula block
    3. qa block
- E211 does not touch C02/C03 Level C mode.
- E211 is intentionally a bridge because replacing full E202 was blocked by safety tooling and would risk destabilizing the working slideshow engine.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open §1.2 · Chuẩn vector và khoảng cách.
   - Expected lesson identity: `§1.2 · Chuẩn vector và khoảng cách`.
   - Expected first slide title: `Khoảng cách biến dữ liệu thành không gian có thể đo`.
   - Expected cards should use canonical block titles such as `Vấn đề học tập`, `Góc nhìn kỹ thuật`, `Câu hỏi tự kiểm`.
   - Text must not show merged raw DOM strings like `Vấn đề học tậpSau...`.
4. Open another Reader Pro lesson from C01.
   - Expected content should match the canonical JSON blocks.
5. Open C02/C03 Level C.
   - Expected: E211 should not override Level C content.
6. Test next, previous, Escape, and close.
7. Browser console: 0 errors.

Next safe task after E211 smoke passes:
- If Reader Pro content is correct, continue creating Level C JSON for the next chapter.
- Long-term: fold E210/E211 into E202 in a controlled patch when tooling allows, then remove bridge scripts.
