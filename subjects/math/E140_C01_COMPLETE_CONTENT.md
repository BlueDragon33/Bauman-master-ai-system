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

Theory lessons must not be locked to one exact slide count, but they also must not become too thin.

For Math theory, especially Bauman foundation content, the default quality floor is:

- normal theory lesson: 14–18 slides;
- deep foundational lesson: 16–22 slides when the topic requires depth;
- below 14 slides only for a clearly secondary/review/micro lesson, and the reason must be documented in the lesson note or handoff.

Do not add filler slides just to hit a number.
Do not remove necessary content just to fit a number.
The governing rule is: enough, accurate, necessary.

## Required learner-facing coverage

A theory lesson should normally cover:

- problem framing;
- core concept and intuition;
- notation;
- core formulas;
- assumptions and conditions;
- technical interpretation;
- engineering or AI application;
- common mistakes;
- practice task;
- professor-style checking question;
- bridge to the next concept.

These can be merged or split, but the intellectual coverage must remain complete.

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

A lesson may merge, split or reorder roles when the content requires it, but should not drop core academic coverage.

## Content boundaries

- E140 completes C01 content only.
- It does not touch boot/runtime.
- It does not restore E126/E128/E134/E130 view.
- It does not move Theory content to `lessons.json`.

## Next required pass

E141 should be verification-only:

- validate JSON parse;
- count 6 C01 records;
- check each lesson has enough slides for its academic role;
- flag any theory lesson below 14 slides unless it is explicitly a secondary/review/micro lesson;
- check role/title/body quality without enforcing one exact fixed count;
- confirm C01 appears in learner UI after pull;
- then create C01 final handoff.

End of E140 content completion.
