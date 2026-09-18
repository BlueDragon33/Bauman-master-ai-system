# Bauman Foundation — Content Resolution & Runtime Delivery

This layer defines how canonical content/asset registry records become safe runtime resource descriptors.

It sits between:

- **Foundation — Content, Asset & Provenance Registry**, which owns identity, integrity metadata, provenance, access metadata, and snapshots; and
- subject/runtime consumers, which need a concrete resource to open or load.

## Responsibility

This layer owns:

- deterministic locator selection rules;
- runtime resource descriptor shape;
- allowed runtime modes;
- asset-state eligibility rules;
- access/integrity preconditions before delivery;
- explicit provider requirements for content-addressed resources;
- fail-closed resolution outcomes.

This layer does **not** own:

- learner state, mastery, SRS, Review Queue, progress, or schedules;
- subject routes or Hub navigation;
- academic content truth;
- authentication or user accounts;
- network credentials;
- browser storage;
- actual HTTP/file fetching in the core resolver;
- mutation of the Content/Asset/Provenance Registry.

## Dependency

Direct dependency:

- Foundation — Content, Asset & Provenance Registry.

Indirect dependency:

- Foundation — Identity & Domain Model.

## Step 1

Step 1 defines the contract only. Existing Hub, Academic, subject, and packaging loaders remain unchanged.

No runtime consumer is migrated until a later step has a separately green gate.


## Step 2 — Pure resolver runtime

`runtime-resource-resolver.js` is an isolated resolver that reads registry metadata and access policy and returns immutable runtime resource descriptors.

It is not yet wired into existing Hub, Academic, subject, or packaging loaders.
