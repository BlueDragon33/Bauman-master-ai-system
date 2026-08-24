# Lượt 6 · B6 · Visual Teaching Contract

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

Contract:
`assets/data/lesson/visual-teaching-contract-v1.json`

Gate:
`scripts/academic/l6-b6-visual-teaching-regression.cjs`

The visual layer exists to make a concept, transition, comparison, error or
artifact inspectable. It is not a decoration quota and does not make every
lesson use the same picture, diagram or interactive widget.

## 1. Reference audit and transfer boundary

B6 starts from the frozen B1 evidence rather than reinterpreting the reference
implementations.

The Bơi ếch snapshot remains identified by its public URL and three SHA-256
hashes:

| Item | SHA-256 |
|---|---|
| HTML | `e519d69fb792f6647ca824baaa1990db32eaee453944e814177595b6e2b77dea` |
| Page JavaScript | `870bef7e83d04cd93025b1aa8936dd84ef72c69db3f3124bbf00a434ed8a6e87` |
| CSS | `b18a588795cad3932b5e96b3c9358056c0e9e7b55685aca4abc233090311ea6f` |

What transfers:

- a visible learn/practise/analyse/review/test journey;
- a checkpoint before formal assessment;
- feedback focused on one important error group at a time;
- no per-question correctness leakage during a formal attempt;
- source-grounded AI recovery;
- deterministic learning and repair when cloud/AI is unavailable.

Swimming graphics, physical-safety content, stroke interactions and five fixed
visual tabs do not transfer. A technical state can instead be a derivation,
code trace, query plan, architecture view, experiment result, language turn or
research evidence map.

Russian and Mathematics remain read-only compatibility references. B6 reads
their declared capabilities and source paths but does not alter their runtime,
content or Personal Learning State.

## 2. Three-layer visual architecture

The contract separates three concerns:

1. **Learning role** — why the learner sees or manipulates the representation.
2. **Shared state and feedback** — step identity, outcome, disclosure,
   accessibility, offline state and repair behavior.
3. **Typed specialist renderer** — how language, formulas, code, queries,
   architecture, ML, systems or research evidence is rendered and operated.

The universal layer owns orchestration and semantics. Subject engines retain
their specialist tools. A semantic visual may be inline, a stepper, deck,
split view, workspace, modal or external artifact; it is never a mandatory tab.

## 3. Visual envelope and learning roles

Every visual instance binds stable visual/lesson/block identity, lesson type,
learning role, registered representation kind and family, specialist
capability, source bindings, state/interaction/feedback/disclosure policies,
accessibility, offline policy, evidence references and provenance.

The shared roles are:

- orient;
- concept-model;
- worked-step;
- predict;
- manipulate-observe;
- construct;
- compare;
- error-intercept;
- explain-defend;
- review-retrieve;
- result-evidence.

Opening a visual, scrolling it or playing an animation is not evidence. The
evidence reference must point to an observable learner action, artifact,
explanation or assessment event.

## 4. Representation families and typed kinds

Ten families provide accessibility and fallback behavior without erasing
domain meaning:

| Family | Typical use |
|---|---|
| annotated-illustration | Labelled image, formula surface or media frame |
| relationship-diagram | Nodes, edges, boundaries, flows and traceability |
| step-sequence | Ordered reasoning or construction |
| state-comparison | Correct/wrong/partial/inconclusive state dimensions |
| trace-timeline | Execution, dialogue, transaction, protocol or lifecycle |
| plot-or-chart | Quantitative state with data, units and scale |
| media-overlay | Audio/video/handwriting/image plus transcript or annotations |
| artifact-view | Versioned source or learner artifact preview |
| interactive-model | Deterministic parameters, outputs and reset |
| specialist-widget | Registered engine-specific tool |

The B4 registry contributes 48 type assignments and 46 distinct named
representation kinds. Shared families never replace those registered kinds.
Resolution is lesson type → representation kind → family → specialist
capability. File extension alone is insufficient.

## 5. Step-state contract

Steps have stable identity, objective, instruction, learner action, observable
change, expected observation, sources, evidence and an accessibility label.

The state path is:

locked → available → active → attempted → verified → complete

A diagnosed failure branches from attempted to needs-repair, then returns to
active through a source-linked recovery route. A locked step always explains
the missing prerequisite and exposes a reachable recovery action.

Step gating governs a learning sequence, not the number of pages or tabs.
Reset restores the documented initial visual state but never deletes
append-only evidence.

## 6. Correct, wrong and non-binary outcomes

The outcome vocabulary is unattempted, correct, partially-correct, incorrect,
inconclusive and needs-review.

Each comparison names its baseline, candidate state, contrast dimensions,
outcome, explanation, source, repair and disclosure policy. Color is never the
only signal. A runtime failure, unavailable resource and wrong learner answer
are separate states.

Technical judgments are not always binary. An architecture tradeoff, research
claim or model result may be conditional or inconclusive. The visual must show
the governing scenario or evidence instead of forcing a misleading green/red
answer.

## 7. Interaction and deterministic state

Supported purposes include observe, predict, classify, manipulate, construct,
trace, compare, annotate and explain. A useful interactive path is normally:

predict → act or construct → observe → compare → explain or record evidence

The same versioned input, parameters and seed reproduce the same deterministic
output. Required interactions have a keyboard path and non-pointer fallback.
Autoplay cannot perform learner work or create mastery evidence. Run, pause,
step, retry and reset semantics are explicit when supported.

## 8. Focused feedback and AI boundary

A feedback event identifies the attempt, visual, outcome, one primary error,
source anchors, message, repair, retry policy, actor and provenance. Only one
primary diagnosed error group is expanded at once; secondary findings stay
retrievable.

Feedback must answer four questions:

1. What state changed?
2. Why does it matter?
3. Where is the governing source?
4. What one action should be retried?

AI may diagnose, explain and recommend a recovery route using current lesson,
prerequisite, weak-topic, progress, schedule and НИР/ВКР references. It cannot
set verified, fabricate a source, or reveal a protected assessment answer. If
AI is unavailable, deterministic rules and source-linked repair remain usable.

## 9. Practice and assessment disclosure

| Context | Correctness | Hint/solution boundary |
|---|---|---|
| Orientation | Not scored | Source orientation only |
| Worked example | Shown with reasoning | Complete source-grounded path |
| Guided practice | After committed step | Progressive hint; solution after policy gate |
| Independent practice | After committed attempt | Limited hints; solution after retry/review gate |
| Review | After retrieval attempt | Diagnosed-error repair |
| Formal assessment | After submission boundary only | No protected hint or solution before submission |

The formal policy applies to learner UI and AI advisory alike. Post-submission
detail still follows the assessment blueprint; submission does not imply that
every protected answer becomes public.

## 10. Type-specific profiles

| Lesson type | Representative typed visuals |
|---|---|
| language | pronunciation state, dialogue map, phrase comparison, handwriting overlay, listening timeline |
| mathematics | formula diagram, matrix, plot, assumption gate, derivation, parameter state |
| programming | code trace, call stack, data structure, test diff, complexity plot |
| database | schema, relation state, query plan, transaction timeline, index cost, pipeline |
| software-design | UML, architecture, requirement trace, sequence state, quality tradeoff |
| ml-data | dataset profile, pipeline, metrics, confusion matrix, error slice, training state |
| asoiu-system | system boundary, information flow, reliability, failure tree, lifecycle, ergonomics |
| research | question/literature/evidence maps, protocol, results, claim-source boundary, milestone |

Each profile must exactly match the B4 representation set, reference only
registered capabilities and cover multiple pedagogical roles. It is an allowed
vocabulary and compatibility target: no lesson is required to instantiate
every visual kind in its type profile. `specialistCapabilityRef` is explicit
but may be `null` only when the family renderer preserves the full learning
meaning; otherwise it resolves to a capability registered for that type.

## 11. Accessibility and responsive behavior

Every instance declares a short label, long-description reference, non-color
legend, keyboard model, focus order, reduced-motion behavior, structured
fallback and language.

Diagrams expose node/edge tables; plots expose underlying data, scale and
units; timelines expose ordered events; media exposes captions/transcripts;
interactive models expose initial/current state and labelled controls.

At supported mobile, tablet and desktop widths, required labels, controls,
legends and feedback cannot be clipped. Split views may stack but preserve
source-before-action reading order. Reduced-motion mode preserves the same
learning state.

## 12. Offline and performance behavior

The visual resource classes remain bundled, subject-pack and local-file.
Core instructions, deterministic controls, outcome rules and structured
fallback remain offline-capable. Large media or visual packs require explicit
download and are not silently precached as an entire subject repository.

Direct Local Reader references remain zero-copy and permission scoped. Missing
AI/cloud never blocks lesson, practice, assessment, progress, review or repair.
Unavailable visual resources report availability separately from learner
correctness.

Resource metadata includes size, class, loading policy, intrinsic dimensions
or aspect ratio, and fallback. Large specialist widgets lazy-load at point of
use, reserve stable layout space and pause when hidden. Numeric performance
budgets remain measured by the dedicated performance gates rather than being
invented in this semantic contract.

## 13. Provenance and Bauman identity

Provided source, learner action, deterministic state and AI interpretation are
versioned separately. The contract inherits the two-field identity rule:
official Bauman source metadata uses `09.04.01`, while the personalized learner
display uses `ИУ-5 · 09.04.01/11`.

## 14. Compatibility and forward ownership

B6 defines semantic and validation inputs only. B7 owns latent Russian Twin
and English Research hooks, B8 owns formal lesson schema/migration, B9 owns
Subject Factory registration, B10 owns renderer/legacy bridges and B11 owns
reference-subject plus responsive/offline regression.

Russian and Mathematics are still `read-only-reference-unprojected`. B6 does
not claim that either source has been migrated.

## 15. Rollback

Rollback removes the B6 contract, decision record, generated report and
workflow gate, then restores progress markers to the B5 checkpoint. No learner
state migration or legacy content rewrite has run.

## 16. Acceptance

B6 passes only when:

1. Contract, B2/B4/B5 refs and frozen Bơi evidence match exactly.
2. Shared roles/families do not impose a fixed tab or generic renderer.
3. All B4 visual kinds are mapped exactly once to a valid family.
4. Step, correct/wrong, interaction and focused-feedback invariants pass.
5. Formal assessment prevents pre-submission answer leakage.
6. Accessibility, responsive, offline, performance and provenance boundaries
   are explicit.
7. Exactly eight type profiles match B4 kinds/capabilities and forward refs.
8. B1-B5 stay green, the B6 report is deterministic, Russian/Math source and
   runtime files remain unchanged, and relevant L5 regressions do not fail.
