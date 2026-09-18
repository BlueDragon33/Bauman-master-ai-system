# L24-H1 — Current Prerequisite Policy Projection

Status: `PENDING_GATE`

## Trigger

B95 requires exact prerequisite semantics for blocking, just-in-time, alternative, concurrent, recommended and contextual relationships.

The current Consumer Blueprint contains resolved prerequisite IDs and raw prerequisite text, but intentionally does not encode edge types.

Using the historical prerequisite graph directly would re-admit a baseline-bound generated artifact and would also preserve an old classification defect where modifiers could apply to an entire prerequisite sentence.

## Current solution

A read-only projection is rebuilt from the accepted Consumer Blueprint at validation time.

No canonical graph file is written.

### Segment-scoped classification

Modifiers are applied to the segment they belong to, not to the whole prerequisite sentence.

Examples:

- `PY-L2-C04; DB-L1-C02 được khuyến nghị`
  - PY-L2-C04 = blocking
  - DB-L1-C02 = recommended
- `ML-L1-C01; RU-R3-C07 đang song hành`
  - ML-L1-C01 = blocking
  - RU-R3-C07 = concurrent
- `ML-L1-C01; MATH-L1-C03–C04; MATH-L3-C09-L02–L03 học just-in-time`
  - only the last two lesson refs are just-in-time
- `MATH-L0-C01 hoặc Existing Competency xác nhận`
  - internal prerequisite + external gate share one any-of group.

## Validation

H1 requires:

- all current prerequisite refs assigned exactly once to a segment;
- all external gates assigned;
- no missing/unknown/self references;
- no duplicate edges;
- no prerequisite cycle;
- all six edge semantics present;
- deterministic projection;
- Consumer Blueprint byte-identical before/after;
- historical `roadmap_v2/graph/prerequisite-graph.json` remains quarantined.

B95 remains blocked until H1 and all six project gates pass.
