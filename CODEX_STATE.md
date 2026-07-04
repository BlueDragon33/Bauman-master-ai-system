# CODEX_STATE

Current task: E167 hierarchy breadcrumb and formula rail for Math Theory E132.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch`

Scope:
- Repaired E132 Slideshow visual and academic structure for module Toán, tab Lý thuyết, chương C01.
- C01 lessons covered: §1.1 through §1.6.
- E129 Reader was not edited and must remain the full lecture reader.
- `subjects/math/data/theory_lecture_content.json` was not edited.

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/E165C_CHATGPT_DIRECT_COMPACT_ONLY_PATCH_REPORT.md`
- `subjects/math/E165C_LOCAL_BROWSER_VERIFY_PROMPT.md`
- `CODEX_STATE.md`

Runtime result:
- E132 release marker: `E165C_COMPACT_ONLY_C01_CURATED_DECK`.
- E132 Slideshow is compact-only for C01 curated decks.
- Full lecture mode removed from E132 runtime.
- Full/Compact toggle removed from E132 overlay header.
- Reader auto-slicing fallback disabled.
- Lesson detection hardened with C01 aliases for §1.1 through §1.6.

E166 visual repair:
- Replaced old E160 Full Lecture CSS with compact-only CSS.
- Removed formula-card full-width spanning in compact mode.
- Grid changed to dense compact 3-column layout for 3-card slides.
- Typography increased: headline/body/formula/kicker are larger.
- Card padding, border, contrast, and hierarchy rebuilt.
- Added card-type visual styling and card-type support notes.

E167 academic structure repair:
- Added visible breadcrumb on each E132 slide:
  `Khối kiến thức I · Toán học Thuần túy → Học phần 1 · Đại số và Cấu trúc số → Chương 1 · Vector trong không gian dữ liệu → Bài giảng`.
- Added fixed formula rail for C01 on each slide:
  `x=(x₁,…,xₙ)`, `||x||₂=√Σxᵢ²`, `d(x,y)=||x-y||`, `x·y=Σxᵢyᵢ=||x||||y||cosθ`, `projᵤ(x)=((x·u)/(u·u))u`, `span(vᵢ)={Σcᵢvᵢ}`, `rank(A)=số pivot`.
- Adjusted slide bottom padding so the formula rail does not overlap cards.

C01 compact deck coverage:
- §1.1 · Vector như dữ liệu kỹ thuật
- §1.2 · Chuẩn vector và khoảng cách
- §1.3 · Tích vô hướng, góc và phép chiếu
- §1.4 · Cơ sở, span và tọa độ
- §1.5 · Không gian con và biểu diễn dữ liệu
- §1.6 · Độc lập tuyến tính, chiều và hạng dữ liệu

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
7. Confirm breadcrumb follows Module → Course → Chapter → Lecture.
8. Confirm formula rail appears at the bottom of each slide.
9. Confirm no Full lecture label/button exists.
10. Confirm cards are dense, readable, not huge empty boxes.
11. Confirm E129 Reader still shows full content.
12. Browser console: 0 errors.

Next actor:
- User local smoke test.
