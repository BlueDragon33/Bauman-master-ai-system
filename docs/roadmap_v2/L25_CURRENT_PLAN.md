# Lượt 25 — Current Plan · Bước 97–100

Status: `B97_IN_PROGRESS`

Prerequisite: L24/B96 PASS on the complete six-gate set.

Historical L25 is design evidence only. Current Priority artifacts must be rebuilt/revalidated on the accepted modern baseline.

## B97 — Priority Contract

Modernize the Priority contract against Consumer Blueprint + Mastery V2.

Locked rules:

- weighted formula: 35% Master relevance / 30% knowledge gap / 20% prerequisite urgency / 15% forgetting risk;
- all normalized features in [0,1];
- output score in [0,100];
- critical gap needed within four weeks overrides weighted band to `critical`;
- Existing Competency with valid retention may become `review_on_demand`, never `master_ready`;
- stable deterministic ranking;
- no persistence, scheduler write or runtime activation;
- no historical manifest/hash dependency.

## B98 — Deterministic scoring harness

Implement/re-admit a current in-memory Priority harness that derives gap/retention features from explicit non-persisted Mastery snapshots and explicit candidate metadata.

## B99 — Stable ranking / strict validation

Validate critical-first ordering, score order, due-time tie-break, stable target-ID tie-break, duplicate rejection and malformed candidate rejection.

## B100 — Full-system closeout

Compose B97–B99, validate quarantine/read-only boundaries and run all six project gates.

L26 remains blocked until B100 is fully green.

## Quality rule

Any defect or missing architecture discovered inside L25 creates an `L25-Fx` or `L25-Hx` step before later main steps continue.
