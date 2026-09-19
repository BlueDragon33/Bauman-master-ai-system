# L23 / B91 — Current Diagnostic Harness

Status: `PENDING_GATE`

## Architecture

B91 deliberately does **not** restore the historical canonical `roadmap_v2/diagnostic.mjs` engine or any historical manifest.

The current harness lives at:

`scripts/roadmap-v2-diagnostic-harness.mjs`

It is validation-only and reads only the current accepted artifacts:

- Consumer Contract V1;
- Consumer Blueprint V1;
- Diagnostic Contract V2;
- Diagnostic Catalog V2;
- current Diagnostic schemas.

## No manifest dependency

The harness validates source fingerprints directly:

- Catalog → Consumer Blueprint Git blob;
- Catalog → Diagnostic Contract Git blob.

There is no historical Consumer manifest, Diagnostic manifest, old baseline commit or byte-count pin.

## Behavior

The harness exposes only:

- `getPlan`;
- `getReadiness`;
- `validateProposedItemBank`;
- `projectProposedSession`;
- `evaluateProposedAttempt`.

It does not attach a proposed bank to the catalog and does not persist an attempt/result.

## Safety rules

- 20 reviewed items exactly;
- 8/6/4/2 difficulty distribution;
- at least one critical item;
- exact target match;
- prerequisite refs must exist;
- active session excludes answer key, rationale and reviewer metadata;
- 80% overall threshold;
- 70% critical floor;
- pass = `existing_competency_verified`;
- critical-floor fail = `critical_gap`;
- below threshold = `gap`;
- `master_ready` is forbidden;
- result `persistable=false`;
- outputs are deep-frozen;
- production integration remains disconnected.

## Test gate

The current suite contains 14 tests covering success, gap classification, answer leakage, malformed banks/attempts, tamper detection, missing files and immutability.

B92 remains blocked until B91 passes the complete current gate set.
