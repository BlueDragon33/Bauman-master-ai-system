# Bauman Foundation — Content Resolution & Runtime Delivery — Step 1 Contract Audit

## Goal

Define the boundary between canonical registry metadata and runtime resource consumption without changing any existing Hub, Academic, subject, packaging, or learner-state loader.

## Why this layer exists

The repository currently resolves resources in several independent ways:

- Hub subject entry paths are mapped directly in `assets/js/main.js`;
- Academic prerequisite JSON uses direct URL constants in `assets/js/academic-main.js`;
- packaged runtime scripts independently verify required paths;
- the Content, Asset & Provenance Registry already defines canonical locators but intentionally has no runtime integration.

This layer provides one explicit place for future locator-to-runtime resolution rules without turning the registry itself into a browser, network, or academic-state authority.

## Step 1 contract

`BAUMAN_CONTENT_RESOLUTION_CONTRACT_V1` defines:

- dependency on the frozen Content, Asset & Provenance Registry;
- `learner_runtime` and `audit_historical` resolution modes;
- allowed/blocked asset states;
- access-decision and checksum-reference preconditions;
- locator handling for `repository_relative`, `https_url`, and `content_hash`;
- default-deny network policy;
- explicit provider requirement for content-addressed resources;
- immutable `BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1` output;
- fail-closed outcomes: `blocked`, `provider_required`, `not_found`, and `ambiguous`.

## Ownership boundary

This layer may own deterministic runtime resource resolution.

It may not own or mutate:

- learner state;
- mastery;
- Review Queue;
- SRS;
- schedules;
- Hub or subject routes;
- authentication;
- network credentials;
- registry records.

## Compatibility boundary

Step 1 is contract-only.

- Existing loaders remain authoritative for their current paths.
- No existing loader is replaced.
- No browser storage is introduced.
- No network fetch is performed by the core layer.
- No subject runtime is changed.
- No packaging rule is changed.
- No learner-visible UI is changed.

## Gate

Step 1 requires:

- frozen L10 promotion validator PASS;
- resolution contract syntax/shape PASS;
- negative tests for unsafe asset states, traversal, insecure URL policy, implicit content-hash resolution, implicit network enable, display-name fallback, and forbidden authority PASS.

Step 2 must not start until this gate is green.


## Step 1.1 — Access decision trust correction

Before Step 2 runtime implementation, the contract was tightened so the resolver does not trust a precomputed external access decision.

The resolver must receive an `accessContext` and evaluate access through `BAUMAN_ACCESS_POLICY_V1` itself.

For a content record that resolves to an asset, access must be evaluated twice:

1. target content record;
2. resolved asset record.

An external `accessDecision` is not an authority input. Resolution fails closed when either access evaluation denies the read.


## Step 2 selection policy

Before adding the pure resolver runtime, selection behavior is frozen:

- locator precedence: `repository_relative` → explicit `content_hash` provider → `https_url`;
- network remains opt-in;
- `preferredAssetId` is optional, but when supplied for a content record it must already belong to that content;
- multiple viable assets without an explicit preference return `ambiguous`;
- display names are never used to choose an asset or locator.
