# Russian RU04 Phase Record

State: **PASS**

Baseline: `main@259690eb462007ebc16c46989184b7cb3ffe754e`

RU04 consolidates the former P4 assessment/mastery and P5 adaptive/SRS work into one active owner boundary.

## Preserved runtime owners
- official attempt/evidence/mastery: `assessment-mastery.js`;
- canonical review timing policy: `review-scheduler.js`;
- one Today/recommendation orchestrator: `adaptive-planner.js`;
- cross-skill review queue/history provider: `learning-state.js`;
- vocabulary-card state provider: `vocab-srs.js`.

The providers remain intentionally non-overlapping state owners. Review timing is now delegated to one canonical scheduler policy; the planner merges due work into one Today plan without gaining mastery authority.

## RU04 additions
- explicit RU05/RU06/RU07 evidence interface;
- canonical multi-semantic review scheduler with backward-compatible vocabulary gaps;
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
