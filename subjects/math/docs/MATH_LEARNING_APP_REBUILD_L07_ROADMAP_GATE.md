# Math Learning Application Rebuild — LƯỢT 7 Roadmap Gate

## Goal
Make Lộ trình a trustworthy learner route using authoritative chapter IDs and evidence-based status/progress.

## Source-of-truth correction
The first L05 roadmap used `theory-framework.json` chapter IDs. Audit found:
- framework chapters checked: 21
- exact matches to E129 authoritative frame IDs: **0**

That made the roadmap visually valid but its chapter CTA could fail.

L07 replaces that mapping with:
- `curriculum.json` for Stage → canonical chapterIds
- `theory_lecture_frame.json` for canonical chapter metadata
- `theory_lecture_content.json` for actual lesson availability

`theory-framework.json` is no longer used as the roadmap routing source.

## Relationship defect found and fixed
Initial L07 validation found 6 theory records for C03 using the historical chapter ID:
`MATH-VN-C03-giai_tich_dao_ham_gradient`

Canonical frame/curriculum ID:
`MATH-VN-C03-ham_so_ao_ham_va_gradien`

All 6 records were remapped to the canonical chapter ID. Lesson IDs were preserved.

Post-fix:
- curriculum chapter IDs: 56
- frame chapter IDs: 56
- exact curriculum/frame coverage: 56/56
- theory content records: 18
- orphan theory records: 0

## Roadmap UX
For each chapter, the route now shows only source-supported data:
- chapter number/title
- discipline
- target outcome
- actual content lesson count vs planned lesson count
- content status
- evidence-based learner progress
- learner status

Current status rules:
- **Chưa có học liệu**: no actual lesson records
- **Chưa học**: content exists but learner state has no visited step
- **Đang học**: at least one lesson has recorded step activity
- **Đang khóa**: only if canonical frame says `locked: true`

The system does **not** claim “Đã đạt” or “Cần ôn” yet because real completion/mastery evidence belongs to later passes.

## Progress ownership
No chapter progress engine was duplicated.

`math-learning-flow.js` exposes a read-only `chapterSnapshot(lessonIds)` over its existing learner state. Roadmap consumes this as “đã học qua”, not mastery/completion.

## CTA behavior
- Chapter with real content and not locked → Học chương này
- Chapter without content → disabled “Chưa thể mở”
- CTA uses canonical E129 chapter ID

## Gate
- 56/56 curriculum chapter IDs exist in frame: PASS
- theory records map to a canonical chapter: PASS
- orphan theory records: 0 PASS
- roadmap route source aligned with E129: PASS
- navigation JS syntax: PASS
- roadmap CSS `!important`: 0
- no fabricated prerequisite/duration/mastery/completion: PASS

## Result
**PASS**

Next: LƯỢT 8 builds a Chapter page between Roadmap and Lesson Player so the learner sees chapter purpose, progress and ordered lessons before entering a lesson.
