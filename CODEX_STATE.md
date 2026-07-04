# CODEX_STATE

Current task: E168 per-slide formula rail for Math Theory E132.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Repaired E132 Slideshow so formulas are per-slide, not hard-coded globally.
- Module Toán, tab Lý thuyết, C01 §1.1 through §1.6.
- E129 Reader was not edited and must remain the full lecture reader.
- `subjects/math/data/theory_lecture_content.json` was not edited.

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `CODEX_STATE.md`

E168 result:
- Removed the fixed C01 formula rail from CSS.
- Added dynamic formula rail rendered by JS per slide.
- Each slide now owns its formula string.
- Header changed to `E168 Compact Math Deck`.
- Mode label changed to `Per-slide formula`.
- Each slide renders 4 cards: Ý chính, Công thức trọng tâm, Ứng dụng, Tự kiểm.
- Each lesson §1.1–§1.6 now has 16 compact slides with corresponding formula/content.
- Full lecture mode remains removed.
- Reader auto-slicing remains disabled.
- E129 Reader remains full content.

C01 deck coverage:
- §1.1 · Vector như dữ liệu kỹ thuật: 16 per-slide formula slides.
- §1.2 · Chuẩn vector và khoảng cách: 16 per-slide formula slides.
- §1.3 · Tích vô hướng, góc và phép chiếu: 16 per-slide formula slides.
- §1.4 · Cơ sở, span và tọa độ: 16 per-slide formula slides.
- §1.5 · Không gian con và biểu diễn dữ liệu: 16 per-slide formula slides.
- §1.6 · Độc lập tuyến tính, chiều và hạng dữ liệu: 16 per-slide formula slides.

Verification:
- GitHub update succeeded for E132 JS.
- GitHub update succeeded for E132 CSS.
- Browser smoke test was not run from this chat environment.
- Status is PATCHED, not full PASS, until local browser smoke confirms the runtime.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Open Math module locally.
4. Open tab Lý thuyết.
5. Open C01 §1.1 through §1.6.
6. Open E132 Slideshow in each lesson.
7. Confirm header says `E168 Compact Math Deck`.
8. Confirm formula rail changes when moving slide.
9. Confirm formula matches the current slide topic.
10. Confirm no fixed all-C01 formula rail remains.
11. Confirm no Full lecture label/button exists.
12. Confirm E129 Reader still shows full content.
13. Browser console: 0 errors.

Next actor:
- User local smoke test.
