# Lượt 26 — Current Plan · Bước 101–104

Status: `B101_IN_PROGRESS`

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

Compose B101–B103 and run the complete six-gate set: Roadmap V2, Foundation, Windows checkout, Russian Reference UI, Cloudflare Preview/package and Whole System Integration.

L27 remains blocked until B104 and its documentation closeout are green.

## Quality rule

Any defect or missing architecture discovered inside L26 creates an `L26-Fx` or `L26-Hx` step. The next main step stays blocked until that subordinate step and the complete current gate are green.
