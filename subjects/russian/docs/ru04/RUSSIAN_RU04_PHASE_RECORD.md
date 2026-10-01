# Russian RU04 Phase Record

State: **PASS**

Baseline: `main@259690eb462007ebc16c46989184b7cb3ffe754e`

RU04 consolidates the former P4 assessment/mastery and P5 adaptive/SRS work into one active owner boundary.

## Preserved runtime owners
- official attempt/evidence/mastery: `assessment-mastery.js`;
- one Today/recommendation orchestrator: `adaptive-planner.js`;
- cross-skill review state provider: `learning-state.js`;
- vocabulary-card schedule provider: `vocab-srs.js`.

The two review providers remain intentionally non-overlapping. They do not compete for mastery authority and are merged by the canonical planner rather than exposed as two Today owners.

## RU04 additions
- explicit RU05/RU06/RU07 evidence interface;
- stable-plan recompute triggers;
- support-fading semantics;
- active/passive/reference vocabulary policy;
- intensive-mode truth boundary;
- recognition-vs-production routing rule.

No learner state migration or reset is introduced.

## Exit
- completion and mastery remain separate;
- first official attempts are immutable;
- mastery has one canonical authority;
- adaptive state cannot write mastery;
- planner is stable/explainable;
- productive skills are protected from vocabulary starvation;
- fallback is canonical sequence + due review;
- downstream modules have one evidence contract.

**RU04 STATE: PASS.**
