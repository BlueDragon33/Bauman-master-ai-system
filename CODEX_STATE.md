# CODEX_STATE

Current task: `CONTENT_RESOLUTION_RUNTIME_DELIVERY_FOUNDATION`

Status: `STEP3_DELIVERY_PLAN_ACTIVE`

Date: 2026-09-18
Branch: `work/foundation-content-resolution-delivery`
Base checkpoint: `540126ba568b73b84cde3efeba02677ac089e437`

## Primary architecture reference

Use `ARCHITECTURE.md` as the first document for ownership, dependencies, and upgrade boundaries.

## Active architecture layer

### Foundation — Content Resolution & Runtime Delivery

Purpose:

- resolve canonical registry locators into safe runtime resource descriptors;
- centralize locator/runtime policy without moving academic authority into the registry;
- provide a future migration path away from scattered hard-coded loader paths.

Direct dependency:

- Foundation — Content, Asset & Provenance Registry.

Indirect dependency:

- Foundation — Identity & Domain Model.

## Completed Step 1 boundary

Step 1 is contract-only.

Existing loaders remain unchanged:

- Hub subject path mapping;
- Academic prerequisite JSON loading;
- subject-local data loading;
- packaging/runtime dependency checks.

The new layer must not yet replace or intercept those paths.

## Protected authority

The resolution layer must never silently own:

- learner state;
- mastery;
- Review Queue;
- SRS;
- scheduling;
- subject or Hub routing;
- authentication;
- network credentials;
- registry mutation.

## Network and persistence rule

- Core resolution defaults to network deny.
- No fetch/XHR/WebSocket in the core resolver.
- No localStorage/sessionStorage/IndexedDB binding in the core resolver.
- Content-hash locators require an explicit provider adapter.
- Repository-relative paths remain package-relative and traversal-safe.

## Step 1 gate

Required before Step 2:

- frozen L10 promotion validator PASS;
- content resolution contract validator PASS;
- negative contract tests PASS.

Step 1 and access-trust corrections are green.

## Active Step 2 boundary

The pure resolver runtime is present but isolated. It reads registry + access policy and returns immutable runtime descriptors. It performs no fetch/storage/route/UI mutation and is not wired into Hub, Academic, subject, or packaging loaders.

Step 3 must not migrate a real loader until the Step 2 resolver gate is green.


## Active Step 3 boundary

The delivery-plan layer binds a resolved descriptor to the exact registry asset, locator, SHA-256 digest and byte length.

No bytes are retrieved yet. No adapter is allowed to expose data before future integrity verification.
