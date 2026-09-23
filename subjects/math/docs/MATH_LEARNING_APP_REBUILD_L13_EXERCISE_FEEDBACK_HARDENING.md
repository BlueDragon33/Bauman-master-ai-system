# Math Learning Application Rebuild — LƯỢT 13 Exercise + Feedback Hardening

## Result
**PARTIAL — RUNTIME CONTRACT PASS / CONTENT COVERAGE BLOCKED**

## What is implemented
- Added `schemas/exercise-feedback.schema.json`.
- Auto-grading is enabled only for canonical records with deterministic answer + feedback contract.
- Supported deterministic types: multiple choice, numeric, exact text.
- Wrong-answer feedback comes from the record source.
- Wrong-answer recovery can route to a source-declared lesson step.
- Incomplete records remain self-check/manual.
- DRAFT sample records are never learner content.
- Activity Studio no longer falls back to the generic Math Lab when a lesson simulation is absent.

## Source limitation
Current `exercise_content.json` has 0 real records and legacy `exercises.json` is empty.
Therefore the UI infrastructure is ready, but useful automatic exercise feedback cannot be claimed as content-complete.

## Gate
- deterministic feedback contract: PASS
- no inferred/fabricated grading: PASS
- retry-to-step runtime path: PASS
- real canonical exercise coverage: BLOCKED BY CONTENT
- learner fallback without fake grading: PASS
