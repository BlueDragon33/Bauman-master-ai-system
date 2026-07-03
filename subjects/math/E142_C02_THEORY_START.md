# E142 · C02 Theory Start

Status: applied after E141 locked C01.

## Scope

Patched only:

- `subjects/math/data/theory_lecture_content.json`

No boot/runtime/UI files were changed.

## Result

C01 remains complete and locked with 6 theory lessons.

C02 · Ma trận và phép biến đổi tuyến tính now starts with 3 learner-facing theory lessons:

1. `§2.1 · Ma trận như dữ liệu và phép biến đổi`
2. `§2.2 · Phép nhân ma trận và pipeline tuyến tính`
3. `§2.3 · Hạng ma trận, không gian cột và thông tin độc lập`

Each new C02 lesson follows the controlled flexible slide policy and currently uses 16 slides, satisfying the 14-slide quality floor for normal Math theory lessons.

## Content coverage

The new C02 lessons cover:

- matrix as data vs matrix as operator;
- matrix-vector multiplication;
- shape conditions;
- matrix multiplication as composition;
- non-commutativity of matrix multiplication;
- rank, column space, independent information;
- relation to systems, AI, control, PCA and feature redundancy;
- coding checks in Python/NumPy;
- practice and professor-style questions.

## Rules preserved

- Content-only work must not touch boot/runtime.
- Theory source of truth remains `theory_lecture_content.json`.
- Do not move content to `lessons.json`.
- Do not restore E126/E128/E134/E130 view.
- Do not enforce one exact slide count, but enforce the 14-slide quality floor for normal Math theory lessons.

## Next recommended C02 lessons

Continue C02 with:

4. `§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm`
5. `§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu`
6. `§2.6 · Từ ma trận sang PCA và mô hình tuyến tính`

End of E142 C02 start.
