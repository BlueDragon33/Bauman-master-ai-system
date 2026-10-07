# RE29 — ENGINE SESSION ORCHESTRATOR

Owners: RU02 + RU04 + RU05 + RU08 + C1 + C3 + C4

Mission: orchestrate one learner session across experience selection, interaction evidence, outbox delivery, metrics and planner follow-up.

Session state:
CREATED → ACTIVE → COMPLETED / ABORTED.

Requirements:
- exact content/pack revision;
- experience ID;
- profile scope;
- capability snapshot;
- support history;
- evidence journal;
- outbox status;
- derived metrics snapshot;
- next-step candidate;
- deterministic export/resume.

Authority:
- session cannot grant mastery;
- session cannot change canonical linguistic truth;
- planner still decides final Today plan;
- RU04 owner remains attempt/evidence authority.

PASS when a session can be interrupted, resumed and completed without duplicate evidence or state loss.
