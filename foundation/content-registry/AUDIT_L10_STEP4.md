# Bauman Foundation — Content, Asset & Provenance Registry — Step 4 Audit

## Scope

Step 4 adds executable provenance-chain and lineage traversal on top of the immutable registry. It remains storage-neutral and UI-neutral.

## Additive contract closure

The V1 provenance record now explicitly defines two optional lineage fields that were already required semantically by the Step 1 policy:

- `inputIds`: asset/content inputs used by transformations and generated outputs;
- `checksumId`: checksum referenced by a `verified` event.

Rules:

- `transformed` requires at least one `inputId`;
- `generated` requires at least one source or input lineage edge;
- `verified` requires a checksum reference;
- `previousEventId` must point to an event for the same subject;
- provenance history and content lineage must be acyclic.

Existing records remain valid because the new fields are required only for the event types whose semantics need them.

## Provenance engine

`provenance-chain.js` provides:

- deterministic events-by-subject ordering;
- same-subject previous-event chain validation;
- timestamp ordering validation;
- lineage DAG cycle detection across asset/content inputs;
- immutable event append followed by full-chain validation;
- recursive lineage tracing from a derived subject to upstream assets/content, original source records, provenance events, and verification checksums;
- latest-event lookup without mutating registry state.

## Safety invariants

1. Published provenance records are never rewritten.
2. Failed appends leave the input registry unchanged.
3. A previous-event edge cannot cross subjects.
4. A transformed event cannot exist without a declared input.
5. A generated event cannot lose all source/input lineage.
6. A verified event cannot exist without a checksum reference.
7. Previous-event cycles and input-lineage cycles fail closed.
8. No browser storage, file storage, network access, learner state, subject UI, or legacy path is changed.

## Gate

Step 4 requires all prior L10 gates plus:

- provenance engine syntax PASS;
- canonical derived-asset lineage trace PASS;
- recursive source recovery PASS;
- verification checksum trace PASS;
- cycle, cross-subject previous event, missing transform input, missing generated lineage, missing verification checksum, reversed timestamp, and invalid timestamp negative tests PASS;
- Windows checkout and Whole System Integration remain green.

Step 5 must not start until the expanded gate is green on GitHub Actions.
