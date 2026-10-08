# RE51 — Adversarial QA of authority, approval and audio evidence

**ENGINEERING REVIEW ONLY. Not a HUMAN RU03 certificate.**

## Real defect found

RE45 structural `verifyReviewDecision()` accepted a caller-declared `reviewerAuthority: HUMAN_RU03` and matching hash even when the claimed reviewer was not registered. RE45 `buildReadinessReport()` then used that structural-only result as if it were authorization. With a future audio hash, two spoofed decisions could promote content. RE50 added a registry-aware validator but RE45 readiness still bypassed it.

## Correction

- `verifyReviewDecision()` is retained only as a legacy **shape/hash check**, never enough to grant authority.
- `verifyAuthorizedReviewDecision()` checks registry membership, unique active human identity, scope-specific qualification, explicit credential verification metadata, decision ID and UTC timestamp, and exact fingerprints.
- `buildReadinessReport()` now uses the **authorized** check and loads the production reviewer registry by default. If registry remains empty, no text/audio decision can promote content.
- AUDIO requires a recorded file under the engine's controlled content/audio directory, a safe filename, and a SHA-256 recomputed from the actual bytes, not merely an unverified hash string.
- RE50 uses the same authorized decision checker. Review templates now contain `decision: null`, not a prefilled `APPROVE`.
- New adversarial unit tests explicitly show that the old structural validator accepts a spoof, while the new promotion validator blocks it. Synthetic reviewer fixtures are **tests only** and are not present in the production registry.

## Remaining genuine human boundary

Registry metadata alone cannot prove someone is a human or professionally qualified; credential evidence must be verified out of band by an authorized independent party. No one is registered today. There is no production-grade reviewed audio. Do not substitute model opinion or the learner for a human expert.

Runtime lesson content, learner state, CSS, mastery, source fixture originals, service worker and production site remain untouched. All gates must pass on this exact head before an ordinary engineering merge.
