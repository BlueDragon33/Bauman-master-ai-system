# Bauman Foundation — Content Resolution & Runtime Delivery — Step 8 Packaged Runtime Shadow Acceptance Audit

## Goal

Prove that the same Content Resolution browser shadow acceptance passes against the final owner-private packaged runtime, not only the source tree.

## Package path

The existing packaging chain remains authoritative:

1. `prepare-cloudflare-preview.mjs` materializes `runtime-dist`;
2. the complete `foundation/` tree is copied into `runtime-dist`;
3. `prepare-chatgpt-site.mjs` copies `runtime-dist` to `dist`;
4. the packaged shadow harness and Content Resolution modules are therefore byte-carried by the same package operation as the rest of Foundation.

Step 8 does not modify these packaging scripts.

## Acceptance method

The dedicated Content Resolution browser job:

1. passes source-runtime browser shadow acceptance;
2. materializes `runtime-dist` and `dist` using the existing packaging scripts;
3. serves `dist` from a second local port;
4. runs the exact same `content-resolution-shadow-browser.mjs` test against the packaged origin;
5. records separate packaged evidence.

## Required parity

For all three Academic core resources, packaged runtime must preserve:

- harness availability;
- Foundation runtime module availability;
- resource path availability;
- resolver result;
- delivery-plan result;
- package-relative fetch behavior;
- SHA-256 digest and byte-length verification;
- parsed JSON parity.

## Authority boundary

This remains shadow-only acceptance.

It does not:

- add Content Resolution scripts to root `index.html`;
- edit `academic-main.js`;
- replace current Academic fetches;
- persist a registry;
- expose debug UI;
- change learner state or routes.

## Gate

Step 8 is PASS only when both source and packaged browser shadow acceptance pass on the same workflow head.

A later step may define a read-only browser shadow bridge inside the real Academic page, but it must remain non-authoritative until separately promoted.
