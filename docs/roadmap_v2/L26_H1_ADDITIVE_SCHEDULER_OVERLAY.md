# L26-H1 — Additive current Scheduler contract overlay

Status: `PASS`

## Why this hardening exists

L26-F1 correctly identified stale historical Consumer/Priority manifest identities, but the first repair mutated `roadmap_v2/scheduler/scheduler-contract.json`.

Roadmap V2 Current Gate run `35435252436` rejected that change because the file belongs to the frozen 23-file R2B static admission baseline. Weakening or repinning that protection would make recovery provenance ambiguous.

## Additive repair

- Restore `roadmap_v2/scheduler/scheduler-contract.json` byte-for-byte to the frozen historical baseline.
- Add `roadmap_v2/scheduler/current-contract.json` as the current L26/B101 contract.
- Current overlay targets Consumer Blueprint V1 + Priority Contract V2 + Priority Result V2.
- Keep the historical static contract available only as provenance evidence.
- B101 validator checks both sides: frozen historical identity stays intact; current overlay contains no stale manifest dependency.

## Safety

- no executable Scheduler engine admitted;
- no generated schedules;
- no calendar read/write;
- no persistence;
- no runtime activation;
- no production integration;
- no change to Hub/Math/Russian/Device Gate runtime.

B102 stays blocked until the complete gate set is green on this additive overlay.


## Accepted gate evidence

Accepted functional head: `3b3828c8176380b754e6bd3c897aed46e4780987`.

- Roadmap V2 Current Gate `35435321959` — PASS
- Foundation Domain Model `35435321942` — PASS
- Windows checkout safety `35435321854` — PASS
- Russian Reference UI `35435321919` — PASS
- Cloudflare Preview `35435321875` — PASS
- Whole System Integration `35435322007` — PASS

The frozen Scheduler baseline and additive current overlay coexist without widening production/runtime boundaries.
