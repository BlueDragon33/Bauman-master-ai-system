# Bauman Foundation — Content Resolution & Runtime Delivery — Step 2 Pure Resolver Runtime Audit

## Goal

Implement deterministic registry-to-runtime resolution without fetching resources, changing existing loaders, or creating new application authority.

## Runtime

`runtime-resource-resolver.js` exposes:

- `BAUMAN_RUNTIME_RESOURCE_RESOLVER_V1`;
- immutable `BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1` results;
- asset and content target resolution;
- resolver-owned access evaluation through `BAUMAN_ACCESS_POLICY_V1`;
- mode-specific asset-state eligibility;
- deterministic locator precedence;
- explicit content-hash provider requirement;
- explicit ambiguity for multiple viable content assets.

## Access boundary

The resolver does not trust an externally supplied access decision.

It evaluates:

1. the requested target;
2. the resolved asset when the target is content.

A readable content wrapper therefore cannot expose a private asset unless the access context also permits that asset.

## Locator behavior

Precedence:

1. repository-relative package locator;
2. content-hash locator when the `content_hash` provider is explicitly available;
3. HTTPS locator when the runtime policy explicitly enables HTTPS.

Network remains disabled by default.

Repository-relative locators containing query or fragment syntax are rejected at the resolution layer even though the registry remains a generic locator store.

## No-side-effect boundary

The pure resolver:

- performs no fetch;
- reads/writes no browser storage;
- writes no registry record;
- changes no route;
- changes no learner state;
- changes no UI;
- changes no packaging behavior.

Existing loaders remain authoritative.

## Step 2 gate

Step 2 requires:

- Step 1 contract gate PASS;
- runtime syntax PASS;
- local package-relative resolution PASS;
- explicit HTTPS opt-in PASS;
- content-hash provider-required/provider-available paths PASS;
- target + resolved-asset access checks PASS;
- quarantined-state block PASS;
- multi-asset ambiguity + preferred asset selection PASS;
- input registry byte-equivalent before/after resolution PASS.

Step 3 must not migrate a real loader until Step 2 is green.
