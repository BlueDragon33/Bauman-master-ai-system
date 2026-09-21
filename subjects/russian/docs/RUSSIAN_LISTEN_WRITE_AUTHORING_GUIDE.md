# Russian Listen+Write — Data-only Authoring Guide

Status: **RHW7-H1 canonical authoring guide**

This guide defines the supported way to add Listen+Write material to future Russian lessons without changing runtime JavaScript.

## Files authors may edit

For an ordinary new lesson binding, edit only:

1. `subjects/russian/data/listen-write-lessons.json`
2. `subjects/russian/data/listen-write-level-rules.json` when the lesson id is new to a level band

Do **not** edit `core.js` or `listen-write-factory.js` merely to add lesson content.

## Required lesson object

Every row must follow `RUSSIAN_LISTEN_WRITE_LESSON_V1` from `listen-write-lesson.schema.json`.

Required top-level fields:

- `schema`: exactly `RUSSIAN_LISTEN_WRITE_LESSON_V1`
- `id`: unique id beginning with `LW_`
- `lessonId`: exact existing lesson id from `lessons.json`
- `stage`: one of `vn / prep / hk1 / hk2 / hk3 / hk4`
- `level`: one of `A0 / A1 / A2 / B1 / B2 / C1`
- `title`: Russian lesson title
- `items`: one or more Listen+Write items

Binding is exact by `lessonId`. If no row exists, the Listen+Write panel stays hidden. The runtime must not guess a nearby lesson.

## Required item object

Each item needs:

- `id`: unique `LW_ITEM_...`
- `contentType`: `letter / syllable / word / phrase / sentence / dictation`
- `handwritingSample`: the text the learner should write by hand
- optional `printSample`
- `drills`: one or more supported drills

Use Russian learning content directly. Do not add Vietnamese translation fields or Vietnamese meaning text to Listen+Write datasets.

## Supported drill kinds

- `hear_select`
- `hear_trace`
- `hear_write`
- `syllable_write`
- `word_dictation`
- `stress_mark`
- `sound_spelling_discrimination`

Every drill requires `audioText`, `answer`, `choices`, `hint`, and `stress`.

Rules:

- `audioText` is what the Russian speech engine reads.
- `answer` is deterministic and must preserve Russian orthography, including `Ё/ё`.
- `stress_mark` must provide explicit stressed form and explicit choices.
- Choice drills must include the answer among unique choices.
- Do not invent an independent phoneme for `Ъ` or `Ь`; use names/contextual words.
- Context-sensitive letters such as `Е/Ё/Ю/Я` should be taught with real syllable/word context.

## Level-band binding

When adding a lesson id, add it to exactly one appropriate band in `listen-write-level-rules.json`.

Current supported defaults:

- A0 → `learn`
- A1 → `practice`
- A2 → `dictation`

A new level policy must be added as data first. JavaScript changes are justified only when introducing a genuinely new engine capability, not merely new lesson content.

## Example

```json
{
  "schema": "RUSSIAN_LISTEN_WRITE_LESSON_V1",
  "id": "LW_R11",
  "lessonId": "R11",
  "stage": "prep",
  "level": "A2",
  "title": "Новая тема",
  "items": [
    {
      "id": "LW_ITEM_R11_01",
      "contentType": "sentence",
      "printSample": "Запишите результат.",
      "handwritingSample": "Запишите результат.",
      "drills": [
        {
          "kind": "hear_write",
          "audioText": "Запишите результат.",
          "answer": "Запишите результат.",
          "choices": [],
          "hint": null,
          "stress": null
        }
      ]
    }
  ]
}
```

Then add `R11` to the appropriate level band's `lessonIds`.

## Required validation before acceptance

Run:

```bash
node subjects/russian/scripts/validate-listen-write-factory.mjs
node subjects/russian/scripts/validate-listen-write-expansion.mjs
```

The Russian Reference UI Gate must pass, followed by the complete project gate set used by the RHW track.

## When a code change is allowed

A runtime change is **not** allowed for:

- adding another lesson;
- adding more word/phrase/sentence/dictation content;
- changing Russian text/audio target/answer;
- assigning an existing content type or drill kind;
- adding an existing level-band lesson binding.

A runtime/factory change may be proposed only when the requested lesson needs a capability that the current schema and factory cannot represent. That becomes a separately reviewed `RHWx-Hy` architecture step before content is added.

## Completion rule

A future lesson is accepted only when:

1. its `lessonId` exists in `lessons.json`;
2. the lesson row validates against the generic schema/factory;
3. its level rule is explicit;
4. no Vietnamese translation is injected into Listen+Write data;
5. missing binding remains fail-closed by hiding the panel;
6. no duplicated normalizer/scorer/renderer logic is added to `core.js`.
