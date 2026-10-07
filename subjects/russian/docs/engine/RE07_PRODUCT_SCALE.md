# Russian Engine RE07 — Product / Multi-user Scale Abstractions

State: VALIDATING

## Purpose

Prepare Russian Engine for a sellable multi-user product without forcing paid infrastructure before demand exists.

## Profile scope

Every learner-owned key can be scoped by stable Engine profile identity.

External provider or billing IDs are explicitly rejected as canonical Engine identity.

## Entitlement abstraction

Russian Engine can ask whether a capability or content pack is available.

The abstraction contains no payment-provider calls and no billing SDK.

## Optional sync journal

The change journal supports:
- stable journal IDs;
- learner profile scope;
- entity identity;
- base/next revision;
- pending/synced/conflict state;
- duplicate-id idempotency;
- export.

Remote sync remains a future adapter.

## Explicitly absent

- remote auth;
- payment SDK;
- subscription vendor;
- managed database;
- mandatory API;
- cloud-only learner state.

## Commercial path

single local profile
→ multiple local profiles
→ optional account/sync adapter
→ managed multi-user service when justified

## Exit gate

PASS when:
- profile isolation is proven;
- provider/billing IDs cannot become canonical learner identity;
- entitlement is provider-neutral;
- duplicate sync journal writes are idempotent;
- no mandatory backend or billing dependency is introduced.
