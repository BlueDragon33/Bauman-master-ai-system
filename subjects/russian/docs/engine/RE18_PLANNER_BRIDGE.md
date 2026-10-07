# Russian Engine RE18 — Existing Planner Candidate Bridge

State: **PASS**

## Purpose

Allow Engine to propose tasks in the current RussianAdaptivePlanner vocabulary without becoming a second Today/planner owner.

## Compatibility

The bridge validates the current planner schema and required reason codes:
- due_review;
- weakness_repair;
- skill_balance;
- continue_path.

## Candidate semantics

Engine may emit deterministic candidate tasks for:
- due review;
- weakness remediation;
- transfer;
- validated next experience.

Candidates use the current planner task shape:
id, label, skill, reason, route, priority, source.

## Stability

Candidate identity is stable from:
kind + target/ref + revision.

Duplicate review refs collapse.

Unchanged evidence/revision yields identical candidates.

## Capability failure

If an experience requires a capability that is unavailable, the introduce candidate is omitted.

No fake fallback task is created.

## Important boundary

The bridge deliberately does NOT use setManualOverride().

That API represents explicit human priority, and Engine must not impersonate a manual override.

RussianAdaptivePlanner remains the final plan owner.

A future app-owner change may add a candidate-source seam under a separate explicit allowlist.

## Exit gate

PASS when planner compatibility is checked, candidates are deterministic/deduplicated, unavailable capabilities fail closed, manual override is unused and final-plan authority remains outside Engine.


## Exact-head validation evidence

Validated implementation HEAD:

`dfc4bdfb1aaa55352b7a275c3eeec52fe8b9aa93`

Evidence:
- manual Phase 3 exact-content harness: **24/24 PASS**;
- Development Fast CI: **PASS**;
- Russian Engine isolated auto-discovered suite: **PASS**;
- Russian Reference UI Gate: **PASS**;
- Prompt Control Center CI: **PASS**;
- Universal Constitution Compliance: **PASS**;
- Whole System Integration Gate: **PASS**;
- Russian Engine grounded slice source acceptance: **PASS**;
- Russian Engine grounded slice packaged acceptance: **PASS**;
- Russian true-offline shell acceptance: **PASS**;
- whole-system browser acceptance: **PASS**;
- Future Interface System CI: **NOT_REQUIRED**, scope proof: Phase 3 changes only Engine prompt/docs/modules and introduces no UI or browser-loaded runtime modification.

**STATE: PASS.**
