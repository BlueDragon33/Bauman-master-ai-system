# E157R · C01 QA Criteria Correction

Status: PASS.

Branch: `codex/e150-c01-l01-clean-replacement`

## Reason

The previous E157 wording was not strict enough. It treated `16 slides` too much like a completion target.

Correction:

- `16 slides` is a minimum structural floor, not an exact target.
- A lesson with exactly 16 slides is not automatically academically complete.
- A lesson must not be compressed down to 16 slides if the concept naturally needs more.
- A lesson must not be stretched with thin filler just to reach 16 slides.
- Academic QA must judge semantic necessity, conceptual flow and teaching value, not slide count alone.

## Correct QA rule

A lesson passes content-depth QA only if:

1. It has enough slides for the concept, with 16 as the minimum floor.
2. Each slide has a clear teaching purpose.
3. Every block adds meaning: concept, formula, condition, example, error case, application, practice or bridge.
4. No slide exists only to fill count.
5. No concept is compressed just to keep the lesson at exactly 16 slides.
6. If a lesson needs 18, 20 or more slides for academic clarity, it should have more slides.
7. If a lesson can be academically complete in 16 dense, meaningful slides, 16 is acceptable.
8. Broad rollout to C02+ requires semantic QA, not only structural QA.

## Revised C01 status

C01 is still structurally complete after E156:

- §1.1-§1.6 exist in runtime.
- E156 verified JSON parse, no mojibake, no duplicate lessonId, C01=6, C02=6, C03=6.

However, the academic verdict must be downgraded from `PASS_WITH_VISUAL_QA_PENDING` to:

`STRUCTURAL_PASS_SEMANTIC_QA_REQUIRED`

## Next recommended task

E158 should be semantic QA first, not visual QA yet.

E158 must check each C01 lesson for:

- whether 16 slides are semantically sufficient;
- whether any lesson is unnaturally compressed;
- whether any slide exists only for count;
- whether any topic needs expansion beyond 16 slides;
- whether C01 can become a real academic template.

Only after E158 semantic QA passes should visual QA of E129/E132 begin.
