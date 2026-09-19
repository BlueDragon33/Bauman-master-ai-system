# Bauman Foundation — Content Resolution & Runtime Delivery — Step 9 Academic Runtime Shadow Bridge Audit

## Goal

Connect the verified Content Resolution chain to the real Hub page without transferring loader authority.

## Activation

The bridge is loaded by the real root page but is inert by default.

It activates only when the exact query parameter is present:

`?contentResolutionShadow=1`

When inactive it does not load the Foundation Content Resolution dependency chain.

## Runtime behavior when enabled

After the existing Academic loader and prerequisite-pack readiness complete, the bridge:

1. snapshots the authoritative Academic globals;
2. dynamically loads the Content Resolution dependencies;
3. directly reads the same three Academic core resources for diagnostic SHA-256 metadata;
4. builds an in-memory diagnostic registry;
5. resolves each resource;
6. builds delivery plans;
7. retrieves bytes through the package-relative adapter;
8. verifies bytes through the delivery executor;
9. compares verified JSON with direct JSON and authoritative Academic globals;
10. confirms the prerequisite-pack manifest count matches the existing pack readiness status;
11. confirms Academic globals and diagnostic registry were not mutated.

## Authority boundary

The bridge does not replace `fetchJson`, write Academic globals, write learner state, change routes, persist registry data, or stop application startup when its own shadow verification fails.

Its output is diagnostic only:

`window.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS`

## Upgrade value

This establishes the first real-page integration seam while preserving the current loader as authority.

The next migration can be based on measured runtime parity rather than switching data authority in one step.
