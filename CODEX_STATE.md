# CODEX_STATE

Current task: THEORY_CORE_C01_L01_GOLD_STANDARD

Status: CORE_AUTHORED_NEEDS_CONTENT_REVIEW

Date: 2026-07-08
Branch: `main`

Mandatory development order:
1. Core content
2. `Tham khảo thêm` reference table
3. Slideshow
4. `Xem đầy đủ`
5. Final formula and layout normalization

Do not skip ahead.

Files added:
- `subjects/math/data/theory_core/theory_core_c01_l01.json`
- `subjects/math/data/theory_core/theory_core_manifest.json`
- `HANDOFF_THEORY_CORE.md`

Gold-standard decision:
- `§1.1 · Vector như dữ liệu kỹ thuật` is the gold-standard candidate for all later theory-core lessons.
- Core content is now separated from slide/popup/UI decisions.
- Existing `theory_lecture_content.json` remains unchanged in this phase.
- The new core file is the future source of truth for reference tables, slideshow content, full-view content, and final formula/layout work.

Lesson 1.1 core coverage:
- lesson thesis and prerequisites
- six measurable learning outcomes
- semantic notation rules
- vector as ordered engineering data
- geometry/data duality
- dimension versus schema
- vectorization as lossy modeling
- vector addition and scalar multiplication
- L2 norm, dot product, Euclidean distance, and cosine similarity
- metric-selection logic
- data-quality and assumption gates
- complete network-state worked case
- raw and standardized numerical results
- UGV/UAV, server, signal, and embedding applications
- common misconceptions
- mastery checks from recall to creation
- implementation contract
- bridges to §1.2, §1.3, and Chapter 2
- downstream mapping and quality gate

Notation contract:
- `x_i` means the i-th element and must render with a subscript.
- `x_i^2` means the square of element i: i below, 2 above.
- `x^2`, `A^{-1}`, and `A^k` remain legitimate superscripts when raw notation uses `^`.
- `x_i^T` keeps i below and T above.

Presentation/runtime status:
- No UI, slideshow, popup, or renderer file was changed for this core task.
- E235 remains the approved `Xem đầy đủ` visual baseline, but UI work is paused.
- E236, E237, and E238 remain disabled from runtime.

Commits:
- Lesson 1.1 core: `24b75580f841d4da3e2ed8867c72e4796b4fe2bb`
- Core manifest: `f7682618b11f3543ad1d1304b2fb2abd26eafdda`
- Core handoff: `450018e626052c64159df2db2f7d638ae603c14c`

Review required before gold-standard approval:
- verify academic depth and progression
- verify terminology and notation consistency
- verify numerical worked-case values
- confirm the lesson is neither too broad nor missing a required foundation
- confirm downstream mapping is sufficient for reference table, slideshow, and full view

Next task:
- Create `subjects/math/data/theory_core/theory_core_c01_l02.json`
- Lesson: `§1.2 · Chuẩn vector và khoảng cách`
- Use `HANDOFF_THEORY_CORE.md` and lesson 1.1 as the template.
