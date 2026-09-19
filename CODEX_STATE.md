# CODEX_STATE

Current task: `RUSSIAN_LISTENING_VISUAL_FIRST_ARCHITECTURE`

Status: `RUSSIAN_HANDWRITING_RECOGNITION_ROUND_ACTIVE`

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

Accepted hardening checkpoint: `5db5f02b5ab00be71f0786697d38c965110b2d26`.

Gate result on accepted checkpoint:
- Russian Reference UI Gate — PASS
- Whole System Integration Gate — PASS
- Packaged Hub Responsive Acceptance — PASS
- Academic 2026 Prerequisite Gate — PASS
- Bauman Runtime Device Gate CI — PASS
- Bauman Cloudflare Preview CI — PASS
- Windows checkout safety — PASS
- Foundation Domain Model Gate — PASS
- Content Asset Provenance + Content Resolution/Delivery — PASS

Repairs included:
- seven-step progress denominator;
- gesture-only handwriting stroke evidence;
- real-activity next-step suggestion;
- real-evidence progress counter;
- support-view status truthfulness;
- packaged Hub safe-shell readiness race;
- explicit handwriting presentation authority.

## Auto-generated next work

### R-HW1 — Deterministic Handwriting Recognition Layer

1. B1 — capability + presentation authority runtime; fail closed when no reliable Cyrillic script rendering is available.
2. B2 — print → handwriting recognition drill; Russian-only visual choices, no Vietnamese answer translation.
3. B3 — recognition evidence contract; attempts/correct are evidence only and never auto-master a letter.
4. B4 — exact resume + Review Queue integration for weak/missed letters.
5. B5 — offline/package/mobile/Windows parity and deterministic fallback.
6. B6 — adversarial audit + closeout; keep promotion blocked until all gates are green.

## Branch/merge rule

Do not merge to `main` until:
- remaining whole-system checks are green;
- branch history is reconciled so the Russian slice is not accidentally used to merge all unpromoted Foundation commits;
- explicit promotion decision is made.
