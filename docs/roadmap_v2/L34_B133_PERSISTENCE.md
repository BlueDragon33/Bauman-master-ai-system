# L34 / B133–B135 — Provider-neutral persistence boundary

## Scope decision

L34 opens persistence only as a provider-neutral declarative contract and an isolated transactional in-memory harness. No Neon, Supabase, or other provider is selected; no database connection, SQL migration, production backup, production restore, user provisioning, authentication session, or runtime activation occurs.

The migration order remains inventory → normalize → separate layers → site → backend → database persistence → multi-device sync → Personal AI. Authentication remains staged after the site/backend/database boundary is stable, and no plaintext password or password column is permitted.

## Compatibility boundary

Existing `localStorage` data is retained. Its planned role changes gradually to temporary cache/offline fallback through an additive compatibility adapter; L34 performs no destructive client rewrite and does not modify any legacy route or production entrypoint.

Static curriculum content remains in hash-pinned file sidecars. Only dynamic user data is represented by the relational model.

## Relational model

The declarative model contains 12 tables:

- one opaque identity root (`users`);
- 11 tables with a mandatory non-null `user_id` ownership column;
- one append-only authority (`learning_events`);
- transactional control for idempotency keys and per-user sync heads;
- rebuildable mastery/weak-topic projections that never override the event stream;
- assessment, schedule, bookmark, mentor-history, and preference records.

There are zero password columns. Future production activation requires least-privilege database roles, row-level ownership enforcement, encrypted transport/storage, checksum-journaled migrations, and a successful backup/restore drill.

## Migration and rollback design

Four checksum-pinned, transactional, declarative migrations create 12 tables and four indexes. The in-memory schema simulator proves the ordered `up` path and exact reverse `down` path on an empty/isolated target. Automatic destructive production down-migration and in-place restore are forbidden.

The production rollback design is stop writes → restore the last verified backup into a fresh isolated target or apply a reviewed forward fix → verify → atomically switch only after all checks pass.

## Transaction and sync harness

The reference store is process-memory only. It enforces:

- trusted actor/user equality and device ownership;
- opaque IDs and a 100-event maximum batch;
- validation of the entire ordered batch before copy-on-write commit;
- exact idempotent replay for the same key/request;
- conflict on key reuse with a different request;
- stale-base rejection with the current server cursor;
- rejection of duplicate/unknown/cross-user events without partial writes;
- cursor-based paginated change reads for a second device.

The backup is canonical JSON with SHA-256, schema version, migration set, record counts, ownership, referential-integrity, and exact cursor checks. Restore validates into isolated state and swaps only after every check passes. Tamper, schema drift, orphan/cross-user records, device ownership mismatch, and cursor mismatch leave current state unchanged.

## Focused evidence

- B133 contract: PASS
- B134 relational model, migration/rollback, and backup/restore design: PASS
- B135 deterministic transactional harness: PASS
- Failure/security/atomicity tests: 49/49 PASS
- Provider connections, production migrations, production writes, backups, restores, runtime activations, and legacy mutations: all `0`

B136 full-checkout acceptance: PASS on GitHub Actions run `31684234897`, validating implementation commit `9ba38ec821be64e5b1855d03a404214a28f274a7` across the complete L19–L34 regression, deterministic artifacts, Chromium regressions, and production boundary.
