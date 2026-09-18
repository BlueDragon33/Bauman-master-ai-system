# L9 Step 8 — Canonical Consumer Context Adapter

## Goal

Let real Russian consumers read durable canonical identities without changing existing learning-state ownership, storage, routes, bridge protocol, mastery, SRS, Review Queue, or learner-visible UI.

Step 8 introduces the first explicit consumer adapter over the Step 7 durable projection.

## Runtime adapter

`BAUMAN_FOUNDATION_CANONICAL_CONTEXT_V1` is loaded after the verified canonical projection bridge and before existing Russian consumers.

The adapter can project canonical references for:

- host subject;
- current core route;
- current lesson;
- current resume object;
- Review Queue item IDs;
- host course/task/mission identities.

All lookups delegate to the verified Step 7 projection. Missing mappings remain `null`; display labels are never converted into identities.

## AI Mentor integration

`RUSSIAN_AI_MENTOR_CONTEXT_V1` remains the existing AI context contract and receives one additive field:

- `canonical` — immutable read-only canonical context.

The existing Review Queue read path remains `Object.values(learning.reviewQueue || {})`; canonical IDs are obtained separately from `Object.keys(...)`. This preserves the pre-existing object-shaped Review Queue contract while allowing additive identity lookup.

The AI policy now also states `canonicalIdentityReadOnly: true` while retaining:

- `canonicalStateReadOnly: true`;
- `masteryReadOnly: true`;
- `aiMayModifyMastery: false`;
- `aiMayCompleteTasks: false`.

No Host Bridge message shape was changed.

## Safety properties

The canonical context adapter:

- contains no localStorage/sessionStorage writes;
- contains no DOM/UI rendering;
- is deeply immutable;
- treats legacy runtime state as authoritative;
- may not write the identity overlay;
- may not write legacy storage;
- may not modify mastery;
- fails closed when the durable projection is unavailable.

Building AI context is verified to leave both legacy storage bytes and durable overlay bytes unchanged.

## Packaging

Both runtime materializers now require `subjects/shared/foundation-canonical-context.js` and require the Russian packaged HTML to reference it.

The context adapter is therefore validated in both source runtime and the final packaged runtime rather than only in the repository tree.

## Regression found and fixed

The first Step 8 attempt changed the AI Mentor Review Queue local variable from `Object.values(...)` to `Object.entries(...)` to obtain canonical IDs. Although semantically similar for counting, this broke the established Russian AI runtime contract gate that explicitly protects the canonical object-shaped Review Queue read path.

The integration was corrected instead of weakening the gate:

- legacy behavior continues to use `Object.values(learning.reviewQueue || {})`;
- canonical Review Queue IDs are read separately with `Object.keys(...)`.

No existing consumer behavior needed to change.

## Verified acceptance

On commit `f571c83999de52addb3031a3bbf4b52551179fba`:

- Foundation Domain Model Gate = SUCCESS
- Russian Reference UI Gate = SUCCESS
- Windows checkout safety = SUCCESS
- Bauman Cloudflare Preview CI = SUCCESS
- Whole System Integration Gate = SUCCESS
- canonical context static gate = SUCCESS
- normal canonical context browser acceptance = SUCCESS
- packaged canonical context browser acceptance = SUCCESS
- legacy bytes unchanged during context build = verified
- overlay bytes unchanged during context build = verified
- packaged Hub responsive acceptance = SUCCESS

## Step 8 checkpoint

**L9 Step 8 = PASS.**

The canonical Foundation identity layer now has a real, read-only consumer in Russian AI context without becoming authoritative over the existing Russian learning runtime.

## Deferred to Step 9

Step 8 does not start a write migration. Step 9 must be a promotion/freeze audit for the complete L9 layer, including diff review, invariant checks, package integrity, legacy preservation, and PR readiness. No destructive migration is required to complete L9.
