# E143 · C02 Complete Content

Status: applied after E142 added the first three C02 lessons.

## Scope

Patched only:

- `subjects/math/data/theory_lecture_content.json`

No boot/runtime/UI files were changed.

## Result

C01 remains complete and locked with 6 theory lessons.

C02 · Ma trận và phép biến đổi tuyến tính now contains 6 learner-facing theory lessons:

1. `§2.1 · Ma trận như dữ liệu và phép biến đổi`
2. `§2.2 · Phép nhân ma trận và pipeline tuyến tính`
3. `§2.3 · Hạng ma trận, không gian cột và thông tin độc lập`
4. `§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm`
5. `§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu`
6. `§2.6 · Từ ma trận sang PCA và mô hình tuyến tính`

Each current C02 lesson uses 16 slides, satisfying the 14-slide quality floor for normal Math theory lessons.

## Content coverage

C02 now covers:

- matrix as data vs operator;
- matrix-vector multiplication;
- matrix multiplication and linear pipelines;
- shape and order rules;
- rank, column space and independent information;
- inverse matrix, linear systems and solution conditions;
- numerical stability and condition number;
- linear transformations in geometry/data;
- projection, basis change and information loss;
- PCA bridge, covariance, SVD and linear models;
- Python/NumPy checks;
- practice tasks and professor-style questions.

## Rules preserved

- Content-only work did not touch boot/runtime.
- Theory source of truth remains `theory_lecture_content.json`.
- Do not move content to `lessons.json`.
- Do not restore E126/E128/E134/E130 view.
- Do not enforce one exact slide count, but enforce the 14-slide quality floor for normal Math theory lessons.

## Next required pass

E144 should be verification-only:

- validate JSON parse;
- count C01 and C02 records;
- check C02 has 6 records;
- check each C02 lesson is not below the 14-slide floor;
- check learner-facing quality and academic coverage;
- confirm no runtime files changed;
- create C02 final verification lock.

End of E143 C02 complete content.
