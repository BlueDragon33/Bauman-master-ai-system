# L25/B99 — Stable Priority Ranking / Strict Validation

Status: `PASS`

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


## Full gate evidence

Accepted B99/F4 head: `601a5d4fb7ba0a62f37847ebbb27a2f9a4457da7`

- Roadmap V2 Current Gate — run `35341919312` — PASS
- Foundation Domain Model — run `35341919148` — PASS
- Windows checkout safety — run `35341919160` — PASS
- Russian Reference UI — run `35341919206` — PASS
- Cloudflare Preview — run `35341919204` — PASS
- Whole System Integration — run `35341919158` — PASS


B99 is closed. B100 closeout may begin.
