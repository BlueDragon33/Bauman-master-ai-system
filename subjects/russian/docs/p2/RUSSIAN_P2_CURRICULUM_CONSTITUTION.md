# Russian P2 Curriculum Constitution

Phase: **P2 — Deep Content & Curriculum Reconstruction**  
Parent evidence: P1 PASS on `audit/russian-p1-forensic-foundation-20260930`.

## Mission

Transform the existing Russian subject from a large material store into a competence-training system measured by:

`exposure → understanding → retrieval → controlled production → free production → transfer → real-world performance`.

Target journey:

`Pre-A0 → A0 Survival → A1 Functional → A2 Independent → B1 University → B1+/B2 Academic → Technical Russian → Research Russian → НИР → ВКР → Defense Q&A`.

P2 does **not** treat record count, vocabulary count, dialogue count, exercise count or lesson count as depth.

## Preserve-before-replace rule

P2 must audit and reuse the current:
- `curriculum.json`;
- `lessons.json`;
- `grammar.json`;
- `grammar-path.json`;
- `vocab.json`;
- `speaking.json`;
- `dialogue-bauman-az.json`;
- `deep-speaking-bauman.json`;
- `speaking-link-index.json`;
- `exercises.json`;
- `tests.json`;
- `handwriting.json`;
- `writing.json`;
- `videos.json`;
- `knowledge-index.json`;
- `simulations.json`.

Sequence: **AUDIT → NORMALIZE → ENRICH → LINK → VALIDATE** before **GENERATE MORE**.

## Curriculum layers

The target architecture keeps four simultaneous views instead of collapsing the learner to one level:

1. Chronological stage: foundation/Vietnam, prep, HK1, HK2, HK3/НИР, HK4/ВКР.
2. Linguistic progression: Pre-A0, A0, A1, A2, B1, B1+, B2/B2+ functional target.
3. Skill: phonetics, listening, speaking, reading, writing, vocabulary, grammar, interaction, academic, technical, research.
4. Functional domain: survival, dorm, transport, administration, classroom, university, mathematics, CS, database, AI/ML, control/automation, statistics, research, НИР, ВКР.

## Stable identity model

- R01–R26 are preserved as macro-module identities.
- Units use `Rxx-Uxx`.
- Micro-lessons use `Rxx-Uxx-Mxx`.
- No version is embedded in identity.
- Existing learner-facing/state references must not be invalidated in P2.
- P2 target files in `docs/p2` are design authority, **not runtime canonical schema**. Runtime schema ownership belongs to P3.

## Target macro-module responsibilities

- R01–R06: foundation/survival.
- R07–R10: preparatory Russian.
- R11–R14: Bauman HK1.
- R15–R18: Bauman HK2.
- R19–R22: HK3 / НИР.
- R23–R26: HK4 / ВКР.

The exact units and gates are machine-readable in `RUSSIAN_R01_R26_TARGET_CURRICULUM.json`.

## Skill architecture

P2 separately defines:
- phonetics progression and Vietnamese interference corpus;
- vocabulary as a lexical network, not a flat 8,000-word mastery claim;
- grammar dependency and function-first case semantics;
- listening L0–L10;
- speaking from listen/repeat through pressure Q&A;
- reading/writing ladders;
- academic discourse functions;
- mathematics/CS/AI/control/statistics Russian;
- research/НИР/ВКР production functions.

Machine-readable authority: `RUSSIAN_P2_SKILL_ARCHITECTURE.json`.

## Current-to-target rule

Current R01–R26 IDs are retained even when their current title/object responsibility does not match the Master Prompt target. Useful current material is re-homed later; it is not deleted because a title differs.

Machine-readable migration authority: `RUSSIAN_P2_CURRENT_TO_TARGET_MIGRATION_MAP.json`.

## Stage gates

- Foundation: airport → transport → dorm → administration → daily life.
- Prep: listen to instruction + read task + ask clarification + explain method.
- HK1: mini lecture → notes → 1–2 minute reconstruction.
- HK2: technical mini-report.
- HK3: 3–5 minute НИР presentation + unscripted Q&A.
- HK4: new technical scenario → read → listen → note → explain → present → defend.

## Spiral rule

Phonetics does not end at R01. Grammar does not end at R08.

Speaking rises:
`sentence → dialogue → explanation → presentation → research → defense`.

Listening rises:
`sound → sentence → announcement → classroom → technical explanation → lecture → seminar → defense`.

Writing rises:
`letters → sentences → forms → emails → notes → reports → НИР → ВКР`.

## P2 boundary

Allowed:
- curriculum responsibility reconstruction;
- target unit/micro-lesson graph;
- content re-homing plan;
- skill architecture;
- gap/risk/evidence mapping;
- contract tests.

Forbidden in P2:
- learner-state rewrite;
- mastery scoring rewrite;
- SRS persistence rewrite;
- canonical runtime schema replacement;
- deletion of existing useful content based only on title mismatch;
- fabrication of stress/morphology/government fields not verified.

Those responsibilities belong to P3–P6 and later owner phases.
