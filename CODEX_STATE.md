# CODEX_STATE

Current task: `CONTENT_RESOLUTION_RUNTIME_DELIVERY_FOUNDATION`

Status: `STEP1_CONTRACT_ACTIVE`

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

## Current Step 1 boundary

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

Step 2 must not begin before the dedicated Content Resolution & Runtime Delivery Gate is green.
