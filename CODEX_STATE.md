# CODEX_STATE

Current task: THEORY_CORE_C01_L02

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

Core architecture:
- Core content is presentation-independent.
- Core files contain no slide numbering, popup labels, CSS, animation, or layout instructions.
- Existing `theory_lecture_content.json` remains unchanged during the core phase.
- Downstream reference, slideshow, full-view, and formula/layout content must derive from the core and may not contradict it.

Gold standard:
- `subjects/math/data/theory_core/theory_core_c01_l01.json`
- Lesson: `§1.1 · Vector như dữ liệu kỹ thuật`
- Status: `gold_standard_candidate`

Core records completed:
1. `theory_core_c01_l01.json`
   - vector as engineering data
   - semantic notation
   - operations, norm, dot, distance, cosine
   - data-quality gates
   - complete network-state worked case
2. `theory_core_c01_l02.json`
   - norm axioms
   - L1, L2, Linf, weighted L2
   - metric axioms
   - Manhattan, Euclidean, Chebyshev, weighted distance
   - similarity versus distance
   - z-score, robust and min-max scaling
   - assumption and weight-provenance gates
   - complete UGV anomaly-distance worked case
   - raw, standardized, and weighted numerical results
   - engineering applications and failure modes

Manifest:
- `subjects/math/data/theory_core/theory_core_manifest.json`
- Version: `CORE_MANIFEST_V1_1`
- Registered records: C01-L01 and C01-L02

Notation contract:
- `x_i` is the i-th element and must use a subscript.
- `x_i^2` has i below and 2 above.
- `x^2`, `A^{-1}`, and `A^k` remain superscripts when raw notation uses `^`.
- Formula source must remain semantically explicit before any renderer is applied.

Presentation/runtime status:
- No UI/runtime file was changed in the core-content phase.
- E235 remains the approved `Xem đầy đủ` baseline but UI work is paused.
- E236, E237, and E238 remain disabled from runtime.

Commits:
- C01-L01 core: `24b75580f841d4da3e2ed8867c72e4796b4fe2bb`
- Initial manifest: `f7682618b11f3543ad1d1304b2fb2abd26eafdda`
- Core handoff: `450018e626052c64159df2db2f7d638ae603c14c`
- C01-L02 core: `6152fee25201bde2b0e9b30d8b00087d44b71604`
- Manifest update: `7b4dc5b3d643aa568129af0b3fc5bb94ed64f341`

Review required:
- verify academic progression from §1.1 to §1.2
- verify terminology: norm, metric, distance, similarity
- verify numerical values in both worked cases
- confirm weighted norm conditions are stated correctly
- confirm the core remains presentation-independent

Next task:
- Create `subjects/math/data/theory_core/theory_core_c01_l03.json`
- Lesson: `§1.3 · Tích vô hướng, góc và phép chiếu`
- Use lesson 1.1 as structural gold standard and lesson 1.2 as continuity reference.

Persistent handoff:
- `HANDOFF_THEORY_CORE.md`
