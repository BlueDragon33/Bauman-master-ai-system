# Lượt 6 · B1 · Reference Implementation Audit

Status: **AUDIT COMPLETE · acceptance is controlled by the deterministic gate**

This document is the decision record for L6-B1. It audits the current Russian
and Mathematics engines, the existing light-subject lesson payloads, the public
Bơi ếch teaching flow, and the unmerged experimental L6 branch. It does not
authorize a merge, a renderer replacement, or a learner-facing UI change.

## 1. Audited baseline

| Item | Audited value |
|---|---|
| Working branch | migration/webapp-l1-audit-storage |
| Remote working head before L6 | 5d56a0da86f9f92359f24e4851075fc67133f36c |
| L5 validated source | de34c9606d8e35b138e9933c835d4ab55228fca6 |
| L5 immutable checkpoint | checkpoint/l5-webapp-offline-pass-a20-20260824 |
| L5 authoritative workflow run | 32702609199 |
| L5 validation artifact | 9511098621 |
| L5 artifact SHA-256 | cbad86b04a73d92d1e2e9109787e6a73627c967191e13a0c42e3b18c23a41218 |
| L6 experimental branch | academic/universal-lesson-factory-v1 |
| L6 experimental head | 1680540ae06fcb2185d15eec5b0870a7cf5c7219 |
| Experimental merge base | de34c9606d8e35b138e9933c835d4ab55228fca6 |

The experimental branch and the working branch have diverged after the L5
merge base. The two experimental files were inspected individually. No commit
or tree from that branch is merged by this audit.

## 2. Evidence method

The audit uses four evidence classes:

1. Runtime entry graphs and adapters for Russian and Mathematics.
2. Machine-readable manifests and lesson payloads in the current working tree.
3. A frozen public-reference snapshot of the Bơi ếch site, identified by URL
   and content hashes rather than a live-network dependency in CI.
4. A file-by-file review of the experimental L6 branch, followed by a
   keep/revise/reject matrix.

The deterministic companion gate is
scripts/academic/l6-b1-reference-audit.cjs. It rechecks structural invariants,
the identity-code boundary, the learner-facing comparison-label boundary, and
the presence of every decision in this record.

## 3. Russian reference engine

Observed baseline:

- 26 lesson records; R01 alone contains 43 slides and 20 distinct pedagogical
  roles.
- The runtime has specialist routes for dialogue, deep dialogue, deep
  speaking, speaking-link navigation, writing/handwriting, media, vocabulary,
  grammar, mind map, storage, review, and examination.
- The learning surface has theory, exercise, speaking practice, review, and
  exam modes, but those modes coexist with specialist language workspaces.
- Dialogue and speaking data are large. Dialogue Bauman A-Z is about 35 MB,
  deep speaking about 28 MB, vocabulary about 11 MB, tests about 7.9 MB, and
  speaking about 7.3 MB.
- The L5 lazy overlay deliberately removes vocabulary, tests, and speaking
  from startup loading while preserving them as required, editable,
  persistence-safe sources.
- Russian lessons predate the generic eLearning payload. Their slide/block
  structure is richer and materially different from the light subjects.

| Preserve exactly through L6 | Standardize through an adapter | Must not be flattened into the common layer |
|---|---|---|
| Dialogue, shadowing, deep speaking, writing/handwriting, vocabulary, grammar, mind map, review/exam state, lazy source policy | Lesson identity, prerequisite references, objective/evidence projection, progress events, AI context references, offline resource declarations | Language turn-taking, pronunciation/shadowing controls, handwriting workspace, dialogue-to-speaking links, Russian-specific review/remedial behavior |

Russian is a compatibility reference, not a content shape that every subject
must copy.

## 4. Mathematics reference engine

Observed baseline:

- 347 lesson records. The first lesson contains 16 distinct roles including
  problem framing, deep essence, formula, assumption gate, simulation,
  application, practice, professor Q&A, and takeaway.
- The eLearning field in lessons.json is renderer metadata, not the generic
  pedagogical payload used by light subjects.
- Theory content also exists in a separate authoritative record collection,
  with 18 rich lecture records and its own slide content.
- The active page wires identity, content-source, artifact-registry,
  authoritative-route, reader, richness, formula-accuracy, and typesetting
  layers. Lesson identity therefore cannot be inferred from an array index or
  one JSON file alone.
- Mathematics exposes formula, simulation, professor oral defense,
  application, review, exam, JSON import/export, and lazy-data capabilities.

| Preserve exactly through L6 | Standardize through an adapter | Must not be flattened into the common layer |
|---|---|---|
| Formula/matrix rendering, authoritative lesson routing, artifact reader and registry, simulations, professor oral, source anchors, assumption gates | Canonical lesson identity projection, semantic block projection, prerequisite/evidence links, progress events, AI context references, offline resource declarations | Formula typesetting, source-selection precedence, artifact-specific views, parameter labs, oral-defense interaction, accepted slide richness |

Mathematics requires a source-identity resolver before any universal renderer
can claim compatibility.

## 5. Light-subject payloads

Foundation, AI, Research, Signal, and Systems already share an eLearning-v1.1
payload with objectives, prerequisites, theory, formula slots, a worked
example, guided practice, simulation link, common mistakes, checkpoints,
mastery criteria, rubric, attachments, Bauman linkage, and review guidance.

That common payload is useful input for a Subject Factory pilot because it is
consistent and easy to adapt. It is not proof that the same JSON shape can
replace Russian or Mathematics. Foundation is the preferred first pilot
because it is relatively small, has both theory and practice lessons, and
directly exercises prerequisite, evidence, language-transition, and review
concepts.

## 6. Bơi ếch pedagogical reference

Frozen source URL:
https://boi-ech.dinhnam3391.chatgpt.site

| Snapshot item | SHA-256 |
|---|---|
| HTML shell | e519d69fb792f6647ca824baaa1990db32eaee453944e814177595b6e2b77dea |
| Page JavaScript | 870bef7e83d04cd93025b1aa8936dd84ef72c69db3f3124bbf00a434ed8a6e87 |
| Page CSS | b18a588795cad3932b5e96b3c9358056c0e9e7b55685aca4abc233090311ea6f |

Transferable principles:

- A visible learner journey: learn, practise, analyse, review, then test.
- A checkpoint at each transition; the official test is not the first contact
  with the concept.
- Correct one important error at a time instead of flooding the learner with
  simultaneous feedback.
- During a formal attempt, avoid leaking answer correctness question by
  question; use the review path after submission.
- AI answers are grounded in lesson sources, point the learner back to the
  relevant learning location, and do not reveal protected test answers.
- When AI/cloud is unavailable, lesson, practice, test, progress, and review
  still function deterministically.

What is not copied:

- Swimming movement graphics, physical-safety instructions, and stroke-specific
  interaction are domain content, not universal UI.
- The five stages are learner states, not five mandatory tabs.
- A technical lesson may satisfy a state through a formula proof, code run,
  schema query, system diagram, experiment, or oral explanation.

## 7. Experimental branch reuse decision

Reviewed files:

- assets/data/lesson/universal-lesson-contract-v1.json
- scripts/academic/universal-lesson-contract-regression.cjs

| Candidate element | Decision | Reason |
|---|---|---|
| AI context inputs for current lesson, prerequisites, progress, errors, weak topics, schedule, language state, and NIR/VKR | Keep | Matches the product requirement that AI understand the learning state |
| Offline deterministic fallback | Keep | Consistent with the L5 offline-first contract |
| Master-ready evidence and multilingual hooks | Keep, then type-profile | Valuable semantics, but rubrics must vary by lesson type |
| Named semantic sections such as theory, worked example, misconception, review, oral, and project evidence | Revise | Use addressable blocks; do not impose one display order |
| Exactly 18 canonical flow sections | Reject as a universal invariant | Conflicts with optional blocks and would turn semantic coverage into fixed tabs |
| Global score and oral thresholds | Revise | Defaults may exist, but profiles and assessments own their thresholds |
| Source resolution by one sourcePath | Revise | Mathematics needs identity and source-precedence resolution |
| Validator coverage based mainly on five light subjects | Reject as a PASS gate | It does not prove Russian or Mathematics compatibility |
| Direct merge of the experimental commits | Reject | The branch skipped L6-B1 and diverged before the current master plan/report commits |

## 8. Binding architecture decisions

- **D01 · Semantic blocks are not UI tabs.** The contract describes learning
  meaning. A presentation strategy decides whether blocks become a stepper,
  deck, workspace, inline panel, modal, or specialist tool.
- **D02 · Requiredness is profile-based.** A block can be required, optional,
  conditional, forbidden, or supplied by an external specialist artifact for
  a given lesson type.
- **D03 · Compatibility starts read-only.** Russian and Mathematics adapters
  project existing content into the universal model without rewriting source
  files or state keys.
- **D04 · Identity precedes rendering.** Every projection carries subject,
  lesson, source artifact, source version, provenance, and stable identity.
- **D05 · Specialist engines remain owners.** The universal layer orchestrates
  navigation, evidence, progress, context, and fallback; it does not replace
  formula, dialogue, code, database, diagram, simulation, or research tools.
- **D06 · Master-ready uses evidence stages.** Understand, solve,
  build/apply, explain, and retain are shared meanings; evidence and rubric are
  selected by lesson type.
- **D07 · Visual teaching is typed.** Correct/wrong states and step feedback
  are shared concepts, while formula diagrams, code traces, query plans,
  architecture diagrams, datasets, and language media remain typed widgets.
- **D08 · AI receives references, not ownership.** AI context points to
  current lesson, prerequisite graph, weak skills, schedule, progress,
  language state, and NIR/VKR. Source content and user evidence stay
  distinguishable from AI inference.
- **D09 · Offline policy is per resource.** Shell, metadata, small lesson
  content, large packs, user-imported files, and generated AI output have
  different caching, quota, freshness, and rollback rules.
- **D10 · Language hooks are latent capabilities.** Russian Twin and English
  Research hooks enter the contract now, but L6 does not force full translated
  rendering before the multilingual round.
- **D11 · Assessment integrity is explicit.** Practice feedback and official
  assessment feedback use different disclosure policies.
- **D12 · Bauman identity is two-field.** Official-source metadata uses
  09.04.01; the personalized learner display uses 09.04.01/11 for ИУ-5.

## 9. L6-B1 acceptance and rollback

L6-B1 is accepted only when:

1. The deterministic audit script passes without warnings converted to hidden
   failures.
2. Russian and Mathematics source/runtime files remain unchanged.
3. The generated evidence file is current and deterministic.
4. The L5 static, academic-runtime, roadmap/offline, service-worker, data
   loading, and diagnostics gates still pass.
5. The learner-facing identity boundary remains intact.

Rollback is removal of the four L6-B1-only files and the L6 progress markers.
No lesson source, subject runtime, state key, storage schema, or service-worker
policy is modified by B1.

## 10. Input locked for L6-B2

The Universal Lesson Contract must be designed from D01-D12. It may reuse
semantic vocabulary from the experimental branch, but it must model
presentation separately, carry identity/provenance, support per-type block
policies, and prove that Russian and Mathematics can be projected without
source mutation.
