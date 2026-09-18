# L25/B99 — Stable Priority Ranking / Strict Validation

Status: `PENDING_GATE`

## Ranking order

1. Critical override first.
2. Weighted score descending.
3. Weeks until needed ascending, with missing date last.
4. Target ID ascending.

## Determinism

B99 requires the same ranked result for the same candidate set regardless of input order.

Every ranked result:

- remains Priority Result V2;
- receives a 1-based `rank`;
- remains deeply frozen;
- remains non-persisted;
- cannot write the scheduler.

## Fail-closed rules

- duplicate candidate ID: reject;
- duplicate target ID: reject;
- non-array ranking input: reject;
- all B98 candidate/snapshot validation remains active before sorting.

## Safety

No canonical Priority executable or manifest is admitted. Production integration, persistence, scheduler write and runtime activation remain disabled.

B100 remains blocked until B99 and all six project gates pass.
