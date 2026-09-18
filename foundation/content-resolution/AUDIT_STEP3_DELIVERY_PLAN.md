# Bauman Foundation — Content Resolution & Runtime Delivery — Step 3 Delivery Plan Boundary Audit

## Goal

Bind a resolved resource descriptor to its exact registry asset and checksum before any future adapter retrieves bytes.

Step 3 still performs no I/O.

## Delivery plan

`runtime-delivery-plan.js` creates immutable `BAUMAN_RUNTIME_DELIVERY_PLAN_V1` objects from a `resolved` runtime resource descriptor.

The plan pins:

- adapter identity;
- locator/resource reference;
- transport;
- expected SHA-256 digest;
- expected byte length;
- checksum record ID;
- target/content/asset/canonical identities;
- media metadata;
- resolution mode and access summary.

## Adapter mapping

- `repository_relative` + `package_relative` → `package-relative-resource`;
- `https_url` + `https` → `https-resource`;
- `content_hash` + `content_addressed_provider` → `content-hash-resource`.

Transport/locator mismatches fail closed.

## Integrity binding

The planner re-reads the asset and checksum from the registry.

It rejects:

- descriptor checksum drift;
- canonical identity drift;
- media metadata drift;
- locators not actually linked to the asset;
- invalid checksum records;
- content-hash locators whose digest does not exactly equal the referenced checksum digest.

Future delivery adapters must verify retrieved bytes against the plan before exposing them to consumers.

## No-side-effect boundary

The planner:

- performs no fetch;
- writes no storage;
- mutates no registry;
- changes no learner state;
- changes no routes;
- changes no UI.

## Step 3 gate

Step 3 requires:

- Step 1/2 gates PASS;
- local and content-hash delivery plans PASS;
- descriptor↔asset↔checksum binding PASS;
- transport/locator mismatch negative tests PASS;
- content-hash/checksum mismatch negative test PASS;
- immutable plan and registry preservation PASS.

Step 4 may define injected delivery adapters, but must not weaken the integrity verification requirement.
