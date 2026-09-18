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

English is not the default semantic bridge either.

## Current work

Turns 1–19 are accepted.

Next: **Turn 20 — AI mentor direct explanation**.

Turn 20 requires an architecture upgrade before implementation can continue:

- add an explicit AI explanation-policy contract;
- enforce explanation order: Russian/context/visual/action/contrast/analogy first;
- prohibit Vietnamese/English vocabulary meaning as the default learner-facing answer;
- allow meta-language support only as a secondary help layer, not semantic authority;
- reuse direct-semantic vocabulary descriptors instead of legacy translation fields;
- keep the AI layer read-only for mastery, completion, Review Queue and scheduling;
- add negative tests proving translation fallback cannot re-enter the AI surface;
- preserve current context/canonical identity integration.

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
