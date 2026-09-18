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


## Step 3 — Active

Build and gate an immutable delivery plan from a resolved descriptor.

Required:

- descriptor must already be `resolved`;
- descriptor asset/checksum/locator must still match registry;
- content-hash locator must equal referenced SHA-256 digest;
- delivery plan carries exact digest and byte length;
- transport/locator mismatch fails closed;
- no I/O, route, storage or learner-state mutation.

Step 4 may define injected adapters only after Step 3 is green.


## Step 4 — Active

Gate the injected delivery executor.

Acceptance:

- exact adapter ID lookup only;
- adapter missing/error/invalid payload fail closed;
- SHA-256 digest + byte length verified before consumer;
- failed payload never reaches consumer;
- consumer receives a copy isolated from adapter-owned bytes;
- executor contains no direct network/storage APIs.

No real application loader is migrated in Step 4.


## Step 5 — Active

Gate the first concrete delivery adapter: `package-relative-resource`.

Acceptance:

- explicit HTTP/HTTPS base URL;
- repository-relative resource path only;
- same-origin GET only;
- redirects rejected;
- query/fragment/traversal rejected;
- HTTP failure rejected;
- bytes still verified by the executor before consumer use.

No existing loader authority changes in Step 5.


## Step 6 — Active

Validate the real Academic 2026 core resources in shadow mode.

Resources:

- official curriculum;
- prerequisite registry;
- prerequisite pack manifest.

Acceptance:

- exact parity with constants in `assets/js/academic-main.js`;
- real files exist and parse;
- dynamic diagnostic registry only;
- resolver → delivery plan → executor verification succeeds for all three;
- verified JSON equals direct JSON;
- no runtime code or loader authority changes.


## Step 7 — Active

Run source-runtime browser shadow acceptance without editing the application entry point.

Acceptance:

- same-origin test-only harness;
- Foundation scripts injected only by Playwright;
- real package-relative fetch adapter used in Chromium;
- browser WebCrypto SHA-256;
- all three Academic core resources resolve, plan, verify, parse and match direct JSON;
- no console/page/request/HTTP errors;
- no runtime authority switch.
