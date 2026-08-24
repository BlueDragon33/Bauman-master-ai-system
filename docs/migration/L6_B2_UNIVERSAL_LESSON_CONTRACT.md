# Lượt 6 · B2 · Universal Lesson Contract V2

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

L6-B2 defines the semantic contract shared by lesson engines. It does not
introduce a universal screen, rewrite any existing lesson, assign required
blocks by subject type, or claim that Russian and Mathematics have already
been migrated.

Contract:
assets/data/lesson/universal-lesson-contract-v2.json

Deterministic gate:
scripts/academic/l6-b2-universal-lesson-contract-regression.cjs

## 1. Why V2

The inspected experimental branch used an exact 18-section canonical flow.
Useful names and AI/offline ideas were retained, but the fixed flow was not.
The integrated contract is V2 so it cannot be confused with the unmerged
experimental V1 artifact.

V2 makes four corrections:

1. Semantic meaning is separate from navigation and presentation.
2. Block requiredness belongs to lesson-type profiles, which are defined in
   L6-B3 and L6-B4.
3. Content resolves through stable identity, ordered source bindings and
   provenance rather than one source path or array position.
4. Russian and Mathematics begin as read-only projections whose specialist
   engines keep control of interactions.

## 2. Instance envelope

Every conforming lesson projection exposes eight top-level fields.

| Field | Purpose |
|---|---|
| metadata | Stable lesson, subject, stage, program and source identity |
| prerequisites | Required, recommended, diagnostic and co-requisite links |
| objectives | Observable outcomes linked to evidence kinds |
| blocks | Addressable semantic blocks using the common block envelope |
| masteryEvidence | Evidence records for understand, solve, build/apply, explain and retain |
| contextRefs | Runtime references for personalization and AI context |
| offline | Resource availability and deterministic fallback |
| provenance | Explicit source, user, system-derived and AI-inference boundaries |

Metadata carries both direction-code roles:

- Official-source metadata: 09.04.01.
- Personalized learner display for ИУ-5: 09.04.01/11.

The source identity is not an array index. It contains an artifact identity,
artifact kind, version, locator, origin, adapter, and precedence.

## 3. Semantic block catalog

V2 registers 13 addressable block kinds.

| Kind | Learning purpose | Examples of specialist ownership |
|---|---|---|
| orientation | Governing question and why the lesson matters | Subject overview or diagnostic |
| concept-map | Concepts, prerequisites and recovery route | Mind map or dependency graph |
| theory | Source-grounded concepts, assumptions and formulas | Math deck, language rule, technical note |
| worked-example | Complete model reasoning with checks | Derivation, code trace, query walkthrough |
| exercise | Learner action before solution disclosure | Problem, code, query, diagram, response |
| lab-simulation | Manipulation and observation | Parameter lab, code runner, SQL/data playground |
| misconception | Wrong pattern, cause, diagnosis and repair | Formula error, language error, code defect |
| visual-check | Typed correct/wrong or state comparison | Plot, formula diagram, query plan, system diagram |
| oral | Spoken explanation, dialogue or defense | Shadowing, professor Q&A, defense simulator |
| review | Retrieval, repair and retention scheduling | Spaced review and weak-topic route |
| assessment | Objective measurement with disclosure policy | Test, exam or remedial attempt |
| mastery | Aggregate verified evidence | Master-ready gate |
| project-nir-evidence | Project, НИР and ВКР traceability | Artifact, protocol, research note, milestone |

Thirteen is a semantic catalog size, not a required block count. A lesson may
use a subset, a specialist external artifact, or multiple instances of one
kind. No block creates a tab merely by existing.

## 4. Block envelope

Each block has:

- a stable ID and registered semantic kind;
- ordered source bindings;
- a kind-specific payload;
- a non-binding presentation hint;
- evidence references;
- an offline resource reference;
- an optional specialist capability reference owned by the subject engine.

The presentation hint can recommend an inline flow, gated stepper, deck,
specialist workspace, split view, modal tool or external artifact. Renderers
may combine blocks and must not create empty views.

## 5. Prerequisite and objective semantics

Prerequisite relations are requires, recommended, diagnostic and co-requisite.
Required mastery states are introduced, practised, assessment-pass and
master-ready. An unresolved required prerequisite blocks assessment entry, but
orientation and a recovery route remain available.

Every objective must map to observable evidence. Page view, scroll depth and
time-on-page are activity signals only; they are not mastery evidence.

## 6. Evidence, assessment and project boundaries

The shared evidence vocabulary is:

understand → solve → build-apply → explain → retain

L6-B2 defines the vocabulary and evidence envelope only. Thresholds and rubrics
remain owned by lesson-type profiles for L6-B5.

Assessment has distinct disclosure modes:

- Practice may use immediate feedback or hints.
- An official attempt defers correctness until submission.
- Review links diagnosis to a source-grounded repair route.

AI cannot expose protected answers during an official attempt. A failed
objective creates a repair reference and a new attempt; prior evidence remains
append-only.

Project evidence connects a lesson to project, НИР or ВКР artifacts without
pretending that every lesson requires a research checkpoint.

## 7. Context and provenance

The contract reserves runtime references for:

- current lesson and prerequisite graph;
- learner progress, assessment errors and weak topics;
- schedule and current subject;
- language state;
- current НИР/ВКР context.

This is context wiring, not a chatbot widget. Private learner history is
resolved at runtime and is not embedded in static lesson content.

Four provenance groups remain separate:

1. Provided source.
2. User evidence.
3. System-derived state.
4. AI inference.

AI inference cannot silently become a provided academic source.

## 8. Offline and compatibility

Resources declare shell, bundled, subject-pack, local-file or network-only
availability. Large data cannot silently enter the app shell. A required
network-only interaction needs a deterministic fallback, and generative AI
cannot be the only path through a required learner state.

Compatibility is read-only-first:

- source mutation is false;
- legacy state-key mutation is false;
- unknown source fields pass through;
- the specialist subject engine owns the interaction;
- rollback disables the projection and routes to the unchanged subject engine.

## 9. Scope held for later L6 steps

The following are intentionally not completed in B2:

- B3 assigns required/optional/conditional/forbidden/external policies.
- B4 defines executable lesson-type profiles.
- B5 defines type-specific mastery rubrics and thresholds.
- B6 expands the Visual Teaching Contract.
- B7 activates Russian Twin and English Research hooks.
- B8 creates the formal JSON Schema, instance validator and version migration.
- B9 creates the Subject Factory registry.
- B10 introduces renderer/bridge code.
- B11 proves reference-subject compatibility and the light-subject pilot.

## 10. Acceptance

B2 passes only when:

1. The JSON parses and the deterministic contract regression passes.
2. All requested lesson fields and all 13 semantic block kinds are present.
3. No fixed canonical flow or per-block requiredFor list exists.
4. Source identity/provenance, assessment integrity, context references and
   offline fallback are explicit.
5. B1 remains 44/44 and the relevant L5 regression gates remain green.
6. Russian and Mathematics runtime/content files have no B2 diff.

Rollback removes the B2 contract, report, documentation and regression, then
restores the L6 workflow/progress markers to the B1 checkpoint. No learner
content or runtime state requires migration for this rollback.
