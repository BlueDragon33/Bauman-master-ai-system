# RE39 — CANONICAL SCENE COMPILER

Owners: RU03 + RU08 + C1 + C3

Mission: compile only human-approved scenes into canonical-reference artifacts.

Requirements:
- exact review decision match;
- APPROVE only;
- reviewerType HUMAN;
- exact revision + fingerprint;
- preserve source fixture history;
- generate canonical ref, never overwrite source fixture;
- include approval metadata and content fingerprint;
- reject partial/stale/AI decisions.

Commercial eligibility remains separate from linguistic approval.

PASS when unreviewed content cannot compile and approved content produces deterministic canonical artifacts.
