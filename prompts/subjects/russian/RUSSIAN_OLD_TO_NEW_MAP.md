# RUSSIAN OLD P0–P17 → NEW RU00–RU08 MAP

The former P0–P17 prompt architecture is **superseded as the default execution topology**.

Its detailed clauses are retained in `legacy/`.

Nothing important should be deleted merely because the topology changed.

| Former owner | New active owner | Global constitution / note |
|---|---|---|
| P0 Master Orchestration | RU00 | C1/C3 shared execution rules where global |
| P1 Forensic Audit | RU01 | C1+C2+C3+C4 targeted audit |
| P2 Curriculum Reconstruction | RU02 | C4 academic authority |
| P3 Content Schema | RU02 | C1 content-as-data + C4 academic schemas |
| P4 Assessment/Mastery | RU04 | C4 is global mastery constitution |
| P5 Adaptive/SRS | RU04 | C4 adaptive boundaries + C3 state QA |
| P6 Listening/Speaking/Audio | RU05 | C1 capability + C4 evidence + C2 UI |
| P7 Linguistic Authority | RU03 | Russian-specific truth owner |
| P8 Academic/Technical Russian | RU06 | C4 academic depth |
| P9 Reading/Writing/НИР/ВКР | RU06 | C4 research/output/evidence |
| P10 AI Mentor | RU07 | C1 AI capability + C4 AI authority boundary |
| P11 Scenario/Simulation/Dialogue | RU05 | unified oral/scenario experience owner |
| P12 Authoring/Governance | RU08 | C1 global authoring platform + C4 academic authoring |
| P13 UX/Accessibility/Responsive | RU08 integration only | C2 is canonical global UI/UX owner |
| P14 Offline/Packaging/Performance/Migration/Security | RU08 Russian-specific acceptance only | C1+C3 own generic platform hardening |
| P15 Full-System QA | RU08 acceptance matrix | C3 is canonical QA owner |
| P16 Legacy/RC Freeze | RU08 | C1+C3 shared migration/release readiness |
| P17 Production | Shared C3 Release Annex | no longer a Russian subject phase |

---

# Key consolidation decisions

## P2 + P3 → RU02

Curriculum and Russian canonical entity semantics belong together.

Truth validation remains separate in RU03.

## P4 + P5 → RU04

Assessment/mastery and adaptive/SRS share the same evidence/state boundary.

Adaptive chooses the path; it cannot redefine mastery truth.

## P6 + P11 → RU05

Low-level audio/speech and high-level dialogue/scenario state are one interaction family.

Datasets remain separate.

## P8 + P9 → RU06

Academic/technical language and reading/writing/НИР/ВКР are one advanced-production pathway.

## P10 → RU07

AI remains separate because it is cross-cutting and high-risk.

## P12–P16 → RU08 + global constitutions

The old prompts contained substantial platform/UI/QA material that is not Russian-specific.

That material is now routed to C1/C2/C3/C4 instead of being duplicated.

## P17 → shared release annex

Release is a platform operational responsibility.

Russian only provides exact RC inputs and production smoke journeys.

---

# Source recovery rule

If a new RU prompt appears to omit an important edge case:

1. search the mapped former P file in `legacy/`;
2. determine whether the clause is:
   - global constitution responsibility;
   - Russian-specific responsibility;
   - obsolete duplication;
3. patch the canonical new owner;
4. add a migration note;
5. do not resurrect the old P0–P17 execution chain.
