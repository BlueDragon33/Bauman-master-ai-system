# RE21 — INTEGRATION TRANSACTION HUB

Owners: RU04 + RU08 + C1 + C3 + C4

Mission: orchestrate Engine observation -> RU04 evidence candidate -> planner candidate as one explicit transaction without becoming mastery/planner authority.

Rules:
- accept only non-authoritative Engine observations;
- build RU04 bundle through RE17;
- optionally apply only to an injected RussianAssessmentMastery owner;
- derive planner candidates through RE18;
- keep all side effects explicit;
- stable transaction ID;
- repeat transaction is idempotent;
- provider failure never becomes learner failure;
- no stage gate/mastery/default-on mutation.

PASS when dry-run and apply modes are deterministic and repeated apply cannot duplicate attempt/evidence.
