# RE28 — EVIDENCE-DRIVEN PLANNER FEEDBACK

Owners: RU04 + RU08 + C4

Mission: generate planner candidates from actual Engine result/support state, not a fixed generic follow-up.

Rules:
- success with zero support may propose transfer/continue;
- success with high support may propose reinforcement;
- failure may propose remediation;
- infrastructure failure proposes no learner-remediation task;
- candidate IDs deterministic from evidence/revision;
- planner remains final authority;
- no manualOverride.

PASS when different evidence outcomes deterministically produce different explainable candidate reasons while infrastructure failure yields no learner-remediation candidate.
