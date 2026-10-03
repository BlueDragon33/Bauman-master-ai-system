# 03 — Platform Foundation

The Foundation is the part of the building that should change least as new floors are added.

## Foundation pillars

1. Canonical Identity
2. Domain Model
3. Versioned Schemas
4. Manifest Contracts
5. Registry Contracts
6. Capability Registry
7. Permission Model
8. Storage Abstraction
9. Event Contract
10. Provenance
11. Extension Contract
12. Learning Contract

## Canonical identity

Retain the existing `bd:<kind>:<namespace>:<localId>` philosophy.

Display text, route strings, array indexes and filenames must never become durable identity.

New entity kinds require an architecture decision, not ad-hoc string invention.

## Contract-first rule

Every platform-level concept must have:

- schema name;
- schema version;
- compatibility rules;
- owner;
- allowed mutation authority;
- validation;
- migration behavior.

A UI component is never the definition of a business concept.

## Ports

Foundation services expose ports, not storage technology:

- `IdentityPort`
- `ContentRegistryPort`
- `LearnerStatePort`
- `EvidenceStorePort`
- `SearchPort`
- `OfflinePort`
- `ExtensionHostPort`
- `TelemetryPort`

Implementations may be local memory, IndexedDB, packaged JSON, D1 or future providers.

## Event contract

Events are notifications, not hidden authority.

Examples:

- `lesson.opened`
- `resource.opened`
- `practice.completed`
- `assessment.submitted`
- `evidence.created`
- `mastery.changed`
- `extension.loaded`

Event payloads must carry version and canonical IDs.

Consumers must be idempotent where replay is possible.

## Capability model

Features are resolved by capability, not by subject-name conditionals.

Examples:

- `resource.pdf.read`
- `resource.pdf.annotate`
- `speech.record`
- `speech.evaluate`
- `assessment.quiz`
- `assessment.code`
- `simulation.run`
- `ai.explain`

Subject-specific capability aliases may exist only through namespaced extensions.

## Foundation anti-corruption layer

Legacy subject stores remain valid while adapters translate them into canonical read models.

Do not perform a big-bang storage rewrite.

## Foundation completion test

Foundation is ready only when a vertical slice can use identity, registry, capability, storage/event ports and Learning Contract without reaching into subject-specific internals.

