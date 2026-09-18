# CODEX_TASK

Task: `CONTENT_RESOLUTION_RUNTIME_DELIVERY_FOUNDATION`

Mode: `CHAT_FIRST / RESPONSIBILITY_BASED_ARCHITECTURE`

## Architecture layer

**Foundation — Content Resolution & Runtime Delivery**

## Goal

Create a safe bridge from Content/Asset/Provenance Registry locators to runtime resource descriptors without replacing current loaders until each migration is separately proven.

## Step 1 — Complete

Contract and trust boundary are gated.

## Step 2 — Active

Implement and gate a pure resolver runtime only.

Required:

1. dependency on the frozen Content, Asset & Provenance Registry;
2. explicit resolution modes;
3. safe locator rules for repository-relative, HTTPS, and content-hash locators;
4. access decision required before learner runtime delivery;
5. checksum reference required before learner runtime delivery;
6. default-deny network policy;
7. immutable runtime resource descriptor;
8. explicit blocked/provider-required/not-found/ambiguous outcomes;
9. no learner-state or route authority;
10. no runtime loader migration.

## Protected contracts

Preserve:

- Foundation — Identity & Domain Model frozen baseline;
- Foundation — Content, Asset & Provenance Registry promotion candidate;
- `BAUMAN_SUBJECT_BRIDGE_V1`;
- existing Russian/Math learning contracts;
- learner progress/state;
- Hub and subject routes;
- Device Gate and managed-access boundary;
- current source/package parity.

## Step 2 acceptance

- asset/content target resolution;
- resolver-owned access evaluation for target and final asset;
- deterministic locator precedence;
- default-deny network;
- explicit provider requirement;
- ambiguity instead of guessing;
- registry immutability;
- no current loader migration.

## Step 3 rule

Do not migrate any real loader until Step 2 gate is green.
