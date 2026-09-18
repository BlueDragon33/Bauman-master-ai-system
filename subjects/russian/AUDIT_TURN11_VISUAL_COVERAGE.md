# Turn 11 — Visual Vocabulary Coverage

This turn classifies all vocabulary items without changing learner-facing runtime authority.

## Coverage classes

- `ready / explicit_visual_asset`: the source row contains a real visual field such as image, illustration, pictogram, emoji, scene, or gesture.
- `partial / russian_context_only`: no explicit visual asset, but Russian contextual/semantic evidence exists.
- `missing_visual_semantics / missing`: neither source visual asset nor accepted Russian contextual evidence exists.

Vietnamese/English translation fields are ignored by the classifier.

Runtime-generated emoji inference in the legacy core is not counted as source asset coverage.

## Authority

The classifier is diagnostic and deterministic. Turn 13 remains the planned learner-facing authority switch.
