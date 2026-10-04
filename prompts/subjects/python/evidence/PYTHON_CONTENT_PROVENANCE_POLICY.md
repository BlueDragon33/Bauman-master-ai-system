# PYTHON CONTENT PROVENANCE POLICY

## Provenance classes

- `AUTHORITATIVE_LANGUAGE`: official Python language reference/documentation.
- `AUTHORITATIVE_PACKAGE`: official versioned third-party package documentation.
- `CURATED_REVIEWED`: human-reviewed project content reconciled with authoritative sources.
- `DERIVED`: mechanically/analytically derived from canonical data with traceable inputs.
- `GENERATED_CANDIDATE`: AI/generated content awaiting review.
- `LEGACY`: preserved historical content not yet canonicalized.
- `UNKNOWN`: insufficient authority; never canonical by default.

## Canonicalization rule

Generated/AI content is non-authoritative until reviewed under content governance. A canonical entity must record source/authority class, reviewer or derivation rule where applicable, and version scope.

## Example/task provenance

Examples and tasks must identify the language/package contract they rely on and any external theory owner. Hidden official tests/answers are never exposed through learner or AI surfaces.

## Change control

Identity/order/schema changes require versioned migration, backward compatibility and rollback planning. Provenance metadata may be improved additively without rewriting learner state.

