# RE56 — Spatial symbol accuracy / one visual owner

Owners: RU05/RU08, Constitution C1/C3/C4. Scope: two opt-in Engine preview renderers, one small shared symbol module, SW offline cache, tests. No canonical truth or learner state writes.

## Found through targeted QA
RE43 and RE44 independently duplicated the symbol map. Neither recognized the `library` visual type (generic fallback), while `numbered-room` and `lecture-room` both rendered as `12`; `shower-room` was displayed only as a showerhead icon even when the task requires identifying the **room**. A metro entrance also used a generic direction arrow instead of a station entrance cue.

## Correction
One shared local visual map for 19 existing visual types, used by both previews. Library → books, room 12 → room-door+number, lecture room 12 → academic-room+number, shower room → door+shower, metro entrance → metro symbol, metro route diagram → map. Text labels remain Vietnamese and screen-reader friendly; no new packages, heavy graphics or UI controls.

## Tests and limits
All 19 types must be covered, five critical ambiguous pairs must have distinct symbols, both preview renderers must consume the same mapping, and offline SW must precache it. Test full existing opt-in source/packaged browser suite. Symbols aid comprehension but DO NOT establish Russian linguistic/audio quality; human RU03 and canonical release remain separate blocked gates.
