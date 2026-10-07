# RE22 — DURABLE OBSERVATION OUTBOX

Owners: RU04 + RU08 + C1 + C3

Mission: keep Engine observations retryable across interruption/offline delivery without losing first-attempt identity or duplicating owner writes.

States:
PENDING -> DELIVERING -> DELIVERED
or PENDING/DELIVERING -> FAILED_RETRYABLE.

Requirements:
- storage adapter abstraction;
- deterministic message ID from evidence identity;
- enqueue idempotency;
- lease/recovery for interrupted delivery;
- acknowledge only after owner apply returns;
- retry metadata;
- no deletion of delivered history by default.

PASS when crash/retry simulations preserve exactly-once observable owner result through idempotent owner contracts.
