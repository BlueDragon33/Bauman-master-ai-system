# MATH02 · ACADEMIC BLUEPRINT

Status: PASS  
Canonical owner proposal: `prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json`  
Runtime mutation: NO

## 1. Canonical curriculum topology

The canonical ordering model is:

`stage → discipline → chapter → lesson`

`module/unit` is optional metadata only when it groups chapters without becoming a second ordering authority.

The durable curriculum truth is the canonical model plus retained stable IDs imported from current runtime data. Roadmap UI, E129/E186 hierarchy, subject manifests, frame files, search indexes and legacy exports are projections only.

## 2. Scope accepted from MATH01

Current retained structural scope:
- 10 stages;
- 12 disciplines;
- 56 chapter spine entries;
- 86 audited live lesson IDs across 17 content-bearing chapter IDs;
- existing chapter/lesson IDs remain stable until an explicit migration says otherwise.

Planned/historical counts are not content truth.

## 3. Academic families

The canonical model supports these curriculum families without forcing all into one course:
- mathematical language, notation, sets and logic;
- algebra and equations;
- functions and graphs;
- trigonometry and analytic geometry;
- vectors and linear algebra;
- single and multivariable calculus;
- differential equations;
- probability and statistics where Math owns them;
- numerical methods;
- optimization/operations research where Math owns them;
- engineering mathematical applications for signal, control, AI and CS.

Whether a chapter belongs to Math or another subject is decided by owner registry, not UI placement.

## 4. Competency model

Canonical competency dimensions:
1. conceptual understanding;
2. symbolic fluency;
3. procedural calculation;
4. representation conversion;
5. reasoning/justification;
6. proof;
7. problem solving;
8. modeling/application;
9. numerical/computational implementation;
10. interpretation/communication;
11. transfer.

Exposure, progress, performance and mastery are distinct evidence states. Completion/self-report cannot directly grant mastery.

## 5. Mathematical truth model

Canonical mathematical truth is represented by stable entities:
- concept;
- definition;
- notation;
- assumption/domain condition;
- formula/identity;
- theorem/proposition/lemma;
- representation;
- worked example;
- problem family;
- misconception;
- remediation;
- competency;
- outcome;
- prerequisite;
- provenance.

Every theorem/formula/definition can carry assumptions/domain/provenance. UI strings and AI explanations are projections, not truth owners.

## 6. One fact · one owner

Canonical facts are owned once and referenced by ID. Derived indexes may duplicate for performance only when regenerable.

Runtime compatibility layers may resolve aliases, but they may not author a competing curriculum or mathematical fact.

## 7. Stable ID rules

- Existing learner-referenced stage/chapter/lesson IDs are retained by default.
- New canonical entities use namespace-prefixed immutable IDs.
- Display title and language are not part of identity.
- Renaming never resets learner evidence.
- Alias resolution is deterministic and one-way to a canonical ID.

## 8. Prerequisite graph

Prerequisites form a DAG where possible. Validators must fail on:
- self edges;
- cycles;
- dangling competency/concept IDs;
- prerequisite references to retired IDs without alias;
- lesson evidence for an untaught competency.

Cross-subject prerequisites use external contracts rather than copied content.

## 9. Representation and exactness

Representations are linked views of one concept:
- symbolic;
- equation/inequality;
- set/interval;
- graph;
- table;
- geometry;
- vector/matrix;
- verbal;
- algorithm/code;
- numerical approximation.

Canonical data distinguishes exact, rounded, measured and approximate values.

## 10. Misconception/remediation model

An error pattern links:
`cause hypothesis → prerequisite/competency → remediation → recheck evidence`.

Canonical misconception categories include invalid algebra, sign errors, domain loss, extraneous roots, theorem-condition errors, unit mismatch, matrix dimension errors, graph interpretation errors, numerical precision errors, proof gaps and modeling errors.

## 11. Provenance

Authority classes:
`AUTHORITATIVE | CURATED | GENERATED_CANDIDATE | DERIVED | LEGACY | UNKNOWN`.

Generated candidate content cannot silently become canonical theorem/formula/answer-key truth.

## 12. MATH02 pilot slice

The first downstream pilot must include at minimum:
- one concept;
- one definition or theorem/formula with assumptions;
- one representation;
- one worked multi-step problem;
- one competency and prerequisite path;
- one misconception/remediation path;
- one assessment evidence requirement.

MATH03/MATH04 must consume this without inventing another fact store.

## 13. Compatibility policy

Until replacement acceptance passes:
- E240 durable theory bridge remains supported;
- E186 learner route remains supported;
- current stable IDs remain accepted;
- local learner-state keys are not rewritten;
- runtime JS hierarchy is read-only compatibility metadata and must eventually derive from canonical data.

## 14. Count semantics

Every count must be labeled as one of:
- `actualRecordCount`;
- `plannedTargetCount`;
- `coverageCount`;
- `derivedIndexCount`;
- `legacyCompatibilityCount`.

No generic `count` field may be used to imply current content truth when the source is planned or historical.

## 15. Exit-gate acceptance

MATH02 passed its repository gate on exact tested head `e3a2588505504cc2c154e6ce2e95af1afbca4a90`.

Executable evidence:
- 56 canonical chapter IDs were retained;
- 86 audited sidecar lesson IDs were retained;
- 2,024 sidecar chapter/lesson references were checked with no orphan detected;
- `theory_lecture_content.json` contains 102 measurable records;
- Math Learning App Gate run `37116036092` passed;
- Whole System Integration Gate run `37116036068` passed direct and packaged acceptance.

This acceptance authorizes MATH03 to consume the canonical contract. It does **not** activate runtime schema migration, rewrite learner state, or make presentation/runtime projections canonical owners.
