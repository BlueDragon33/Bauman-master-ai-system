# RE29 — RUNTIME PRIVACY / AUDIT

Owners: RU08 + C1 + C3

Mission: prove the integrated browser evidence path stores only necessary structured learning evidence.

Must forbid persistence of:
- raw voice blobs;
- microphone streams;
- browser provider private IDs;
- payment/billing IDs;
- unrelated app state.

Audit metadata may include:
- evidenceId;
- attemptId;
- experienceId;
- competency IDs;
- result;
- support level;
- delivery status;
- revision;
- timestamps.

PASS when a persisted outbox row can be inspected and contains no forbidden sensitive runtime payload classes.
