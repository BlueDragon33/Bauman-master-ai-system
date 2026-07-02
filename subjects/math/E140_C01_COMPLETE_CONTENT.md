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

## Slide count policy

Theory lessons must not be locked to a fixed slide count.

Use flexible slide length based on the actual academic depth:

- short focused lesson: about 8–10 slides;
- standard lesson: about 10–14 slides;
- deep foundational lesson: about 14–18 slides;
- longer only when the topic truly requires it.

Do not add filler slides just to hit a number.
Do not remove necessary content just to fit a number.

## Recommended slide roles

The following roles are useful as a teaching skeleton, not a mandatory checklist:

- problem_framing
- deep_essence
- counter_intuition
- real_bridge
- notation
- core_formula
- assumption_gate
- mini_case
- interpretation
- simulation
- common_mistakes
- application
- practice
- professor_qa
- bridge
- takeaway

A lesson may skip, merge, split or reorder roles when the content requires it.

## Content boundaries

- E140 completes C01 content only.
- It does not touch boot/runtime.
- It does not restore E126/E128/E134/E130 view.
- It does not move Theory content to `lessons.json`.

## Next required pass

E141 should be verification-only:

- validate JSON parse;
- count 6 C01 records;
- check every lesson has a reasonable non-empty slide set;
- check role/title/body quality without enforcing a fixed count;
- confirm C01 appears in learner UI after pull;
- then create C01 final handoff.

End of E140 content completion.
