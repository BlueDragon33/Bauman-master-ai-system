# RE50 — External HUMAN RU03 handoff

Status: **DEEP HUMAN INTERVENTION REQUIRED · ENGINEERING HANDOFF READY · NOT RELEASED**

RE50 is the deliberate automation stop point for the current 43-item Russian candidate.

## What engineering now guarantees

- Exact RE49 text/context/action/fingerprints are exported for all 43 review items.
- A reviewer cannot be accepted merely because a decision payload says `APPROVE`.
- The reviewer ID must exist in the RU03 reviewer registry, be `HUMAN`, `ACTIVE`, and carry the required qualification:
  - `RUSSIAN_TEXT` for grammar/naturalness/register/semantic review.
  - `RUSSIAN_AUDIO` for stress/pronunciation/intonation/audio-role review.
- Decisions require decision ID, timestamp, exact item ID and exact current fingerprints.
- Stale decisions fail closed.
- AI reviewers fail closed.
- AUDIO approval is impossible while the candidate has no immutable reviewed audio SHA-256.

## Current reviewer registry

`subjects/russian/engine/content/review/ru03-reviewers.v1.json`

It is intentionally empty. No reviewer has been invented or silently authorized.

## What now requires genuine outside intervention

1. Identify at least one qualified Russian-language human reviewer for TEXT review and authorize their stable reviewer ID with evidence of qualification.
2. Produce immutable audio assets for the approved exact text, hash them, then use a qualified Russian audio/phonetics reviewer for AUDIO decisions.
3. Record decisions against the exact RE49 fingerprints. Any content/audio change invalidates the affected decision.

The learner is not expected to perform this linguistic review. Engineering must remain fail-closed until real reviewer evidence exists.
