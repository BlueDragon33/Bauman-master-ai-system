# RE27 — BROWSER DURABLE OUTBOX

Owners: RU04 + RU08 + C1 + C3

Mission: provide localStorage-backed browser durability for Engine observations.

Requirements:
- profile-scoped storage key;
- deterministic message ID;
- PENDING / DELIVERING / DELIVERED / FAILED_RETRYABLE;
- enqueue idempotency;
- stale DELIVERING recovery;
- bounded retained history;
- explicit clear/export;
- no raw audio blob storage;
- storage failure surfaces as infrastructure failure, not learner failure.

PASS when refresh/retry simulations preserve pending messages and duplicate delivery remains idempotent.
