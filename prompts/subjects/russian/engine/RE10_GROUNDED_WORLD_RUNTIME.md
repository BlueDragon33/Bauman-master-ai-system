# RE10 — GROUNDED WORLD RUNTIME

Canonical owners: RU02 + RU03 + RU05 + RU08 + C4

Mission: grow the first listen-and-act slice into a reusable world runtime where Russian meaning is grounded through objects, people, actions, space, time, intent and consequence.

## Hard boundary
Write by default only inside:
- subjects/russian/engine/**
- subjects/russian/docs/engine/**
- prompts/subjects/russian/engine/**

No default-on UI activation.
No general app write without a new explicit allowlist.

## Runtime requirements
World definitions are data, not DOM scripts.
A world may contain:
- entities;
- roles;
- properties;
- spatial relations;
- action affordances;
- hidden/visible facts;
- goals;
- consequences;
- support cues;
- evidence targets;
- transfer groups.

An action must be validated against world state.
Success changes world state.
Wrong action must not create fake success state.

## Semantic progression
Support:
OBJECT → PROPERTY → ACTION → LOCATION → POSSESSION → QUANTITY → SEQUENCE → INTENTION → EVENT.

Meaning must remain available without Vietnamese translation.

## Support ladder
Keep RE02 support escalation.
Translation remains last-resort support.
Transcript is not default for listening-first tasks.

## Transfer
Every core world primitive requires unseen recombination:
same meaning, changed object/speaker/order/location.

## Authority
World semantic metadata may be Engine-owned.
Russian linguistic text/forms remain RU03-owned or explicitly fixture/noncanonical.

## Exit
PASS when one world definition can generate multiple valid experiences and state transitions, with deterministic evidence and transfer, without learner-state/mastery writes.
