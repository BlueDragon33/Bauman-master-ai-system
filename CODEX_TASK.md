# CODEX_TASK

Task: `BAUMAN_ARCHITECTURE_NAMING_AND_LAYER_MAP`

Mode: `CHAT_FIRST / RESPONSIBILITY_BASED_ARCHITECTURE`

## Objective

Make the Bauman Hub architecture easy to understand and safe to upgrade without relying on ambiguous generation names such as V2 or V3.

## Mandatory naming policy

1. Name architecture layers by responsibility.
2. Reserve version numbers for compatibility-sensitive schemas, storage formats, migrations, and public protocols.
3. Treat L9/L10 only as historical checkpoint IDs.
4. New branches must use area + capability names, for example `work/foundation-content-provenance`.
5. Do not introduce branch/document names based on `V2`, `V3`, `new`, `latest`, or `final`.

## Primary architecture map

`ARCHITECTURE.md` is the canonical navigation document for:

- layer responsibility;
- code ownership;
- dependency direction;
- current authority;
- common edit locations;
- upgrade procedure;
- branch naming.

## Current completed foundation layers

- **Foundation — Identity & Domain Model** (historical checkpoint L9).
- **Foundation — Content, Asset & Provenance Registry** (historical checkpoint L10).

The content/asset/provenance layer is frozen as a promotion candidate and must remain runtime-neutral until a separately defined integration layer is approved.

## Protected contracts

Preserve unless a separately gated migration explicitly changes them:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- `RUSSIAN_LEARNING_STATE_V1`;
- `RUSSIAN_CONTENT_CONTRACT_V1`;
- accepted Math runtime behavior;
- existing learner progress/state;
- subject routes and subject apps;
- Device Gate and managed access boundary;
- L9 domain baseline;
- L10 content/provenance freeze invariants.

## Rule for the next layer

Do not start a numerically named “L11/V3” architecture by guess.

First define:

- descriptive layer name;
- responsibility;
- owned data;
- forbidden authority;
- dependencies;
- runtime integration;
- persistence model;
- security boundary;
- acceptance gate.

Only then implement it.
