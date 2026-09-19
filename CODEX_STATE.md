# CODEX_STATE

Current task: `RUSSIAN_LISTENING_VISUAL_FIRST_ARCHITECTURE`

Status: `RUSSIAN_GATE_GREEN_SYSTEM_GATES_RUNNING`

Date: 2026-09-19
Branch: `work/russian-listening-visual-first-architecture`
Parent checkpoint: `676fe08d05e6d92ff4479620ad9bf00abe5f8da6`

## Responsibility

**Subject Web App — Russian learning architecture**

This branch does not expand Foundation authority.

## Completed slice

1. Reordered lesson flow to listening/speaking first.
2. Added alphabet + handwriting as an explicit early learning step.
3. Preserved existing lesson, speaking, vocabulary, grammar, assessment and learner-state data.
4. Enforced visual-first vocabulary for Vietnam stage:
   - no learner-facing direct Vietnamese translation as the flashcard answer;
   - no English-equivalent answer;
   - image/symbol + Russian explanation + situational usage instead.
5. Removed learner-facing “Lật nghĩa” wording in favor of contextual hints.
6. Removed English-equivalent output from AI vocabulary helper.
7. Added `validate-listening-visual-first.mjs` and wired it into Russian Reference UI Gate.
8. Added architecture contract documentation.

## Validation

Russian Reference UI Gate: GREEN on PR #55 head `f2259364657eda339d79b1c33e5a99cad6780bf8`.

Whole-system dependent browser/device/preview jobs were still running when this state file was prepared.

## Branch/merge rule

Do not merge to `main` until:
- remaining whole-system checks are green;
- branch history is reconciled so the Russian slice is not accidentally used to merge all unpromoted Foundation commits;
- explicit promotion decision is made.
