# C3 RELEASE ANNEX — SHARED PRODUCTION PUBLISH · VERIFY · OBSERVE · ROLLBACK
## Operational appendix to the Professional QA Constitution

This file is **not a fifth constitution**.

It is the shared production-release procedure consumed by all subjects after their subject-specific RC readiness gate passes.

---

# 0. ENTRY

Require exact:

- RC ID;
- source SHA/artifact;
- content snapshot;
- schema/migration manifest;
- dependency lock/profile;
- production config/flags (non-secret identity);
- rollback target;
- subject-specific production smoke profile;
- acceptance evidence.

No “latest”.

---

# 1. PREFLIGHT

Verify:

- production environment;
- intended database/project;
- domain/origin;
- required secret presence without revealing values;
- OAuth/integration callbacks where relevant;
- observability;
- rollback artifact/snapshot.

Any identity ambiguity = BLOCKED.

---

# 2. BACKUP / MIGRATION

If persistent production data changes:

- create/verify backup when required;
- verify current schema predecessor;
- serialize migration;
- run exact approved migration order;
- verify target version/invariants;
- treat partial success as failure until consistency is proven.

Forward-only migration must be marked explicitly.

---

# 3. DEPLOY / PROMOTE

Prefer promotion of the artifact that was actually accepted.

If rebuilding is unavoidable, re-verify:

- source SHA;
- lockfile/toolchain;
- build config;
- resulting artifact identity.

Deployment success is not release success.

---

# 4. ACTIVATE

Follow the subject RC compatibility order for:

- application;
- content snapshot;
- feature flags;
- runtime config;
- worker/background components;
- caches/CDN/routing where applicable.

Verify each material mutation before continuing.

---

# 5. PRODUCTION IDENTITY

After activation, read back actual:

- build/release ID;
- content snapshot;
- schema version;
- config profile/fingerprint;
- feature flags.

Unexplained mismatch = production drift = FAIL/BLOCK until resolved.

---

# 6. GLOBAL SMOKE

Always verify:

- app shell;
- active subject route;
- auth/session path;
- protected admin/author route;
- persistence/write on isolated test account where safe;
- error reporting;
- service worker/PWA if promised;
- core security headers/CSP as designed.

Then execute the **subject-specific smoke profile** emitted by its final acceptance module.

---

# 7. OBSERVE

Observe immediate and short-term signals appropriate to the deployment:

- client/server errors;
- auth;
- official writes/submissions;
- sync;
- migration;
- cache/PWA;
- latency/performance;
- external-provider errors;
- security/data-integrity signals.

Low traffic requires synthetic/manual checks; silence alone is weak evidence.

---

# 8. STOP CONDITIONS

Stop rollout progression immediately for credible unresolved:

- wrong environment/database;
- wrong artifact/content;
- migration invariant failure;
- data corruption/loss/duplicate official write;
- auth/authorization breakdown;
- secret exposure/severe security issue;
- unrecoverable service-worker/update loop;
- missing rollback target when risk requires it.

---

# 9. CONTAINMENT / ROLLBACK

Choose the smallest safe recovery:

- feature kill switch;
- content rollback;
- traffic rollback;
- code rollback;
- forward fix;
- database restore only with explicit write-safety analysis.

Old code must be compatible with current persistent schema/data before code rollback.

---

# 10. STABLE CLOSURE

Declare production stable only when:

- exact tested artifact is live;
- exact accepted content is live;
- persistent state is valid;
- global + subject smoke pass;
- auth/security are correct;
- required offline/update behavior works;
- observability is functioning;
- no rollback trigger remains active;
- recovery target remains viable;
- release evidence reflects actual final state.

Never equate a green deploy button with a verified release.