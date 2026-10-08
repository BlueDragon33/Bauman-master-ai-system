# RE38 — HUMAN REVIEW DECISION REGISTRY

Owner: RU03

Mission: record immutable human linguistic review decisions.

Allowed decisions:
- APPROVE;
- CHANGES_REQUESTED;
- REJECT.

APPROVE requires:
- authority = RU03;
- reviewerType = HUMAN;
- reviewerId;
- scene ID;
- exact reviewed revision;
- exact reviewed fingerprint;
- decision timestamp;
- optional notes/accepted variants.

AI/SYSTEM reviewer types cannot approve.
A stale revision/fingerprint cannot approve newer content.
Repeated identical decision is idempotent; conflicting decision ID fails.

PASS when human approval is explicit, revision-bound and immutable.
