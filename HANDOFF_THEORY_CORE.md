# HANDOFF THEORY CORE

Continue the Bauman Math project in repository `BlueDragon33/Bauman-master-ai-system`, branch `main`.

Current phase: `THEORY_CORE_FIRST`

## Mandatory order
1. Core content
2. `Tham khảo thêm` reference table
3. Slideshow
4. `Xem đầy đủ`
5. Final formula and layout normalization

Do not skip ahead.

## Gold standard
- Lesson `§1.1 · Vector như dữ liệu kỹ thuật` is the gold-standard candidate.
- Read:
  1. `CODEX_STATE.md`
  2. `subjects/math/data/theory_core/theory_core_manifest.json`
  3. `subjects/math/data/theory_core/theory_core_c01_l01.json`
- Use lesson 1.1 structure and quality gates for every later lesson.

## Current architecture
- Core content is presentation-independent.
- Do not add slide numbers, popup labels, CSS, animation, or layout instructions to core JSON.
- Downstream files may summarize core content but may not contradict it.
- E235 remains the approved `Xem đầy đủ` visual baseline, but UI work is paused until core, reference, and slideshow phases are complete.
- Do not re-enable E236, E237, or E238.

## Next task
Create canonical core content for `§1.2 · Chuẩn vector và khoảng cách` as:
`subjects/math/data/theory_core/theory_core_c01_l02.json`

Use the same schema and depth as lesson 1.1. Include:
- thesis and prerequisites
- measurable learning outcomes
- exact notation rules
- norm axioms
- L1, L2, Linf and weighted norms
- metric axioms
- Euclidean and weighted distance
- normalization/standardization effects
- assumption and data-quality gates
- one complete worked engineering case with numerical results
- applications to robot error, anomaly detection, nearest neighbor, and signal comparison
- misconceptions and failure modes
- mastery checks
- implementation contract
- bridge to §1.3 and Chapter 2
- downstream mapping and quality gate

## Token rules
- Do not scan the whole repo.
- Do not modify UI/runtime files in this phase.
- Do not rewrite `theory_lecture_content.json` yet.
- Work on one lesson core file per task.
- Update `theory_core_manifest.json` and `CODEX_STATE.md` after each completed lesson.
