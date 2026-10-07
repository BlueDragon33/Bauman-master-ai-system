# RE27 — BROWSER DURABLE OUTBOX

Owners: RU04 + RU08 + C1 + C3

Mission: persist pending Engine observations locally so reload/offline interruption cannot lose learner evidence or duplicate owner writes.

Requirements:
- local storage adapter with explicit schema/key;
- enqueue by deterministic messageId;
- delivered rows retained for audit;
- retry counter + last error;
- no raw audio storage;
- storage corruption fails closed with recoverable empty state;
- retry after reload preserves original attempt/evidence identity.

PASS when simulated reload + failed delivery + retry produces one owner-visible result and preserved audit history.
