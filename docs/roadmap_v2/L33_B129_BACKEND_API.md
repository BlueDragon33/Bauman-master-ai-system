# L33 / B129–B131 — Provider-neutral Backend/API boundary

## Scope decision

The recovered migration order is inventory → normalize → separate layers → site → backend → database → sync → Personal AI. Because persistence is explicitly deferred to L34/B133, L33 establishes a disconnected provider-neutral API contract and fail-closed reference adapter. It does not start a production server or connect a database.

## Data classification

Static content remains hash-pinned content data: Registry, graph, lessons, exercises, simulations, and assessment blueprints.

Dynamic user data is reserved for the future persistence layer: learning events, mastery snapshots, assessment attempts, schedule, bookmarks, weak topics, mentor history, preferences, and sync cursors.

## Planned API surface

| Operation | Method/path | Harness behavior |
|---|---|---|
| Health | `GET /api/v1/health` | In-memory read-only |
| Catalog summary | `GET /api/v1/catalog/summary` | Authenticated in-memory read-only; pinned 10/85/304/8 counts |
| Learning state | `GET /api/v1/users/{userId}/learning-state` | Owner-only, then blocked: persistence unavailable |
| Append events | `POST /api/v1/users/{userId}/learning-events` | Owner-only, then blocked: persistence unavailable |
| Read schedule | `GET /api/v1/users/{userId}/schedule` | Owner-only, then blocked: persistence unavailable |
| Write schedule | `PUT /api/v1/users/{userId}/schedule` | Owner-only, then blocked: persistence unavailable |
| Sync changes | `POST /api/v1/users/{userId}/sync/changes` | Owner-only, then blocked: persistence unavailable |

Only health is public. Every other operation requires a trusted server authentication context. User-specific routes require exact ownership before any data lookup. Caller-supplied roles, frontend secrets, default credentials, plaintext passwords, and email-as-resource-ID are forbidden.

## Future sync contract

The future atomic batch carries opaque user/device IDs, an idempotency key, a base cursor, and ordered events. Stale base cursors reject with a conflict and server cursor; cross-user access and unknown event types reject the entire batch. Partial writes are forbidden. L33 performs zero sync writes and resolves zero conflicts.

## Focused validation

- B129 Backend/API boundary: PASS
- B130 API and Sync contracts: PASS
- B131 disconnected deterministic harness: PASS
- B131 failure modes: 28/28 PASS
- B132: awaiting full-checkout L19–L33 regression and production boundary

Production servers/routes, database connections/migrations, user/session/token records, event writes, and sync writes: all `0`.
