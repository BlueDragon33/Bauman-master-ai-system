# L26-F1 — Scheduler boundary modernization

Status: `FIX_APPLIED_PENDING_GATE`

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
