# Bauman Foundation — Content, Asset & Provenance Registry — Step 9 Promotion / Freeze Audit

## Goal

Freeze the complete L10 Content + Asset + Provenance Foundation as a promotion candidate without merging to `main`, binding it to a browser/runtime authority, or rewriting legacy learning/content state.

Step 9 introduces no new content authority. It is a release-readiness and invariant audit over Steps 1–8.

## Frozen layer

The promotion manifest `BAUMAN_FOUNDATION_L10_PROMOTION_V1` requires:

1. registry contract and immutable runtime;
2. SHA-256 asset integrity;
3. append-only provenance/lineage;
4. explicit access policy with private default boundary;
5. deterministic canonical snapshots;
6. transactional storage-neutral snapshot persistence;
7. SHA-256 snapshot integrity envelope;
8. all Step 1–8 audit documents, validators, negative tests, and CI gates.

## L9 compatibility lock

L10 remains additive over the promoted L9 domain foundation.

The registry contract remains pinned to:

- domain schema: `BAUMAN_DOMAIN_CONTRACT_V1`;
- contract version: `1`;
- Git blob: `0691acecbec6734cb746aa9cb745350880a98d59`;
- canonical kinds used by L10: existing `source` and `artifact` identities only.

L10 must not mutate or extend the L9 domain contract merely to fit content registry implementation details.

## Runtime-neutral freeze

At promotion freeze:

- no L10 core file calls `fetch`, XMLHttpRequest, WebSocket, localStorage, sessionStorage, or IndexedDB;
- the Step 7 persistence contract is adapter-based transport only;
- no browser storage key becomes canonical authority;
- no existing subject route/content path is moved or renamed;
- no learner mastery, Review Queue, SRS, resume, progress, or academic state is rewritten;
- no learner-visible schema/version/debug badge is introduced.

A later runtime integration must be separately gated.

## Integrity vs authenticity

Step 8 SHA-256 sealing is frozen as an integrity mechanism, not signer authentication.

A party that can change both a snapshot and its checksum can recompute SHA-256. Digital signatures, key management, signer identity, remote trust, and authorization remain future explicit layers and must not be implied by the L10 promotion.

## Promotion status

The machine-readable manifest remains `promotion_candidate`.

Passing Step 9 means the L10 branch is internally frozen and eligible for a separately approved promotion/review flow. It does not merge `main`, publish a new learner-visible release, or authorize destructive migration.

## Required final gates

The freeze head must pass:

- Content Asset Provenance Gate;
- Foundation Domain Model Gate;
- Academic 2026 Prerequisite Gate;
- Windows checkout safety;
- Bauman Cloudflare Preview CI;
- Whole System Integration Gate, including source and packaged ChatGPT Site browser acceptance.

## Checkpoint

L10 Step 9 is PASS only when the promotion validator and all system gates are green on the same freeze head.
