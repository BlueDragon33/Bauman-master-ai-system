# Russian Engine RE07 — Multi-User & Commercial Scale Contracts

State: **PASS**

## Principle

Prepare for commercial scale without buying or hard-coding commercial infrastructure before it is required.

Russian Engine remains pedagogical/domain logic.

Platform adapters own:
- account identity;
- authentication;
- entitlement source;
- payment provider;
- managed sync/backend.

## Internal profile identity

Engine records use an internal stable `profileId`.

External account/payment IDs must not become canonical learning identity.

This prevents:
- payment-provider migration from rewriting learner history;
- Google/account migration from changing evidence IDs;
- vendor lock-in at the learner-state layer.

## Entitlement port

Russian Engine asks only:
- is this pack/capability available?
- what packs/capabilities does this profile have?

It does not:
- charge money;
- call billing APIs;
- store card/payment data;
- interpret provider customer IDs.

## Product progression

Architecture supports:

single local profile
→ multi local profile
→ optional account/sync adapter
→ managed multi-user service when justified.

The first stages remain fully valid product modes.

## Change journal

RE07 introduces a pure profile-scoped change journal contract for future sync.

Properties:
- append-oriented;
- idempotent journal IDs;
- explicit PENDING / SYNCED / CONFLICT state;
- version metadata;
- payload hash metadata;
- no silent conflict overwrite.

It does not perform network sync itself.

## Commercial contract

The data contract explicitly states:
- learner export required;
- delete control required;
- subscription change may not silently delete evidence;
- provider failure may not corrupt evidence;
- analytics separate from learning evidence;
- raw voice not collected by default;
- no mandatory backend/payment provider today.

## Files

- `subjects/russian/engine/product/profile-scope.mjs`
- `subjects/russian/engine/product/entitlement-port.mjs`
- `subjects/russian/engine/product/commercial-contract.v1.json`
- `subjects/russian/engine/sync/change-journal.mjs`
- `subjects/russian/engine/tests/test-re07-commercial-scale.mjs`

## Validation

Executed against the branch implementation: **14/14 checks PASS**.

Verified:
- profile-scoped storage keys differ between A/B;
- cross-profile ownership is rejected;
- payment/provider IDs are rejected as canonical identity;
- entitlement is provider-independent;
- profile-specific packs remain isolated;
- journal duplicate writes are idempotent;
- version conflict becomes explicit `CONFLICT`;
- no network, managed backend or payment provider is required.

## Exit

**RE07 PASS.**
