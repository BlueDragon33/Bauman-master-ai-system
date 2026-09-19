# CODEX_TASK

Task: `RUSSIAN_LISTENING_VISUAL_FIRST_ARCHITECTURE`

Mode: `CHAT_FIRST / SUBJECT_RESPONSIBILITY`

## Goal

Make the Russian Subject Web App follow a stable learning sequence for the Vietnam-first phase:

`listen/speak → alphabet/handwriting → lesson analysis → visual vocabulary → grammar → exercises → check`

## Non-negotiable vocabulary rule

For stage `vn`:
- do not teach vocabulary by showing a direct Vietnamese translation as the answer;
- do not substitute an English gloss as the answer;
- prefer image/symbol, Russian explanation, pronunciation/audio, usage context and Russian example dialogue.

Legacy bilingual metadata may remain in source data for migration/authoring/search, but must not be the primary learner-facing vocabulary answer.

## Current gate

Russian Reference UI Gate is green.

## Next automatic substeps

1. Finish whole-system CI acceptance.
2. If any system gate fails, create a focused fix substep and re-run gates.
3. After all gates are green, audit the first Vietnam lessons R01–R06 for actual media/listening-first sequencing and alphabet coverage.
4. Add a focused browser acceptance check for the learner-facing no-translation rule if current browser tests do not cover the rendered vocabulary card.
5. Keep this branch unmerged until promotion is explicitly approved.
