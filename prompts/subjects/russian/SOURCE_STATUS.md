# RUSSIAN PROMPT SYSTEM STATUS

`ARCHITECTURE RESTRUCTURE: COMPLETE · RU01–RU08 EXECUTED · TARGETED REVALIDATION ACTIVE`

## Durable truth

- RU00 routing: ACTIVE
- RU01: PASS
- RU02: PASS
- RU03: PASS → targeted owner-topology revalidation
- RU04: PASS
- RU05: PASS → targeted owner-topology revalidation
- RU06: PASS → targeted owner-topology revalidation
- RU07: PASS → targeted owner-topology revalidation
- RU08: PASS → integration/readiness revalidation
- Shared C3 release annex: previously executed successfully

Last released Russian source SHA:
`7697a3f05362c111fb481ebd6043738c12dbcb8c`

Release evidence:
- Preview workflow run `36881439526`: SUCCESS
- Production workflow run `36882164198`: SUCCESS

## Why revalidation is active

A full prompt-system audit found two durable-state/topology defects:

1. canonical prompt normalization had reset `PROJECT_STATE.json` / status files to a false pre-execution state;
2. active runtime metadata still exposed historical Pxx owners where RU03–RU08 are now the active authorities.

The Russian runtime itself was unchanged by the three commits after the released SHA up to audit base
`066ef7ce03be4e30f01fd69ae66a1cd859711226`.

## Execution rule

Do **not** restart RU01 or replay P0–P17.

Use RU00 dependency-aware revalidation and rerun only the impacted owners and gates:
`RU03 → RU05/RU06/RU07 → RU08 → exact RC → shared C3 release annex when required`.

Historical Pxx source material remains preserved in the prompt archive for provenance only.
