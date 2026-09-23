# Math Learning Application Rebuild — LƯỢT 12 Simulation Context Gate

## Goal
Make simulation part of the lesson flow, not a separate generic destination pretending to be lesson-specific.

## Source audit
- theory lessons audited: 18
- lessons with embedded semantic `role: simulation`: 17
- embedded simulation slides: 17
- canonical `simulation_content.json` records: 0
- sampleRecord status: DRAFT
- sampleRecord is not treated as learner content

The one theory lesson without an embedded simulation role is:
- `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`
- §1.6 · Từ vector sang ma trận dữ liệu

The UI must therefore omit a lesson-simulation CTA for that lesson rather than fabricate one.

## Problem found
The Lesson Player previously showed a lesson-context simulation button but opened the generic Math Workspace Lab using a keyword-derived mode (vector/matrix/function).

That behavior could misrepresent a general-purpose lab as a simulation mapped to the current lesson.

## Changes
1. Lesson Player simulation CTA is now explicitly **Mô phỏng trong bài**.
2. When the current lesson contains a semantic simulation role, the CTA activates the lesson's `visualize` step and highlights the mapped source slide.
3. It no longer launches the generic Math Lab as a fallback.
4. When no mapped simulation exists, no simulation CTA is rendered from the lesson role map.
5. `math-simulation-source.js` no longer treats the generic Math Lab as a lesson fallback.
6. Generic Math Lab remains available only as an advanced resource/tool.
7. `simulation_content.json.sampleRecord` remains DRAFT and is never used as real lesson content.

## Additional regression repaired
During this pass the Chapter → Lesson route still contained collection lookups using `$().find()`.
They were corrected to `$$().find()` so stage/chapter/lesson selectors operate on arrays.

## Gate
- lesson simulation bound to current lesson semantic role: PASS
- generic lab no longer masquerades as lesson simulation: PASS
- canonical simulation records not fabricated: PASS
- DRAFT sampleRecord not used: PASS
- lesson with missing simulation safely omits the feature: PASS
- existing 17 embedded simulation slides remain available: PASS
- Chapter → Lesson collection selector regression fixed: PASS
- academic JSON writes introduced: 0

## LƯỢT 12 result
**PASS**

Next: LƯỢT 13 integrates exercises and feedback. Wrong answers must explain the error and route the learner back to the relevant concept rather than merely showing a correct option.
