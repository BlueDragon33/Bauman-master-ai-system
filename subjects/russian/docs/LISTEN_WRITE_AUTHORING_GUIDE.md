# ListenWrite Lesson Authoring Guide

This guide documents the accepted RHW7 data-only expansion path.

## Goal

Add listening + handwriting/dictation practice to a future Russian lesson **without changing runtime JavaScript**.

## Required files

1. `subjects/russian/data/listen-write-lessons.json`
2. `subjects/russian/data/listen-write-level-rules.json`

The runtime binds by exact `lessonId`. If no explicit binding exists, the ListenWrite panel stays hidden.

## Add a new lesson binding

Add one object with schema:

`RUSSIAN_LISTEN_WRITE_LESSON_V1`

Required lesson fields:
- `id`
- `lessonId`
- `stage`
- `level`
- `title`
- `items`

Each item requires:
- `id`
- `contentType`: letter / syllable / word / phrase / sentence / dictation
- `handwritingSample`
- `drills`
- optional `printSample`

Each drill requires:
- `kind`
- `audioText`
- `answer`
- `choices`
- `hint`
- `stress`

Supported drill kinds:
- `hear_select`
- `hear_trace`
- `hear_write`
- `syllable_write`
- `word_dictation`
- `stress_mark`
- `sound_spelling_discrimination`

## Level binding

Add the new `lessonId` under the correct A0/A1/A2 band in `listen-write-level-rules.json`.

The current defaults are:
- A0 → learn
- A1 → practice
- A2 → dictation

Do not place an item type outside that level's `allowedContentTypes`.

## Russian-specific rules

- Preserve Ё/Е distinction.
- Stress exercises must encode explicit stress in both answer and `stress`.
- Ъ/Ь are contextual signs, not independent phonemes.
- Do not teach one isolated TTS utterance as a universal value for context-sensitive letters.
- Handwriting self-check remains manual; do not add OCR/AI guessing as a required correctness signal.

## Content policy

- ListenWrite lesson data must not inject Vietnamese translations into image-first vocabulary.
- Audio target and expected answer must be explicit.
- Do not infer or synthesize missing lesson content from another lesson.
- If the lesson has no explicit binding, the panel remains hidden.

## Acceptance

Run the Russian Reference UI Gate. The following validators must remain green:
- RHW6 generic factory validation
- RHW7 expansion/binding validation
- runtime JavaScript parse
- offline/core dataset checks

A future lesson should be addable by data only. If JavaScript must be changed for a new lesson, treat that as an architecture defect before shipping.
