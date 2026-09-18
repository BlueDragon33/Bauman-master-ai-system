# Russian Learning Baseline Audit — Turn 1

Gate run: `35358707725`

## Vocabulary

- Total: **8,000**
- Visual evidence: **8,000 / 8,000 (100%)**
- Audio/pronunciation evidence: **8,000 / 8,000 (100%)**
- Context evidence: **8,000 / 8,000 (100%)**
- Explicit Vietnamese semantic fields: **3,000 / 8,000 (37.5%)**
- Legacy `vi` field present: **8,000 / 8,000**

Interpretation: the content bank already has enough visual/audio/context metadata to migrate away from translation-first display. The primary defect is semantic authority in runtime rendering, not lack of raw vocabulary volume.

## Cyrillic / handwriting

- Handwriting records: **48**
- Alphabet rows: **33**
- Print representation present: **33 / 33**
- Cursive field present: **33 / 33**
- Stroke data present: **33 / 33**
- Cursive Unicode text different from print: **0 / 33**

Interpretation: alphabet coverage exists, but a cursive field containing the same Unicode letters does not prove the rendered shape is truly handwritten. Browser/render-level verification is required before claiming cursive recognition coverage.

## Speaking

- Speaking records: **1,220**
- Russian text evidence: **1,220 / 1,220**
- Vietnamese scaffolding: **1,220 / 1,220**
- Direct audio asset field detected by baseline key scan: **0 / 1,220**
- Vocabulary seed: **1,220 / 1,220**

Interpretation: speaking content is large and Russian text is present, but learner-facing scaffolding is translation-heavy. Audio may be synthesized/indirect through runtime and must be audited separately rather than treating the zero direct-asset count as proof that audio is unavailable.

## Runtime debt confirmed

- `makeVietnamVocabDisplay()` exists.
- Vocabulary display falls back to `meaningVi`.
- “Lật nghĩa” is learner-facing.
- `dialogueVi()` exists.
- `dialogueHideVi` / `practiceHideVi` are normal runtime state.
- Fresh default learning tab is `theory`.
- Reference UI shows vocabulary before listening.
- Planning already prioritizes listening/speaking.

## Immediate development consequences

1. Do not generate fake replacement images for 8,000 words; visual evidence already exists.
2. Change semantic rendering authority from translation to visual/audio/context.
3. Verify cursive shapes in the browser rather than trusting field names.
4. Preserve current planning listening/speaking weights unless a later gate proves a planning problem.
5. Change fresh-user route suggestions to oral-first without rewriting stored learner state.
