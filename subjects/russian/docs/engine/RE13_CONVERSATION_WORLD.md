# Russian Engine RE13 — Conversation World

State: VALIDATING

## Purpose

Conversation is modeled as a world with goals and facts, not as an empty chat transcript.

## Current fixture

CW-DORM-001:
- location: dorm room;
- first meeting;
- learner + roommate;
- unexpected fast turn;
- repair options: ask repeat / ask slower;
- final coordination goal.

## Runtime state

Tracks:
- current node;
- turn;
- repair used;
- observed communicative functions;
- completion;
- event history.

## AI boundary

AI variation may change surface wording later.

It may not:
- change canonical world facts;
- change scenario goal;
- grant mastery.

A variation that does so fails validation.

## Offline path

The world runtime is deterministic and does not require AI.

Optional AI can be layered later without becoming truth owner.

## Exit gate

PASS when a misunderstanding can be repaired and the learner can reach the goal while deterministic world truth remains immutable to AI.
