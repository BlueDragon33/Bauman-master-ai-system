# Russian Engine RE20 — Phase 3 RC / Rollout Gate

State: VALIDATING

## Purpose

Aggregate Phase 3 evidence while keeping rollout authority separate from implementation success.

## RC inputs

Required implementation packages:
- RE16;
- RE17;
- RE18;
- RE19.

Required repository workflows:
- Development Fast CI;
- Russian Reference UI;
- Future Interface;
- Prompt Control Center;
- Universal Constitution;
- Whole System Integration.

Required browser evidence:
- grounded source;
- grounded packaged;
- offline shell;
- whole-system browser.

## Rollout ladder

OFF
→ OPT_IN_FLAG
→ INTERNAL_BETA
→ DEFAULT_ON_CANDIDATE
→ DEFAULT_ON

The current Russian Engine learner slice may remain at OPT_IN_FLAG and still be Phase-3 RC-ready.

## Authorization

Moving beyond OPT_IN_FLAG requires explicit product authorization.

DEFAULT_ON additionally requires C3 Release Annex PASS.

Transitions may advance only one state at a time.

Rollback to a lower state remains allowed.

## Important semantics

RE20 PASS:
- means Phase 3 contracts are RC-ready;
- does not claim production;
- does not enable Engine by default;
- does not publish anything.

## Exit gate

PASS when all required Phase 3 packages and regression/browser evidence pass while rollout remains fail-closed.
