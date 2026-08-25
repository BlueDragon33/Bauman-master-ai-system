# L7-B3 · Russian Twin Generator, Registry and Glossary

Status: implementation gate; PASS requires deterministic local regression and
remote CI evidence.

## Scope

L7-B3 implements the latent Russian Twin registry promised by L6-B7. It does
not activate multilingual learner UI, translate navigation, replace the
Russian specialist engine or write learner progress.

The generator accepts only a stable source lesson with an explicit
`terminology.vi`, `terminology.ru` and `terminology.en` alignment. It copies
those source-aligned terms into a context-bound glossary record and a hidden,
declared technical-terminology twin unit. If any alignment is missing, it
returns `ALIGNMENT_MISSING`; the source lesson continues unchanged.

The first truthful subject pack uses the 48 Programming lessons whose existing
source already contains complete trilingual terminology. Russian, Mathematics,
Foundation, AI/Data, Signal, Systems and Research remain registered but
unavailable until reviewed source alignments exist. No dictionary guess or AI
draft is promoted into the shared glossary.

## Identity and ownership

- Glossary identity is `subjectId:lessonId:terminology`, never surface text.
- Usage context binds subject, lesson, stage and resolved lesson type.
- Official Bauman metadata keeps `09.04.01`; personalized display metadata
  keeps `09.04.01/11`.
- Russian dialogue, shadowing, speech, handwriting, writing, review and exam
  stay owned by `subjects/russian/index.html`.
- Generated packs remain hidden, opt-in and deterministic offline resources.

## Gate

```sh
node --check assets/js/platform/universal-lesson/russian-twin-generator-v1.js
node --check scripts/academic/l7-b3-russian-twin-registry-regression.cjs
node scripts/academic/l7-b3-russian-twin-registry-regression.cjs
git diff --exit-code -- assets/data/lesson/russian-twin-glossary-v1.generated.json
git diff --exit-code -- docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.generated.json
```
