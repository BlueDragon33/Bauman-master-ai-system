# Turn 10 — Visual Vocabulary Contract Audit

This turn freezes semantic authority before any learner-facing vocabulary authority switch.

## Rule

Vietnamese and English translation fields may remain in the source corpus for migration and authoring diagnostics, but they are not permitted to become learner-facing semantic answers under the new contract.

Direct meaning must be established through verified visual/context channels such as images, illustrations, pictograms, scenes, gestures, contrasts, categories/examples, audio-in-context, or simple Russian definitions.

## Current runtime debt

The existing core remains authoritative until Turn 13 and is expected to still contain legacy translation fallback and “Lật nghĩa” behavior during Turns 10–12.

That debt is measured by the validator but is **not** treated as accepted target behavior.

## Missing semantics

A vocabulary item without sufficient direct semantic evidence must enter the explicit state:

`missing_visual_semantics`

It must not silently fall back to Vietnamese, English, or unverified generated meaning.

## Authority

Turn 10 does not switch runtime authority and does not mutate learner mastery/state.
