# RE26 — BROWSER EVIDENCE PIPELINE

Owners: RU04 + RU08 + C1 + C3 + C4

Mission: close the real learner loop in the browser so Engine observations become durable, non-authoritative RU04 evidence without requiring a backend.

Flow:
INTERACTION
→ ENGINE OBSERVATION
→ LOCAL OUTBOX
→ RU04 ATTEMPT + EVIDENCE
→ ACK
→ LOCAL DERIVED METRICS
→ PLANNER FOLLOW-UP CANDIDATE.

Requirements:
- browser-safe module files;
- deterministic evidence/message IDs;
- idempotent owner writes;
- first-attempt identity preserved by RU04 owner;
- retries append, never overwrite;
- provider failure never becomes learner failure;
- no mastery/stage unlock;
- no raw voice upload;
- works offline and retries later.

PASS when duplicate delivery does not duplicate RU04 evidence and a page reload can resume pending delivery.
