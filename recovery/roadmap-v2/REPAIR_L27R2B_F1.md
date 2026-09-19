# L27R2B-F1 — Make the global reconciliation gate phase-aware

## Trigger

Roadmap V2 Reconciliation Gate run `35325927158` failed at `Validate reconciliation state` immediately after L27R2B began.

## Root cause

The global reconciliation validator was still frozen to the prior R2B0 phase:

- it required `manifest.phase === L27R2B0_CONTRACT_HYGIENE`;
- it required canonical `roadmap_v2/**` to be absent;
- it required R2B0 to remain `in_progress` and R2B to remain blocked.

Those assertions were phase-local controls, not permanent recovery invariants.

## Fix

The global validator is now phase-aware. It permanently checks:

- current-runtime ancestry;
- historical L27/B108 source-of-truth;
- prior green gate evidence;
- protected-path drift counts;
- Foundation L10 isolation;
- L28/B109 lock until L27R6;
- exactly one active recovery phase;
- all completed predecessors are PASS;
- all later phases remain blocked.

For R2B specifically it additionally requires the canonical Roadmap contract tree, exactly 23 admitted files in the manifest, zero executable/generated/runtime changes, production-disconnected mode, and continued migration-contract quarantine.

## Safety

This repair changes only recovery validation logic and documentation. It does not alter runtime, UI, learner data, Math content, Russian behavior, Foundation state, storage or packaging.
