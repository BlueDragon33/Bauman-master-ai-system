# CODEX_STATE

Current task: THEORY_CORE_C01_L03_CONTENT_REVIEW

Status: CORE_CONTENT_REVIEW_APPROVED

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
3. `theory_core_c01_l03.json`
   - status: `approved_against_gold_standard`
   - dot product by coordinates and norm-angle relation
   - sign of dot product, angle domain and orthogonality
   - cosine similarity and zero-vector gate
   - projection onto a vector and parallel-orthogonal decomposition
   - projection onto an orthonormal subspace at introductory level
   - residual orthogonality and least-squares bridge
   - matched filter, linear score, signal matching, robot and AI applications
   - complete UGV route-projection worked case with numerical invariants
   - safe Python/NumPy implementation contract

Manifest:
- `subjects/math/data/theory_core/theory_core_manifest.json`
- Version: `CORE_MANIFEST_V1_3`
- Registered records: C01-L01, C01-L02 and C01-L03
- C01-L03 status: `approved_against_gold_standard`

Notation contract:
- `x_i` is the i-th element and must use a subscript.
- `x_i^2` has i below and 2 above.
- `x_i^T` keeps i as a subscript and T as a superscript.
- `x^2`, `A^{-1}`, and `A^k` remain superscripts when raw notation uses `^`.
- Formula source must remain semantically explicit before any renderer is applied.

C01-L03 content review:
- Academic progression from norm and distance to dot, angle, orthogonality and projection is approved.
- Dot product, cosine, angle, scalar component and projection vector are explicitly distinguished.
- Zero-vector policy was corrected during review:
  - dot product remains defined after valid shape/schema checks;
  - cosine and angle require both vectors to have non-zero norm;
  - projection and residual require only the direction vector y to be non-zero;
  - `proj_y(0) = 0` is valid when `y != 0`.
- Python contract now returns explicit angle-defined status and preserves projection for zero x.
- Projection-on-subspace and least-squares material remains introductory and defers numerical solution details to later matrix lessons.
- Worked case values remain verified: dot=10, cosine=0.8944271909999159, angle=26.565051177077994 degrees, projection=[4,2], residual=[-1,2], residual dot direction=0.
- Reconstruction, orthogonality and Pythagorean invariants remain explicit.
- Core remains presentation-independent.
- No browser smoke test was claimed because this task is content-only.

Presentation/runtime status:
- No UI/runtime file was changed in the core-content phase.
- E235 remains the approved `Xem đầy đủ` baseline but UI work is paused.
- E236, E237, and E238 remain disabled from runtime.

Commits:
- C01-L01 core: `24b75580f841d4da3e2ed8867c72e4796b4fe2bb`
- Initial manifest: `f7682618b11f3543ad1d1304b2fb2abd26eafdda`
- Core handoff: `450018e626052c64159df2db2f7d638ae603c14c`
- C01-L02 core: `6152fee25201bde2b0e9b30d8b00087d44b71604`
- Manifest update for C01-L02: `7b4dc5b3d643aa568129af0b3fc5bb94ed64f341`
- C01-L03 core: `a87a368a82d151060c0e1f9a358f668ccd445517`
- Manifest registration for C01-L03: `ac5fadd6022d8f649e77069a89d3becd74baed28`
- C01-L03 review correction and approval: `586b9bea397625ebf5c300a8bbb6c7b7b948c67a`
- Manifest approval for C01-L03: `04724ed3b10085383f3599b11f2df58de41a4160`

Next task:
- Create `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Use lesson 1.1 as structural gold standard and lessons 1.2–1.3 as continuity references.
- Remain in core-content phase; do not start the reference table, slideshow, full-view, renderer or UI.

Persistent handoff:
- `HANDOFF_THEORY_CORE.md`
