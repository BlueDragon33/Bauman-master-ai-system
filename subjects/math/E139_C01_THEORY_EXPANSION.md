# E139 · C01 Theory Expansion

Status: applied after E138 cleaned the first C01 lesson.

## Scope

Patched only:

- `subjects/math/data/theory_lecture_content.json`

No boot/runtime/UI files were changed.

## Added lessons

C01 was expanded with learner-facing theory records:

1. `§1.1 · Vector như dữ liệu kỹ thuật`
2. `§1.2 · Chuẩn vector và khoảng cách`
3. `§1.3 · Tích vô hướng, góc và phép chiếu`

## Slide count policy

The 16-role structure used in this pass is a teaching skeleton, not a hard requirement.

Going forward, lesson length should be flexible:

- short focused lesson: about 8–10 slides;
- standard lesson: about 10–14 slides;
- deep foundational lesson: about 14–18 slides;
- longer only if the topic truly requires it.

Do not add filler slides to reach a fixed count.
Do not remove necessary content to fit a fixed count.

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
