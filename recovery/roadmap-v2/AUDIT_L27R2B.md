# L27R2B — Static contract/schema transplant

## Purpose

Admit only the historically validated Roadmap V2 contract and schema layer to canonical `roadmap_v2/**` paths on the modern runtime.

## Admitted surface

23 JSON files:

- Consumer contract + schema;
- Diagnostic contract + attempt/catalog/item-bank/contract schemas;
- Mastery contract + evidence/snapshot/contract schemas;
- Priority contract + candidate/result/contract schemas;
- Scheduler contract + request/result/contract schemas;
- Readiness contract + request/result/contract schemas.

## Controlled repair

The Consumer contract uses the R2B0-approved provenance correction:

- invalid historical path: `subjects/math/theory-framework.json`
- valid path: `subjects/math/data/theory-framework.json`

No other Consumer semantics are changed.

## Quarantine

The historical migration contract is **not** admitted because it pins baseline `e383912...` and stale inventory fingerprints. It remains evidence-only until L27R3 regenerates the baseline against the modern source.

## Hard boundaries

- executable engines: 0
- generated Roadmap data: 0
- UI/runtime entrypoints: 0
- production integration: disconnected
- runtime activation: false
- migration execution: 0

## Exit gate

R2B passes only if every admitted blob matches its approved source, the canonical tree contains exactly the 23 approved JSON files, all contracts remain production-disconnected, and the migration contract remains quarantined.
