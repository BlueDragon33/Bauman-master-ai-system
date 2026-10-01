# P14 — OFFLINE · PACKAGING · PERFORMANCE · MIGRATION · SECURITY HARDENING CONSTITUTION
## RESILIENCE · DATA INTEGRITY · PWA · CACHE · STORAGE · SUPPLY CHAIN · OBSERVABILITY · FAILURE RECOVERY

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/russian/`

Execution mode:

**AUTONOMOUS · EVIDENCE-FIRST · FAILURE-FIRST · SECURITY-FIRST · DATA-INTEGRITY-FIRST · PERFORMANCE-BUDGETED · OFFLINE-SAFE · MIGRATION-SAFE · ROLLBACK-SAFE · TOKEN-EFFICIENT**

---

# P14 CHANGELOG

- 2026-09-30 — Full deep P14 constitution created.
- 2026-09-30 — Final hardening: IndexedDB/versionchange, storage eviction, pack repair, offline-assessment identity, downgrade safety, service-worker races, account isolation, build reproducibility, SBOM/license audit, config drift and engineering golden regression.

---

# 0. MISSION

P14 hardens the application after the product and learning contracts have been defined.

Its purpose is not to add learning features.

Its purpose is to ensure that existing features remain correct under:

- slow devices;
- poor networks;
- offline use;
- stale service workers;
- interrupted downloads;
- storage pressure;
- schema changes;
- content migrations;
- browser differences;
- concurrent tabs;
- malformed content;
- dependency failures;
- provider outages;
- hostile inputs;
- deployment mistakes.

The central rule is:

> **NO PERFORMANCE, OFFLINE OR SECURITY OPTIMIZATION MAY CORRUPT DOMAIN TRUTH OR LEARNER STATE.**

---

# 1. UPSTREAM DEPENDENCIES

P14 consumes:

### P0
- phase orchestration;
- authority;
- rollback;
- release rules.

### P1
- actual runtime architecture;
- build/deploy stack;
- storage;
- service worker;
- network paths.

### P3
- canonical schemas;
- IDs;
- content revisions;
- migrations.

### P4
- learner state;
- attempt integrity;
- mastery;
- offline sync boundaries.

### P5
- planner/SRS state.

### P6
- media/audio runtime;
- recording;
- offline fallback.

### P10
- AI provider/tool boundaries;
- secrets;
- failure fallback.

### P11
- scenario persistence;
- seed/revision/event identity.

### P12
- content snapshot;
- authoring activation;
- migration/snapshot semantics.

### P13
- critical UX journeys;
- error/offline states;
- responsive/device matrix.

P14 must preserve these contracts.

---

# 2. P14 OWNERSHIP

P14 owns:

- offline runtime architecture;
- PWA/service worker behavior;
- caching policy;
- cache versioning;
- content pack delivery;
- package integrity;
- asset versioning;
- update strategy;
- storage quotas/cleanup;
- local persistence hardening;
- sync resilience;
- migration execution safety;
- schema/data version compatibility;
- performance budgets;
- startup/loading performance;
- lazy loading/code splitting;
- memory pressure;
- media performance;
- network resilience;
- retry/idempotency infrastructure;
- secrets handling;
- security headers;
- XSS/content sanitization;
- CSP;
- CSRF/session boundary where applicable;
- auth/session transport hardening where applicable;
- dependency/supply-chain review;
- upload/import hardening;
- runtime integrity checks;
- error boundaries;
- observability/telemetry;
- backup/restore integration;
- disaster recovery engineering;
- non-functional release gates.

P14 does NOT own:

- learning content;
- mastery semantics;
- AI pedagogy;
- scenario pedagogy;
- authoring governance;
- visual redesign;
- production release decision.

---

# 3. NON-GOALS

P14 is not:

- a new UI redesign;
- a new curriculum phase;
- a feature expansion phase;
- a reason to rewrite working architecture without evidence;
- a blanket optimization pass with no baseline.

Do not “optimize” before measuring.

---

# 4. HARDENING PRINCIPLE

For every subsystem ask:

1. What is the source of truth?
2. What can fail?
3. What can become stale?
4. What can be retried?
5. What must be idempotent?
6. What must survive reload?
7. What can be cached?
8. What must never be cached?
9. What happens offline?
10. How do we recover without corrupting state?

---

# 5. FAILURE MODEL

Classify failures:

`NETWORK`

`CACHE`

`STORAGE`

`MIGRATION`

`SCHEMA`

`MEDIA`

`AI_PROVIDER`

`AUTH/SESSION`

`CONTENT_INTEGRITY`

`DEPENDENCY`

`SECURITY`

`RESOURCE_PRESSURE`

`DEPLOYMENT`

`BROWSER_CAPABILITY`.

Every critical journey needs defined behavior for relevant classes.

---

# 6. FAILURE ≠ LEARNER FAILURE

Technical failure must not automatically:

- mark answer wrong;
- consume attempt;
- reduce mastery;
- break streak;
- mark scenario fail.

P4 semantics win.

---

# 7. OFFLINE MODES

Define at least conceptually:

`ONLINE`

`DEGRADED_NETWORK`

`OFFLINE_CACHED`

`OFFLINE_PARTIAL`

`SYNC_PENDING`

`SYNC_CONFLICT`.

UI semantics come from P13.

---

# 8. OFFLINE CAPABILITY MATRIX

For each feature determine:

- works fully offline;
- works read-only;
- works with queued writes;
- unavailable;
- fallback.

At minimum audit:

- roadmap;
- lesson;
- vocab;
- grammar;
- SRS review;
- assessment practice;
- official assessment;
- listening;
- speaking recording;
- speech recognition;
- AI Mentor;
- scenario;
- writing;
- authoring/admin.

---

# 9. OFFLINE CORE

Core learning should continue offline when local pack/state permits:

- canonical lesson content;
- vocabulary;
- grammar;
- deterministic practice;
- SRS;
- downloaded media;
- draft writing;
- deterministic scenario fallback.

AI/external-service features may degrade.

---

# 10. ONLINE-ONLY FEATURE LABEL

If a feature truly requires network:

state it clearly.

Do not let learner discover after completing half a task.

---

# 11. SERVICE WORKER OWNERSHIP

Exactly one canonical service worker/update strategy.

Avoid:

- multiple competing service workers;
- old registration paths;
- duplicate cache logic.

Audit existing code first.

---

# 12. SERVICE WORKER VERSION

Service worker build/version should be traceable to application release/build.

Do not use random manual cache names without lifecycle strategy.

---

# 13. SERVICE WORKER UPDATE

New worker should not silently break an active:

- assessment;
- recording;
- long draft;
- scenario.

Prefer safe activation point where architecture permits.

---

# 14. SKIP WAITING BOUNDARY

Do not use aggressive `skipWaiting`/reload behavior blindly.

Evaluate active-session risk.

---

# 15. CLIENT CLAIM

Likewise, new worker claiming tabs must not mix incompatible runtime/data versions.

---

# 16. CACHE CATEGORIES

Separate caches conceptually:

`APP_SHELL`

`STATIC_ASSETS`

`CANONICAL_CONTENT`

`MEDIA`

`OFFLINE_PACK`

`RUNTIME_NETWORK`

`DERIVED_INDEX`

`TEMPORARY`.

Do not use one giant cache.

---

# 17. CACHE KEY

Cache identity may require:

- resource URL;
- content revision;
- pack revision;
- locale/support language;
- media revision.

Do not cache mutable content only by pretty URL if revision matters.

---

# 18. APP SHELL CACHE

Use for stable shell assets.

Must invalidate on incompatible build.

---

# 19. CANONICAL CONTENT CACHE

Tie to content snapshot/revision.

Avoid mixing lesson from snapshot A with assessment from snapshot B if contract requires coherence.

---

# 20. MEDIA CACHE

Large media should use appropriate strategy:

- explicit pack download;
- LRU cleanup;
- on-demand cache.

Do not fill storage uncontrollably.

---

# 21. DERIVED INDEX CACHE

Search/index artifacts can be rebuilt.

They are not source of truth.

Corruption should trigger rebuild/fallback.

---

# 22. TEMPORARY CACHE

AI responses/preview data should not pollute long-term canonical cache.

---

# 23. CACHE STRATEGY

Choose per resource:

`CACHE_FIRST`

`NETWORK_FIRST`

`STALE_WHILE_REVALIDATE`

`NETWORK_ONLY`

`CACHE_ONLY`

based on semantics.

Do not apply one strategy globally.

---

# 24. CACHE-FIRST USE

Appropriate for immutable hashed assets.

Less appropriate for rapidly changing state.

---

# 25. NETWORK-FIRST USE

Appropriate for fresh content/status when offline fallback exists.

Need timeout.

---

# 26. STALE-WHILE-REVALIDATE

Use only when stale display is acceptable and revision mismatch cannot corrupt state.

---

# 27. NETWORK-ONLY

Use for sensitive operations that must not replay from stale cache.

Examples may include protected admin actions.

---

# 28. CACHE-ONLY

Useful for explicitly downloaded offline packs.

---

# 29. CACHE POISONING

Treat network content as untrusted until response/content type/integrity checks pass where applicable.

Do not cache error HTML as JSON content.

---

# 30. RESPONSE VALIDATION

Before caching canonical JSON:

- successful status;
- expected content type;
- schema/basic parse;
- revision identity.

---

# 31. CACHE ERROR RESPONSE

Never cache:

- 401 login page;
- 404 HTML;
- provider error;

under canonical data key.

---

# 32. STALE AUTH CACHE

Protected admin/API responses must not be exposed from shared/public cache incorrectly.

Use appropriate cache-control/private boundaries.

---

# 33. CACHE CLEANUP

On new release:

remove obsolete caches safely.

Do not delete active offline pack still required unless incompatible and migration strategy exists.

---

# 34. CACHE MIGRATION

If cache format changes:

migrate or invalidate deterministically.

Do not leave orphaned gigabytes.

---

# 35. STORAGE LAYERS

Possible:

- memory;
- localStorage;
- IndexedDB;
- Cache Storage;
- backend;
- file/object storage.

Each has defined ownership.

---

# 36. LOCALSTORAGE BOUNDARY

Use only for small non-critical/preferences where appropriate.

Do not store large canonical datasets or long drafts casually.

---

# 37. INDEXEDDB

Suitable for structured offline state/content where architecture uses it.

Need schema/version migration.

---

# 38. CACHE STORAGE

For request/response assets.

Not a generic database.

---

# 39. STORAGE QUOTA

Detect/handle quota pressure.

Do not wait for random write failure.

---

# 40. STORAGE PRESSURE POLICY

Cleanup priority:

1. disposable temporary cache;
2. regenerable derived data;
3. old media packs;
4. old inactive content packs;

protect:

- unsynced learner work;
- attempts;
- drafts;
- required current pack.

---

# 41. NEVER DELETE UNSYNCED WORK SILENTLY

Invariant.

---

# 42. STORAGE ESTIMATE

If browser API supports:

estimate usage/quota.

Use as advisory.

Do not assume exact values cross-browser.

---

# 43. OFFLINE PACK

A content pack should define:

- pack ID;
- content snapshot;
- assets;
- media;
- size;
- dependencies;
- checksum/integrity metadata;
- schema version.

---

# 44. PACK MANIFEST

Machine-readable.

Do not infer package contents from folder listing at runtime.

---

# 45. PACK VERSION

Stable and comparable.

---

# 46. PACK ATOMICITY

Avoid partially installed pack appearing complete.

Use staging:

download

→ verify

→ commit active.

---

# 47. INTERRUPTED DOWNLOAD

Resume or restart safely.

No corrupted active pack.

---

# 48. PACK CHECKSUM

Verify downloaded files where supported/appropriate.

Checksum proves bytes, not semantic correctness.

---

# 49. PACK DEPENDENCY

Example:

stage pack may depend on core pronunciation assets.

Manifest makes explicit.

---

# 50. PACK SIZE

Measure.

Do not ship all 8,000 vocab + all audio/video eagerly if unnecessary.

---

# 51. PACK GRANULARITY

Possible:

- core app;
- current stage;
- domain pack;
- media pack.

Balance:

too large

vs

too fragmented.

---

# 52. PACK UPDATE

Diff/incremental update if architecture supports and complexity justified.

Otherwise safe replace.

---

# 53. PACK ROLLBACK

Keep last known-good pack metadata where storage allows.

---

# 54. CONTENT SNAPSHOT COHERENCE

Offline pack should use one coherent content snapshot.

Do not mix arbitrary revisions.

---

# 55. CONTENT SNAPSHOT ID

Tie to P12 activation/release snapshot.

---

# 56. APP VERSION / CONTENT VERSION

Separate:

application build version

from:

content snapshot version.

Content may update without app binary.

---

# 57. SCHEMA COMPATIBILITY

App declares which content schema versions it can read.

---

# 58. FORWARD INCOMPATIBILITY

If content schema too new:

do not attempt partial parse.

Show update required/fallback.

---

# 59. BACKWARD COMPATIBILITY

Maintain where practical across supported window.

Do not carry indefinite legacy forever; P16 retires.

---

# 60. DATA MIGRATION

Migration classes:

`CONTENT_SCHEMA`

`LEARNER_STATE`

`SRS_STATE`

`SCENARIO_STATE`

`DRAFT_STATE`

`CACHE/PACK`

`SETTINGS`.

Each has separate risk.

---

# 61. MIGRATION INVARIANTS

Migration must preserve:

- stable IDs or aliases;
- first attempts;
- official scores;
- learner drafts;
- SRS due semantics;
- scenario history;
- content provenance.

Unless explicit correction/migration policy says otherwise.

---

# 62. MIGRATION VERSION

Persist current schema/state version.

Do not guess migration need from field existence only.

---

# 63. MIGRATION CHAIN

Prefer:

v1 → v2 → v3

or verified direct migration.

No ambiguous jumps.

---

# 64. MIGRATION IDEMPOTENCY

Running migration twice must not duplicate/corrupt.

---

# 65. MIGRATION TRANSACTION

Where storage supports:

atomic transaction.

Otherwise staged copy + verify + swap.

---

# 66. MIGRATION BACKUP

Before destructive local-state migration:

snapshot/backup where feasible.

---

# 67. MIGRATION DRY RUN

For backend/content migration:

report affected records/errors.

---

# 68. MIGRATION RESUME

Interrupted migration should resume or safely restart.

---

# 69. MIGRATION FAILURE

Do not continue app with half-migrated critical state.

Enter recovery/read-only/fallback state.

---

# 70. MIGRATION TELEMETRY

Record:

from;
to;
success/failure;
duration;
error class.

Avoid raw private content.

---

# 71. CONTENT ID MIGRATION

Use aliases/mapping from P3/P12.

---

# 72. LEARNER STATE MIGRATION

Must not inflate/erase mastery.

P4 owns semantic mapping.

P14 implements safely.

---

# 73. SRS MIGRATION

Preserve:

due;
interval;
history

according to P5 policy.

---

# 74. SCENARIO STATE MIGRATION

Use P11 revision mapping.

If impossible:

preserve history;
restart session safely.

---

# 75. DRAFT MIGRATION

Never silently drop long writing draft.

---

# 76. SETTINGS MIGRATION

Unknown/removed preference falls back safely.

---

# 77. PERFORMANCE BASELINE

Before optimization measure representative:

- cold load;
- warm load;
- route navigation;
- lesson open;
- search;
- SRS open;
- audio start;
- recorder start;
- scenario load;
- writing editor;
- authoring list;
- bulk import preview.

---

# 78. DEVICE BASELINE

At least: