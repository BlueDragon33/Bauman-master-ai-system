# L26-F1 — Scheduler boundary modernization

Status: `ROOT_CAUSE_CONFIRMED · HANDOFF_TO_L26_H1`

## Defect

The quarantined historical L26 scheduler contract had been copied into the static canonical contract surface with these stale upstream identities:

- `BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1`;
- `BAUMAN_ROADMAP_V2_PRIORITY_MANIFEST_V1`.

That boundary no longer matches the accepted current track. L23 rebuilt the consumer surface around `BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1`, while L25 promoted `BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2` and `BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2`. Historical manifests remain quarantined.

## Repair

B101 now points only at the current:

- Consumer Blueprint V1;
- Priority Contract V2;
- Priority Candidate V1;
- Priority Result V2.

The scheduler remains contract-only and disconnected. No historical scheduler engine, manifest, generated schedule, calendar connector or runtime activation was admitted.

## Gate

`scripts/validate-roadmap-v2-l26-b101.mjs` rejects stale manifest identities and pins the read-only/no-write safety boundary.

B102 remains blocked until this repair passes the complete current gate set.


## Failed current gate evidence

Roadmap V2 Current Gate run `35435252436` failed at `Validate static baseline invariants`.

The failure was intentional protection, not a scheduler semantic failure:

- expected frozen blob: `29a6975b9ecefe578a0d68eea62efcdda5b77919`;
- mutated blob: `552c5fa13a57329fa29763249952bbe6b79c7fb9`;
- protected path: `roadmap_v2/scheduler/scheduler-contract.json`.

Therefore the historical static contract must remain byte-identical. Modernization moves to L26-H1 as an additive current-track overlay.
