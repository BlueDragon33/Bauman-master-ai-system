# RHW1/S01 — Current handwriting/audio audit

Status: **PASS**

## Current baseline

- `subjects/russian/data/handwriting.json`: 48 items.
- Alphabet: 33 items (`HW_AZ_01` … `HW_AZ_33`).
- Expansion content already present: 10 word/collocation items and 5 sentence items.
- All 33 alphabet items have print form, cursive form, copy line and stroke guidance.
- Word/sentence expansion items intentionally do not all carry stroke decomposition; they are not treated as alphabet-shape defects.
- Existing writing surface already has canvas drawing, guide/line toggles, undo/clear, sample navigation and real-notebook copy guidance.
- Existing Russian runtime already exposes one reusable `speak(text, rate)` helper using `SpeechSynthesisUtterance` and Russian locale from the subject adapter.

## Gap

The handwriting surface has no per-letter pronunciation model, no listen+write drill contract and no deterministic exercise answer model. Audio exists elsewhere in the subject runtime but is not bound to the handwriting learning sequence.

## Required special handling

- Ъ and Ь: letter name/context only; never synthesize an invented independent phoneme.
- Е, Ё, Ю, Я: context-sensitive examples; do not teach one TTS utterance as a universal sound value.
- Consonant hardness/softness: use syllable/word context.
- Word dictation/stress tasks must carry explicit expected answers.

RHW1 remains data/contract-only. Runtime wiring opens in RHW2 after RHW1 validation.
