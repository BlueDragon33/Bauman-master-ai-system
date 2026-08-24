# Lượt 6 · B3 · Block Requirement Policies

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

Policy:
assets/data/lesson/universal-lesson-block-policy-v1.json

Gate:
scripts/academic/l6-b3-block-policy-regression.cjs

L6-B3 decides when a semantic block is required, optional, conditional or
forbidden and whether inline content, a specialist engine, or either may
satisfy it. The policy never creates tabs, routes or empty placeholders.

## 1. Two policy axes

Requirement and fulfillment are deliberately separate.

| Requirement | Meaning | Empty behavior |
|---|---|---|
| required | The semantic capability must resolve | Validation error |
| optional | Use it only when useful source content exists | Omit silently |
| conditional | Required only when a named condition is true | Omit when false; error when true and empty |
| forbidden | Not allowed in the resolved lesson mode | Error and quarantine |

| Fulfillment | Meaning |
|---|---|
| inline | A universal projection supplies the payload |
| external | A registered specialist engine or authoritative artifact supplies it |
| either | Inline or registered specialist fulfillment is valid |

This model lets Mathematics require theory while retaining its authoritative
deck and formula layers, and lets Russian require oral practice while retaining
dialogue/shadowing/deep-speaking tools. Neither engine must copy specialist
content into a generic JSON payload.

## 2. Resolution order

The resolver is deterministic:

1. Load the base policy for all 13 catalog blocks.
2. Apply one lesson-type policy.
3. Apply at most one lesson-mode overlay.
4. Reject unknown blocks, states, fulfillment modes and conditions.
5. Evaluate forbidden rules first.
6. Evaluate named conditions.
7. Resolve inline payload and/or registered specialist capability.
8. Omit empty optional and false conditional blocks.
9. Fail required and true conditional blocks without valid fulfillment.
10. Send only populated resolved blocks to a presentation strategy.

A row in the policy matrix never becomes a UI tab.

## 3. Named conditions

Conditions are declared data, not ad-hoc renderer guesses.

| Condition | Activates when |
|---|---|
| teaches-new-concept | The lesson introduces a new concept |
| has-worked-procedure | A source-backed procedure/example exists |
| requires-interactive-manipulation | Manipulating code, model, data or parameters materially helps |
| has-diagnosable-visual-state | A meaningful correct/wrong or state comparison exists |
| requires-oral-performance | Language, seminar or defense policy requires oral evidence |
| assessment-blueprint-present | An explicit assessment blueprint exists |
| project-or-nir-link-present | A traceable project, НИР or ВКР link exists |
| has-concept-relations | Prerequisites or a concept graph exist |
| has-source-backed-misconceptions | Audited misconception/diagnostic sources exist |
| has-experiment-or-dataset | A real experiment or dataset is bound |
| post-diagnostic-repair-needed | Learner errors or weak topics require recovery |

The contract cannot invent a test, misconception, simulation or visual merely
to fill a layout.

## 4. Base policy

The base policy requires only orientation, exercise, review and mastery.
Concept map, theory, worked example, lab/simulation, misconception, visual
check, oral, assessment and project evidence are condition-driven.

Misconception activates only from a source-backed error or diagnostic set; the
policy never invents a generic error merely to fill the lesson. Mathematics
overrides this to required because the audited engine already carries explicit
common-mistake and misconception artifacts.

This is intentionally smaller than the 13-block catalog. The top-level
metadata, prerequisites and objectives remain required by the V2 contract,
but they are not separate tabs.

## 5. Lesson-type policy references

B3 uses the eight IDs required by the master plan. B4 will define their full
lesson-type semantics; B3 owns only block requirement/fulfillment.

| Type | Important B3 decisions |
|---|---|
| language | Oral is required through dialogue/shadowing/deep-speaking; language visuals and media remain conditional/optional |
| mathematics | Concept map, theory, worked example and professor oral are required; simulations and visual checks remain condition-driven specialist artifacts |
| programming | Code lab is required; code trace and oral review are conditional |
| database | Schema concept map, worked query, SQL lab and schema/query-plan visual are required |
| software-design | Concept/design theory, example, diagram visual and design defense are required; workspace is conditional |
| ml-data | Theory, worked model, dataset lab and metric/model visual are required |
| asoiu-system | Theory, system example, architecture/reliability visual and system defense are required |
| research | Theory, worked protocol, oral defense and project/НИР/ВКР evidence are required; experiment lab remains source-conditional |

No resolved type requires all 13 blocks. Every type retains optional or
conditional blocks.

## 6. Lesson-mode overlays

Modes prevent a full-lesson policy from leaking into special flows:

- orientation-only forbids assessment and mastery so a preview cannot claim
  completion;
- diagnostic forbids worked examples before the prerequisite measurement and
  requires assessment;
- recovery requires exercise, misconception and review, while theory/example
  appear only for diagnosed repair needs.

These overlays demonstrate the forbidden state without declaring any semantic
block universally invalid for an academic type.

## 7. Specialist ownership

External fulfillment must name at least one registered capability. Examples:

- Russian: dialogue, shadowing, deep speaking and speech recording.
- Mathematics: authoritative theory deck, formula/matrix rendering, parameter
  simulation and professor oral.
- Programming: code lab, unit test and debugger.
- Database: SQL playground, transaction scenario, schema diagram and query
  plan.
- ML/Data: dataset playground, experiment runner and metric visualizer.
- ASOIU: architecture/information-flow/reliability views.
- Research: evidence vault, protocol and defense simulator.

If the external capability is missing, a required/external block fails. It
does not fall back to a decorative generic card.

## 8. Presentation and offline behavior

The policy explicitly declares:

- createsTabs: false;
- createsRoutes: false;
- emptyOptionalPlaceholder: false;
- renderer input: resolved populated semantic blocks;
- specialist ownership preserved.

The B2 offline resource reference remains attached to each resolved block.
Changing requiredness does not silently change shell caching, pack selection,
large-data lazy loading or local-file sandbox policy.

## 9. Compatibility and rollback

Source mutation and legacy state-key mutation remain false. B3 changes no
Russian, Mathematics or learner-content file.

Rollback removes the B3 policy, document, report and regression, and restores
the workflow/progress markers to the B2 checkpoint. The V2 contract remains
valid because requirement policy is a separate layer.

## 10. Acceptance

B3 passes only when:

1. The base policy classifies all 13 catalog blocks exactly once.
2. All eight lesson-type policies resolve to valid complete matrices.
3. Conditional entries use declared conditions.
4. External entries name specialist capabilities.
5. No type requires all 13 blocks and every type retains optional/conditional
   behavior.
6. Mode overlays exercise forbidden behavior safely.
7. B1 and B2 gates remain green, B3 regression passes, reports are
   deterministic, and the relevant L5 gates do not regress.
