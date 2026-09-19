# CODEX_STATE

Current task: `RUSSIAN_LISTENING_VISUAL_FIRST_ARCHITECTURE`

Status: `RUSSIAN_RUNTIME_HARDENING_IN_PROGRESS`

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

Baseline head `628e97dee043ee926366cf884750efb4bb94b7f8`: 9/9 workflows GREEN.

Post-baseline hardening:
- fixed 7-step progress denominator;
- prevented generic clicks in Writing view from creating handwriting evidence;
- added gesture-based canvas stroke evidence;
- added regression checks for all three fixes.

Latest hardening head: `24f3630e52039cd318e8052805cd3d10b14a0886`.
CI for this new head must be green before promotion.

## Auto-generated next work

1. Audit print ↔ cursive presentation authority and offline-safe handwriting assets.
2. Add deterministic fallback behavior when script fonts are unavailable.
3. Add recognition drill for printed form → handwritten form without Vietnamese translation.
4. Re-run Russian Reference UI + Whole System + Windows + Preview gates.
5. Keep promotion blocked until branch-history reconciliation prevents unrelated unpromoted Foundation commits from entering the Russian promotion path.

## Branch/merge rule

Do not merge to `main` until:
- remaining whole-system checks are green;
- branch history is reconciled so the Russian slice is not accidentally used to merge all unpromoted Foundation commits;
- explicit promotion decision is made.
