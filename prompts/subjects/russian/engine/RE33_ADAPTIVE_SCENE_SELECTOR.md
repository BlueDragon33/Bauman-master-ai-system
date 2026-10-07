# RE33 — ADAPTIVE SCENE SELECTOR

Owners: RU04 + RU08

Mission: choose the next grounded scene from evidence and transfer needs, not fixed array order.

Inputs:
- scene catalog;
- completed scene IDs;
- recent success/support;
- desired setting;
- capability availability;
- transfer priority.

Policy:
- retry/remediate high-support or failed semantic targets;
- prefer unseen transfer after independent success;
- avoid exact immediate repeats unless remediation is required;
- deterministic tie-breaking;
- unavailable capability fails closed.

PASS when selector produces stable explainable next-scene decisions for remediation, transfer and new-content cases.
