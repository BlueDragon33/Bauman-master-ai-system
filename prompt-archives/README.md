# Prompt ZIP Archives

This directory stores subject prompt ZIP packages for provenance and recovery.

Shared authority remains:

1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. canonical subject `README.md` + Master Prompt + `PROJECT_STATE.json`
4. ZIP archive as source snapshot / recovery package

## Execution rule

ZIP files are archives, not simultaneous execution units.

Execute one subject at a time:

`README → PROJECT_STATE / SOURCE_STATUS → active module → router → PASS gate → next module`

The normalization pipeline extracts/repackages subject systems into `prompts/subjects/<slug>/` and removes duplicated per-ZIP Constitution copies from canonical execution.

## Packages

- `russian-pack.zip` — Russian — SHA-256 `5ae5f6ff40d7ca2604659c2903d17dba18f9a22cb1c47235929888e921343ffa` — `prompts/subjects/russian/` — CANONICAL_EXTRACTED
- `math.zip` — Mathematics — SHA-256 `d698ac11eb1bf854d2f0612573f2015c0649e5003336ac626ea927a0da0dc3c1` — `prompts/subjects/math/` — CANONICAL_EXTRACTED
- `python-pack.zip` — Python — SHA-256 `60b2d250fb58208ffb13a0326232d42937a04b7a87a8c9328984655bdb72bd7f` — `prompts/subjects/python/` — CANONICAL_EXTRACTED
- `algorithms-pack.zip` — Algorithms & Data Structures — SHA-256 `9b82634a0016d8d7e505daeb137f1168039f770e855a612ac397d4d674a425bf` — `prompts/subjects/algorithms/` — CANONICAL_EXTRACTED

## Constitution rule

Do not execute ZIP-embedded duplicate constitutions as a second authority.
The canonical shared Constitution is `prompts/CONSTITUTION.md` plus `prompts/constitution/`.

## Source preservation

Archive hashes above preserve provenance. Canonical readable prompt files live under `prompts/subjects/`.
