# L25-H1 — Priority Result Schema Explainability Alignment

Status: `PASS`

## Trigger

B98 pre-audit found a historical interface mismatch:

- the historical Priority engine emitted `weights` and `weeksUntilNeeded`;
- historical `priority-result.schema.json` used `additionalProperties: false`;
- those two emitted fields were absent from the schema.

That means an engine result could be logically useful yet invalid against its own declared result schema.

## Upgrade

Current Priority result schema is now `BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2`.

It explicitly models:

- normalized features;
- exact 35/30/20/15 weights;
- per-feature contributions;
- weighted score;
- `weeksUntilNeeded` for ranking tie-break explanation;
- optional `rank` for ranked output;
- critical/review dispositions;
- `masterReady`;
- persistence and scheduler-write locks;
- reason codes.

Priority Contract V2 now pins both:

- `BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1`;
- `BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2`.

## Safety

No scoring engine is admitted to canonical `roadmap_v2/**`.

Historical Priority manifest and executable remain quarantined. Production integration, persistence, scheduler write and runtime activation remain disabled.

B98 remains blocked until H1 passes all six project gates.


## Gate evidence

Accepted H1 head: `9a2d5c2fec7b2a438ae6379ac7e3497e96fffc75`

- Roadmap V2 Current Gate — run `35337468983` — PASS
- Foundation Domain Model — run `35337469011` — PASS
- Windows checkout safety — run `35337469107` — PASS
- Russian Reference UI — run `35337468997` — PASS
- Cloudflare Preview — run `35337469013` — PASS
- Whole System Integration — run `35337468991` — PASS

H1 is closed. B98 may proceed.
