# E16R · m_p07 recovery after false E15 completion

## Repository truth

E15 was not a valid completed-content checkpoint. The current repository proves that:

- the VN physical chapter spine contains C01-C06 only; there is no physical `MATH-VN-LA-C07`;
- `m_p07` exists in `theory-framework.json` as an **outline-only logical module** with 8 sub-lessons;
- the modern theory store contains reusable prerequisites/anchors, but not a complete authored m_p07 set;
- legacy sidecar exports remain empty and must not be filled only to satisfy historical counts.

## Correction

E16R replaces the invalid “restore physical C07 sidecars” assumption with:

1. keep `m_p07` as a logical learning module;
2. map each of its 8 logical lessons onto valid physical chapters C01/C02/C04/C05;
3. preserve modern and legacy provenance anchors;
4. author only the missing content through the modern DataVault content stores;
5. run identity/link/content-quality gates before any PASS;
6. never use counts alone as completion evidence.

## E16R-B1 status

**PASS · architecture/source-map recovery completed.**

Machine-readable map:

`subjects/math/data/mp07-source-map-e16r.json`

Validator:

`scripts/validate-math-mp07-recovery-e16r.mjs`

## Remaining automatically generated sequence

- **E16R-B2** Author the four missing logical lesson cores: t02 centering/scaling, t03 covariance, t04 Pearson correlation, t05 covariance matrix.
- **E16R-B3** Strengthen partial anchors t01/t06/t07/t08 so each meets the m_p07 theory blueprint.
- **E16R-C** Generate/import formulas, exercises, applications, simulations, professor Q&A, question bank and review packs with stable IDs and provenance.
- **E16R-D** Validate prerequisite continuity C01 → C02 → C04/C05 → m_p07.
- **E16R-E** Runtime regression: theory selector, module navigation, sidecar routing and simulation tabs.
- **E17** Start time-series introduction only after E16R-B…E PASS.

No production deploy. No direct merge to `main`.
