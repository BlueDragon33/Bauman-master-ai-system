# RE37 — LINGUISTIC STRUCTURAL PREFLIGHT

Owner: RU03

Mission: catch review-preparation defects without pretending to judge Russian correctness.

Allowed deterministic checks:
- Russian language tag;
- Cyrillic presence;
- non-empty stimulus;
- expected object exists;
- semantic relation aligns with declared semantic target;
- duplicate surface text conflicts;
- missing accessibility labels;
- revision/status/provenance completeness;
- translation leakage;
- unsupported canonical-state claims.

Forbidden:
- declaring grammar/pronunciation/naturalness correct;
- converting warnings into RU03 approval;
- inventing stress/accepted variants.

PASS when structural defects fail closed and linguistic correctness remains REVIEW_REQUIRED.
