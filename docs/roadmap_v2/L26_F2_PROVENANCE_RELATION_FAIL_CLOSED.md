# L26-F2 — Scheduler provenance relation fail-closed

Status: **PASS**

## Defect

B103 adversarial review found that a Scheduler item could declare a verified `current_bauman_official` or `nir_plan_verified` source while leaving `masterModeRelation` as `not_applicable`.

The source kind was therefore verified, but its semantic relation to the active Master Mode work was not proven.

## Repair

The current in-memory Scheduler harness now requires:

- current-subject preview/weekly/assessment work: `current_bauman_official` + `current_subject_prerequisite`;
- NIR/thesis work: `nir_plan_verified` + `nir_thesis_prerequisite`.

Wrong or missing relations fail closed before projection.

No canonical historical Scheduler contract was mutated. No calendar, persistence, runtime write, production integration or dynamic content generation was enabled.

## Evidence

Functional head: `4d2bd743f0977d3a8202564549eb51a37164056e`

- Roadmap V2 Current Gate — run `35436538205` — PASS
- Foundation Domain Model — run `35436538257` — PASS
- Windows checkout safety — run `35436538208` — PASS
- Russian Reference UI — run `35436538165` — PASS
- Cloudflare Preview — run `35436538355` — PASS
- Whole System Integration — run `35436538204` — PASS
