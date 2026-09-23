# Math Learning Application Rebuild — LƯỢT 9 Lesson Player Shell Gate

## Goal
Turn the lesson runtime into one source-driven Lesson Player shell instead of a fixed list of feature tabs.

## Changes

### Source-driven steps
The old learning-flow exposed a fixed 9-step strip whether or not the lesson actually had matching content.

It is replaced by a semantic Lesson Player whose available steps are derived from the actual `slides[].role` values of the current theory record:

- Hiểu
- Trực quan
- Ví dụ
- Công thức
- Ứng dụng
- Luyện tập
- Tự kiểm
- Tóm tắt

A step is not rendered when the source lesson has no matching role.

### Header
The player now shows:
- Stage → Chapter → Lesson breadcrumb
- lesson title
- lesson objective using source `baumanFocus` / program anchor
- number of real steps
- explicit “duration not declared” instead of invented time
- continue-current-step CTA when resuming

### Progress
Progress denominator is the number of real steps for that lesson, not a fixed global number.

The first step is counted only after persistence succeeds. A storage failure displays an error and does not fabricate progress.

### Contextual tools
Formula library, simulation, focus mode, notes and command palette stay secondary/contextual. They are not peer learning routes.

### State migration
Historical local step IDs are mapped into the new semantic step IDs where possible:
- theory → understand
- lab → visualize
- professor/exam → selfcheck
- review → summary

This preserves useful learner state without keeping the old UX model.

## Gate on current 18 theory records
- Lesson Player JS syntax: PASS
- records audited: 18
- lessons with zero semantic steps: 0
- step count range from source: 1–8
- fixed 9-column step grid removed: PASS
- dynamic source-driven step grid: PASS
- breadcrumb present: PASS
- objective present: PASS
- persistence failure guard: PASS
- ephemeral/fake first-step progress removed: PASS
- Lesson Player CSS `!important`: 0

The minimum step count of 1 is a content-depth signal, not hidden by the UI. LƯỢT 10 must audit those records rather than manufacturing missing steps.

## Result
**PASS**

Next: LƯỢT 10 integrates theory + formulas in the lesson context and identifies content records whose role structure is too shallow for a complete learning flow.
