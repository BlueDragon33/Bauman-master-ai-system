# Lượt 6 · B4 · Lesson Type Registry

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

Registry:
assets/data/lesson/lesson-type-registry-v1.json

Gate:
scripts/academic/l6-b4-lesson-type-registry-regression.cjs

L6-B4 defines eight pedagogical/interaction types. It does not bind whole
subjects to one type and does not yet define mastery rubrics, the visual
contract, multilingual activation, Subject Factory mapping or rendering.

## 1. Subject is not lesson type

A subject is a curriculum container. A lesson type describes the primary
learner artifact, correctness test, interaction capabilities, presentation
strategies and evidence outputs of one lesson.

Consequences:

- A subject may contain several lesson types.
- Every lesson has exactly one primary type.
- A lesson may declare up to three secondary facets for terminology, context
  or optional capabilities.
- Secondary facets never merge block policies automatically.
- The primary type is the type that owns both the main artifact and the test
  that decides correctness.

This avoids recreating one-engine-per-subject coupling.

## 2. Profile contract

Each type defines:

- trilingual title, definition, use and avoid boundaries;
- its B3 block-policy reference;
- specialist capabilities and accepted source artifact kinds;
- presentation strategies and domain visual representations;
- expected evidence outputs and assessment modes;
- context priorities and offline resource classes;
- an optional audited compatibility reference;
- forward references for B5, B6, B7 and B10.

The registry consumes only values already registered by the V2 contract:
presentation strategies, source artifact kinds, context refs and offline
availability classes.

## 3. Eight canonical types

| Type | Primary artifact and correctness test | Specialist examples |
|---|---|---|
| language | Comprehension or language production | Dialogue, shadowing, listening, vocabulary, grammar, handwriting, writing |
| mathematics | Mathematical solution, derivation or model | Formula/matrix rendering, authoritative deck, simulation, professor oral |
| programming | Executable code behavior | Code lab, tests, debugger, trace, complexity |
| database | Schema, query, transaction or query plan | SQL playground, schema diagram, transaction scenario, optimizer view |
| software-design | Requirements, UML, architecture or design decision | UML/architecture workspace, traceability, design defense |
| ml-data | Reproducible dataset/model experiment | Dataset playground, metrics, model comparison, error analysis |
| asoiu-system | System model, flow, reliability or lifecycle analysis | Architecture, information flow, failure/reliability scenario, system defense |
| research | Traceable question, literature, protocol, evidence or НИР/ВКР milestone | Literature matrix, evidence vault, protocol, scientific writing, defense |

## 4. Boundaries that prevent misclassification

Language terminology support does not turn a technical lesson into a language
lesson. A mathematical derivation used by ML remains mathematics when the
derivation is the assessed artifact; a model-comparison experiment is ML/Data
when reproducibility and metrics decide correctness.

Executable application behavior is programming. A schema, SQL query,
transaction or execution plan is database. Requirements, UML and general
software architecture are software-design. An АСОИУ boundary, information
flow, reliability state or lifecycle is asoiu-system.

Research context alone does not make a lesson research. Research becomes the
primary type when the assessed artifact is a question, literature matrix,
protocol, source/evidence record, scientific section, НИР/ВКР milestone or
defense.

## 5. Composition rules

The registry includes four boundary examples:

1. PCA derivation: mathematics primary, ML/Data secondary.
2. PCA model-comparison experiment: ML/Data primary, mathematics and research
   secondary.
3. SQL index implementation in a Python service: database primary,
   programming secondary.
4. АСОИУ architecture for a ВКР: asoiu-system primary, software-design and
   research secondary.

Unresolved conflicts do not trigger a blind policy merge. They require an
explicit composite profile in a future registry version.

## 6. Reference-engine compatibility

Only two types declare audited compatibility references:

- language references Russian;
- mathematics references Mathematics.

Both are marked audited-reference-unprojected. B4 therefore does not claim
that a universal adapter or renderer already exists. Their preserve lists keep
Russian dialogue/deep-speaking/handwriting/review/exam/lazy behavior and
Mathematics formula/routing/artifact/simulation/oral/source-identity behavior
visible to later gates.

The remaining six types have no compatibility reference claim. Their full
engines and Subject Factory mappings are later work.

## 7. Context, offline and language boundaries

Context emphasis selects from the V2 runtime references: current lesson,
prerequisites, learner errors and weak topics, evidence, schedule, language
state and НИР/ВКР. It does not embed private learner history in static content.

Offline classes select bundled, subject-pack and local-file resources. The
registry does not change shell caching or large-data loading.

Titles are VI/RU/EN, while full Russian Twin and English Research activation
remains deferred to B7 and L12. Official-source code remains 09.04.01 and the
personalized ИУ-5 display remains 09.04.01/11.

## 8. Forward ownership

- B5 owns mastery stages, rubrics and thresholds by type.
- B6 owns visual representation and feedback contracts.
- B7 owns Russian Twin and English Research hooks.
- B8 owns formal schema, validator and migration.
- B9 maps subjects and lessons to the registry.
- B10 owns renderer and legacy bridges.
- B11 proves Russian/Mathematics compatibility and a light-subject pilot.

Forward references are declarations, not PASS claims.

## 9. Rollback

Rollback removes the B4 registry, document, report and gate, returns the B3
definition references to unresolved B4 anchors, and restores workflow/progress
markers to the B3 checkpoint. It does not change lesson content or runtime
state.

## 10. Acceptance

B4 passes only when:

1. Exactly the eight master-plan types exist.
2. Every type satisfies the common profile contract.
3. Every B3 type policy points to its exact B4 definition.
4. Capabilities, presentation strategies, sources, context and offline classes
   remain in their registered vocabularies.
5. The eight classification boundaries and composition rules are explicit.
6. Only Russian and Mathematics are labeled audited references, and neither is
   labeled migrated.
7. B1-B3 remain green, B4 regression passes deterministically, Russian/Math
   source/runtime has no diff, and relevant L5 gates do not regress.
