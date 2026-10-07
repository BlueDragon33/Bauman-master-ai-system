# Russian Engine RE07 — Product / Multi-user Scale Abstractions

State: **PASS**

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

## Validation

Executed against the branch implementation: **18/18 checks PASS**.

Verified:
- profile A/B storage-key isolation;
- provider/payment IDs rejected as canonical learner identity;
- entitlement lookup is provider-neutral;
- unavailable packs fail cleanly as not-entitled;
- change journal duplicate IDs are idempotent;
- pending/synced state works;
- sync/provider IDs remain outside canonical identity;
- no mandatory backend or billing dependency exists.

## Exit

**RE07 PASS.**
