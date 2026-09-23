# Math Learning Application Rebuild — LƯỢT 10 Theory + Formula Integration Gate

## Goal
Keep theory and formulas inside one lesson flow and normalize historical role taxonomies without rewriting academic content merely to suit the UI.

## Role normalization
Audit found one content-rich lesson (§1.6) had 22 slides but only one recognized semantic step because it uses specialized roles such as:
- compatibility_gate
- canonical_assembly
- matrix_semantics
- locked_case
- troubleshooting
- code_contract_audit
- mastery_close

The Lesson Player now maps these roles semantically into learner steps.

Examples:
- compatibility_gate / matrix_semantics → Hiểu
- canonical_assembly / centering → Trực quan
- locked_case / api_trap → Ví dụ
- deployment_preprocessing / linear_interface → Ứng dụng
- troubleshooting / code_contract_audit → Luyện tập
- covariance_gate / rank_boundary → Tự kiểm
- mastery_close → Tóm tắt

The academic slide roles remain unchanged.

## Formula behavior
Formula is now a lesson step only when the lesson actually contains formula-bearing semantic roles.

Selecting **Công thức** navigates to/highlights the formula content inside the current lesson Reader.

The ∑ Formula Focus remains a secondary contextual tool and is not the primary learning path.

The Formula contextual button is hidden when the lesson has no formula step.

## Simulation contextual tool
The simulation tool is shown only when the current source record actually has a `simulation` role.

## Content gate on 18 current theory lessons
Post-normalization:
- 17 lessons expose 8 semantic steps
- 1 lesson exposes 7 semantic steps
- lessons below 7 steps: 0
- lessons with formula step: 17
- lessons with actual formula blocks: 17
- formula-step/formula-block mismatches: 0

§1.6 remains intentionally without a Formula step because its 22 current slides contain no `formula` block. No formula UI is fabricated.

## Technical gate
- Lesson Player JS syntax: PASS
- formula step stays in lesson context: PASS
- contextual formula button conditional: PASS
- contextual simulation button conditional: PASS
- academic content mutated for UI taxonomy: NO
- duplicate formula route introduced: NO

## Result
**PASS**

Next: LƯỢT 11 audits and integrates examples + applications, including whether the current records provide enough structure for active learning rather than merely showing an answer/content dump.
