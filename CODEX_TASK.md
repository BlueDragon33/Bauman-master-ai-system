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

Turns 1–20 are accepted.

Next: **Turn 21 — Weakness repair routing**.

Turn 21 requires an architecture upgrade before implementation can continue:

- define one normalized weakness-signal contract across exam, listening, speaking, print/cursive recognition, reading, writing and multimodal review evidence;
- keep source evidence read-only and preserve each source's authority;
- map each weakness type to a focused repair route instead of sending everything to generic `review/wrong`;
- preserve pronunciation Review Queue ownership and SRS scheduling ownership;
- distinguish `opened`, `attempted`, `repair_evidence_present` and `resolved`; opening a repair card must not count as completion;
- allow Turn 19 skill blockers to suggest repair categories without converting readiness into mastery;
- store only additive repair-session state;
- require new evidence after the weakness timestamp before a repair can be marked resolved;
- add negative tests proving no repair route can silently change mastery, completion, due dates or canonical Review Queue state.

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
