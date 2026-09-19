# Lượt 26 — Current Plan · Bước 101–104

Status: `PASS_B101_B103 · PASS_L26_F2 · PASS_L26_H2 · B104_DOCUMENTATION_CLOSEOUT_ACTIVE`

Prerequisite: L25/B100 final-state head `fa8d9b811080aec22a9d7b61dcc7791f55266dac` passed the complete six-gate set.

Historical L26 is design evidence only. The frozen static Scheduler contract remains provenance evidence. Current B101 uses additive `roadmap_v2/scheduler/current-contract.json`, rebuilt/revalidated against Consumer Blueprint + Priority V2; historical Consumer/Priority manifests remain quarantined.

## B101 — Scheduler / Master Mode contract

Revalidate the scheduler contract on the current baseline.

Locked rules:

- phases GD0–GD3 remain explicit;
- GD1 keeps 2–3 advisory technical sessions and Python/Database/Math rotation;
- GD3 Master Mode keeps Current Bauman override and 2–4 week preview window;
- scheduler consumes current Consumer Blueprint + Priority V2 boundaries, never quarantined manifests;
- caller-supplied Priority results are rejected; Priority is recomputed from current candidates;
- weekly projection only;
- no calendar read/write;
- no persistence;
- no runtime activation;
- no dynamic syllabus/lesson generation.

## B102 — Current weekly projector

Implement a read-only, in-memory weekly projector on top of the accepted B101 contract and current Priority V2 harness.

It must preserve:

- Critical-first ordering;
- GD3 verified Current Bauman override;
- deterministic capacity packing;
- atomic technical + Russian twin bundles;
- review-on-demand without Master-ready promotion;
- deep-frozen explainable output;
- zero writes and zero production wiring.

## B103 — Scheduler harness / adversarial validation

Validate deterministic projection, provenance, phase rules, preview bounds, GD1 rotation, review-on-demand, duplicate rejection, malformed input rejection, capacity safety and fail-closed behavior.

## B104 — Full-system closeout

Functional closeout on head `4d2bd743f0977d3a8202564549eb51a37164056e`: **PASS** across the complete six-gate set.

The documentation closeout/final-state head must now pass the same six gates before L27 may open.

L27 remains blocked until that final documentation state is green.

## Quality rule

Any defect or missing architecture discovered inside L26 creates an `L26-Fx` or `L26-Hx` step. The next main step stays blocked until that subordinate step and the complete current gate are green.


### H2 dynamic-target boundary

B102 preserves the current Consumer rule that dynamic `CUR-L4-*` / Russian dynamic templates remain uninstantiated. Verified Current Bauman provenance does not bypass Priority V2 target eligibility. The projector may prioritize admitted prerequisite knowledge targets sourced from verified current Bauman material; it may not schedule an uninstantiated dynamic template ID.


### F2 provenance-relation repair

B103 found and repaired a fail-open semantic provenance gap: verified Current Bauman and NIR sources must also carry the correct Master Mode relation. The current harness now rejects missing/wrong relations before projection. See `L26_F2_PROVENANCE_RELATION_FAIL_CLOSED.md` and `L26_B103_ACCEPTANCE.md`.
