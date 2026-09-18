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


## Step 3 — Delivery plan boundary

`runtime-delivery-plan.js` converts a resolved descriptor into an immutable delivery plan pinned to the registry checksum, media identity and locator.

The plan does not retrieve bytes. Future adapters must verify bytes against the plan before returning them.


## Step 4 — Injected verified delivery executor

`runtime-delivery-executor.js` calls only adapters explicitly supplied by the environment. It verifies SHA-256 digest and byte length before forwarding a copied payload to a consumer.

The executor itself contains no direct network or browser-storage implementation.


## Step 5 — Package-relative fetch adapter

The first concrete adapter retrieves package-relative resources using same-origin GET only. It is environment-specific, but still sits behind the injected executor and its SHA-256 verification gate.

It is not yet authoritative for any existing application loader.


## Step 6 — Academic core shadow resolution

CI now validates the three real Academic 2026 core JSON resources through the complete resolution/delivery chain while leaving `academic-main.js` untouched.

The shadow registry is diagnostic and exists only during validation.
