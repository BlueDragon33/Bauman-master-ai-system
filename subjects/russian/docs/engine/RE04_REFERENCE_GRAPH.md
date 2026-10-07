# Russian Engine RE04 — Reference Knowledge Graph & Content Runtime

State: **PASS**

## Design decision

RE04 does not copy Russian linguistic truth into Engine.

It builds a reference graph.

Canonical-ref nodes contain:
- owner path;
- stable canonical ID;
- current trust/authority status.

They do NOT contain copied Russian text.

## Current canonical references

The initial graph verifies references against current owners:

- `subjects/russian/data/grammar.json#GR006`
- `subjects/russian/data/scenario-registry.json#P11-ADMIN-RECEPTION`
- `subjects/russian/data/scenario-registry.json#P11-LIFE-ROOMMATE`

The graph preserves the current provenance reality:
these datasets are not silently promoted beyond their RU03 trust status.

## Engine semantic nodes

Engine-local semantic metadata includes concepts such as:
- request object;
- need/request/permission;
- communication repair.

These are routing/learning-architecture concepts, not new linguistic authority.

## Multiple experiences from one concept

`SEM-REQUEST-OBJECT` points to both RE02 fixture scenes:
- grounded-give-ball-a;
- grounded-give-book-b.

The runtime can therefore ask:
`experienceSources(conceptId)`

and receive multiple content refs without embedding either lesson into UI code.

## Canonical dependency query

The runtime can ask:
`canonicalDependencies(conceptId)`

and obtain stable references to existing grammar/scenario owners.

The caller decides how and when to resolve those refs.

## No eager corpus load

Graph runtime receives indexes/resolvers through dependency injection.

It does not load vocab/dialogue/grammar corpora globally at startup.

This preserves lazy/chunk-aware architecture.

## Files

- `subjects/russian/engine/content/graph/reference-graph.v1.json`
- `subjects/russian/engine/schemas/reference-graph.schema.json`
- `subjects/russian/engine/knowledge/reference-graph.mjs`
- `subjects/russian/engine/tests/test-re04-reference-graph.mjs`

## Validation

Executed against current Engine graph plus existing canonical grammar/scenario owners: **10/10 checks PASS**.

Validated:
- 11 graph nodes and 9 edges;
- no dangling canonical refs;
- two experience sources for one semantic concept;
- two canonical repair-scenario dependencies;
- GR006 canonical dependency resolves;
- canonical-ref nodes copy zero Russian text.

## Exit

**RE04 PASS.**
