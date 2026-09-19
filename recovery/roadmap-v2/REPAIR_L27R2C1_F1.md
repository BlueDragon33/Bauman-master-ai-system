# L27R2C1-F1 — Make historical baseline evidence explicit

## Trigger

Roadmap V2 Reconciliation run `35327548390` failed in the R2C1 validator.

## Root cause

The audit correctly classified `validate-baseline-inventory.mjs` as hard-coded to the historical baseline, but the JSON finding used the shortened human-readable text `e383912...`. The validator incorrectly expected the full 40-character commit SHA to appear inside the free-text findings array.

## Fix

- add an explicit machine-readable `historicalBaseline` field with the full commit SHA;
- validate that field directly;
- keep the old filename coupling check for `math-main-e383912-inventory.json` in the tool findings.

This strengthens the audit by separating structured evidence from descriptive text.

## Safety

No runtime, canonical Roadmap executable, generated data, UI, package or learner state is changed.
