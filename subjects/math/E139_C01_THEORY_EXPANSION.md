# E139 · C01 Theory Expansion

Status: applied after E138 cleaned the first C01 lesson.

## Scope

Patched only:

- `subjects/math/data/theory_lecture_content.json`

No boot/runtime/UI files were changed.

## Added lessons

C01 now contains 3 learner-facing theory records:

1. `§1.1 · Vector như dữ liệu kỹ thuật`
2. `§1.2 · Chuẩn vector và khoảng cách`
3. `§1.3 · Tích vô hướng, góc và phép chiếu`

Each record keeps 16 slide roles:

1. problem_framing
2. deep_essence
3. counter_intuition
4. real_bridge
5. notation
6. core_formula
7. assumption_gate
8. mini_case
9. interpretation
10. simulation
11. common_mistakes
12. application
13. practice
14. professor_qa
15. bridge
16. takeaway

## Content rules preserved

- Theory source of truth remains `theory_lecture_content.json`.
- Do not move content to `lessons.json`.
- Do not restore E126/E128/E134.
- Do not add a new reader UI layer.
- Content-only work must not touch boot/runtime.

## Next recommended lessons

Continue C01 with:

4. `§1.4 · Cơ sở, span và tọa độ`
5. `§1.5 · Không gian con và biểu diễn dữ liệu`
6. `§1.6 · Từ vector sang ma trận dữ liệu`

End of E139 expansion.
