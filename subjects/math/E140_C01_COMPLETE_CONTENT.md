# E140 · C01 Complete Content

Status: applied after E139 expanded C01 to three lessons.

## Scope

Patched only:

- `subjects/math/data/theory_lecture_content.json`

No boot/runtime/UI files were changed.

## Result

C01 · Vector trong không gian dữ liệu now contains 6 learner-facing theory lessons:

1. `§1.1 · Vector như dữ liệu kỹ thuật`
2. `§1.2 · Chuẩn vector và khoảng cách`
3. `§1.3 · Tích vô hướng, góc và phép chiếu`
4. `§1.4 · Cơ sở, span và tọa độ`
5. `§1.5 · Không gian con và biểu diễn dữ liệu`
6. `§1.6 · Từ vector sang ma trận dữ liệu`

Each lesson keeps the 16-role slide structure:

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

## Content boundaries

- E140 completes C01 content only.
- It does not touch boot/runtime.
- It does not restore E126/E128/E134/E130 view.
- It does not move Theory content to `lessons.json`.

## Next required pass

E141 should be verification-only:

- validate JSON parse;
- count 6 records;
- verify each record has 16 slides;
- verify role order consistency;
- confirm C01 appears in learner UI after pull;
- then create C01 final lock/handoff.

End of E140 content completion.
