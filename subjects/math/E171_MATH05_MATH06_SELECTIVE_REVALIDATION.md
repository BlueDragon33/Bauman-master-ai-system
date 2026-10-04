# E171 · MATH05/MATH06 Selective Revalidation for E170

Date: 2026-10-04
Branch: `revalidate/math-e170-math05-math06-20261004`
Base: `0ddac7831072d8856f95391a3cf49991d56ac1bc`
Status: VALIDATING

## Trigger

E170 changed the learner-facing Math hierarchy/activity router after the prior MATH06 RC.

Under MATH00 this is a selective revalidation trigger, not a new Math phase.

## Change classification

- MATH05: learner surface / product integration affected.
- MATH06: browser, responsive and RC acceptance affected.
- MATH02: no mathematical truth/schema change.
- MATH03: no evaluator/reasoning/evidence change.
- MATH04: no computation/provider capability change.

## Added regression

- Static E170 route/source and chapter-isolation contract.
- Browser journey across Bài tập, Thực hành, Ứng dụng, Ôn tập, Kiểm tra.
- Truthful zero-record behavior on C03 to prove no cross-chapter fill.
- Return-to-theory check to preserve E129 Reader.
- Mobile overflow + console/network cleanliness.

Final PASS evidence will be recorded only after CI/browser gates succeed.
