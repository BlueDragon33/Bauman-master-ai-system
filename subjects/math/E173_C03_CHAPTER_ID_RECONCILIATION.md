# E173 · C03 Chapter ID Structural Reconciliation

Status: STRUCTURAL_PASS_BROWSER_BASELINE_PENDING

Branch: `codex/e150-c01-l01-clean-replacement`

## Defect

Canonical chapter ID in frame/spine/curriculum/program map:

`MATH-VN-C03-ham_so_ao_ham_va_gradien`

Six C03 theory records had instead:

`MATH-VN-C03-giai_tich_dao_ham_gradient`

Exact E129 chapter matching therefore could not attach the C03 lesson records to the canonical frame.

## Repair

Updated record-level `chapterId` and `sourceAnchors.chapterId` in:
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/data/theory_lecture_content_c03_e145_staged.json`
- `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`

Lesson IDs were intentionally preserved.

## Verification

- runtime content mapped to canonical C03: 6/6
- runtime records still on legacy chapterId field: 0
- sourceAnchors canonical: PASS
- staged packages canonical: 6/6
- lesson IDs preserved: PASS

## Boundary

No framework redesign.
No main sync.
E164 browser/runtime baseline remains pending.
