# C3 RELEASE ANNEX — SHARED RELEASE TARGET · VERIFY · OBSERVE · ROLLBACK
## Operational appendix to the Professional QA Constitution

This file is **not a fifth constitution**.

It is the shared release procedure consumed by all subjects after their subject-specific RC readiness gate passes.

It inherits:
- `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md`;
- LOCAL-FIRST · OFFLINE-FIRST · FREE-FIRST · PORTABLE · OPTIONAL CLOUD.

A subject RC must declare the minimum release profile it actually requires. Do not force managed cloud production when a local/offline target satisfies the real capability contract.

---

# 0. RELEASE PROFILES

Exactly one target profile is primary for a release:

## LOCAL_STABLE
Validated local/browser/offline artifact. No hosted backend is required.

## SYNC_STABLE
LOCAL_STABLE plus one or more optional sync/backup bridges are validated.

## PUBLISHED_STABLE
A hosted/static/public endpoint is validated in addition to the local-capable artifact.

## MANAGED_PRODUCTION_STABLE
A managed backend/runtime release is validated with production data/config/secrets/rollback.

Higher profiles may include lower-profile evidence.

A subject may be complete at LOCAL_STABLE if managed infrastructure is not intrinsically required.

---

# 1. ENTRY

Require exact:

- RC ID;
- source SHA/artifact;
- content snapshot;
- schema/migration manifest where applicable;
- dependency lock/profile;
- selected release profile;
- non-secret target config identity;
- rollback/recovery target appropriate to the profile;
- subject-specific smoke profile;
- acceptance evidence.

No “latest”.

For managed targets also require exact environment/account/project/database identities.

---

# 2. PREFLIGHT

For every profile verify:

- exact artifact/source;
- intended target profile;
- required local/browser capabilities;
- offline/update behavior where promised;
- recovery/export path;
- required optional-provider availability only when that provider is in the selected profile.

For SYNC/PUBLISHED/MANAGED targets additionally verify as relevant:

- remote account/project/folder/site;
- intended database/storage target;
- domain/origin;
- required secret presence without revealing values;
- OAuth/integration callbacks;
- observability;
- rollback artifact/snapshot.

Any identity ambiguity = BLOCKED for that target profile.

An optional provider outage must not invalidate LOCAL_STABLE unless the local core itself depends on it contrary to policy.

---

# 3. BACKUP / MIGRATION

If persistent canonical data changes:

- create/verify backup when required;
- verify current schema predecessor;
- serialize migration;
- run exact approved migration order;
- verify target version/invariants;
- treat partial success as failure until consistency is proven.

For local profiles, backup/export may be a versioned local artifact.

For sync/managed profiles, remote backup may supplement but must not replace a recoverable local/export path where policy requires one.

Forward-only migration must be marked explicitly.

---

# 4. DEPLOY / MATERIALIZE / PROMOTE

## LOCAL_STABLE
Materialize the exact accepted local/browser package.

Verify:
- source SHA;
- lockfile/toolchain;
- build config;
- resulting artifact identity;
- local/offline launch.

## SYNC_STABLE
Start from LOCAL_STABLE and activate only the declared sync adapters.

## PUBLISHED_STABLE
Prefer promotion of the artifact actually accepted locally. If rebuilding is unavoidable, re-verify identity.

## MANAGED_PRODUCTION_STABLE
Use the full managed deployment path and verify every remote mutation.

Deployment/materialization success is not release success.

---

# 5. ACTIVATE

Follow the RC compatibility order for:

- application;
- content snapshot;
- feature flags;
- runtime config;
- storage/sync adapters;
- worker/background components;
- caches/CDN/routing where applicable.

Optional providers must remain isolated behind capability/provider boundaries.

Verify each material mutation before continuing.

---

# 6. TARGET IDENTITY

After activation/materialization, read back actual identity appropriate to the target:

- build/release ID;
- content snapshot;
- schema version;
- config profile/fingerprint;
- feature flags;
- provider profile.

For managed targets also verify remote deployment/account/database identity.

Unexplained mismatch = drift = FAIL/BLOCK until resolved.

---

# 7. GLOBAL SMOKE

Always verify:

- app shell;
- active subject route;
- core learner journey;
- local persistence/write on isolated test state where safe;
- error reporting;
- service worker/PWA if promised;
- offline behavior declared by the RC;
- export/recovery path where required.

Auth/admin/protected-route smoke is required only when the selected target profile actually includes those capabilities.

Then execute the **subject-specific smoke profile** emitted by its final acceptance module.

For SYNC_STABLE verify sync disconnect/reconnect and local fallback.

For PUBLISHED_STABLE verify hosted artifact identity and graceful network failure.

For MANAGED_PRODUCTION_STABLE additionally verify full auth/security/remote persistence boundaries.

---

# 8. OBSERVE

Observe signals appropriate to the target:

- client/runtime errors;
- local writes;
- sync queue/conflicts if enabled;
- migration;
- cache/PWA;
- latency/performance;
- optional-provider errors;
- security/data-integrity signals.

Managed targets additionally observe server/auth/remote write signals.

Low traffic requires synthetic/manual checks; silence alone is weak evidence.

---

# 9. STOP CONDITIONS

Stop rollout progression immediately for credible unresolved:

- wrong artifact/content;
- migration invariant failure;
- data corruption/loss/duplicate official write;
- unrecoverable service-worker/update loop;
- required recovery/export target missing;
- selected-profile provider identity mismatch;
- security issue relevant to the selected profile.

For managed targets also stop on:
- wrong environment/database;
- auth/authorization breakdown;
- secret exposure;
- missing rollback target when risk requires it.

Optional provider failure does not block LOCAL_STABLE when the local core remains correct.

---

# 10. CONTAINMENT / ROLLBACK

Choose the smallest safe recovery:

- feature/provider kill switch;
- local package rollback;
- content rollback;
- sync disable;
- traffic rollback;
- code rollback;
- forward fix;
- database restore only with explicit write-safety analysis.

Old code must be compatible with current persistent schema/data before code rollback.

Provider rollback must not destroy canonical local data.

---

# 11. STABLE CLOSURE

Declare the selected profile stable only when:

- exact tested artifact is active;
- exact accepted content is active;
- persistent state is valid;
- global + subject smoke pass;
- required offline/update behavior works;
- recovery/export target remains viable;
- no active blocker remains for that profile;
- release evidence reflects actual final state.

Additional closure:

## LOCAL_STABLE
Must prove local/browser/offline core works without paid credentials.

## SYNC_STABLE
Must prove sync is optional, retry-safe and disconnect-safe.

## PUBLISHED_STABLE
Must prove hosted artifact identity and network-failure behavior.

## MANAGED_PRODUCTION_STABLE
Must prove auth/security, remote persistence, observability and rollback for the managed environment.

Never equate a green deploy button with a verified release.
Never equate lack of paid cloud deployment with subject incompleteness unless the subject requirement truly needs managed infrastructure.
