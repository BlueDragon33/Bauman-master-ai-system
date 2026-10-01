# Prompt ZIP Archives

This directory stores subject prompt ZIP packages for provenance and recovery.

Shared authority remains:
1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. canonical subject Master Prompt / PROJECT_STATE
4. ZIP archive as source snapshot

Packages:
- `math.zip` — original MATH_PROMPT_SYSTEM.zip, SHA-256 `d698ac11eb1bf854d2f0612573f2015c0649e5003336ac626ea927a0da0dc3c1`
- `python-pack.zip` — original PYTHON_PROMPT_SYSTEM.zip, SHA-256 `60b2d250fb58208ffb13a0326232d42937a04b7a87a8c9328984655bdb72bd7f`
- `algorithms-pack.zip` — original ALGORITHMS_PROMPT_SYSTEM.zip, SHA-256 `9b82634a0016d8d7e505daeb137f1168039f770e855a612ac397d4d674a425bf`
- `russian-pack.zip` — canonical Russian active-system repack, SHA-256 `5ae5f6ff40d7ca2604659c2903d17dba18f9a22cb1c47235929888e921343ffa`

Russian note:
The user-supplied Russian source ZIP was validated locally with SHA-256
`88d3d676919fbacdd95ba011d04510f5855da969f4ef1958132a8333cdef7c77`.
The repo archive intentionally excludes duplicated GLOBAL_CONSTITUTIONS and legacy SOURCE_ARCHIVE,
because the repository now uses one shared Constitution under `prompts/CONSTITUTION.md`.

Do not execute ZIP-embedded duplicate constitutions as a second authority.
