# CODEX_TASK

Task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Mode: `SEQUENTIAL_GATED_DEVELOPMENT`

## Canonical plan

Use only:

`subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

for the current 24-turn status, entry/exit rules, deferred obligations, and next turn.

## Pedagogy target

The beginner learning loop is:

`hear → imitate/shadow → speak → recognize print → recognize cursive → connect sound↔letter → understand visually/in context → read → write → reuse in dialogue`.

Listening and speaking remain recurrent priorities rather than a one-time phase.

## Vocabulary rule

Learner-facing vocabulary meaning must not be Vietnamese translation.

Use visual, audio and context evidence. Vietnamese may remain in navigation/help text but is not semantic authority for vocabulary.

English is not the default translation bridge either.

## Current work

Turns 1–10 are accepted.

Next: **Turn 11 — Visual asset coverage**.

Turn 11 must:

- audit all 8,000 vocabulary items against the Turn 10 semantic contract;
- distinguish explicit visual assets from text labels/context only;
- create deterministic visual semantic status without using Vietnamese or English meaning fields;
- represent gaps as `missing_visual_semantics`;
- keep the classifier non-authoritative until Turn 13;
- preserve the existing source corpus and learner state.

## Gate rule

For each turn:

1. contract first;
2. validator;
3. negative tests;
4. smallest runtime/data change;
5. new-turn gate;
6. existing Russian regression;
7. update the canonical plan only after green.

A failure is fixed before proceeding. Do not weaken assertions merely to obtain green CI.
