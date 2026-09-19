# L24/B95 — Master-ready / Prerequisite Gates Acceptance

Status: `PASS`

## Master-ready behavior

B95 requires:

- all applicable evidence dimensions before `master_ready`;
- missing required evidence cannot produce Master-ready;
- GD2/GD3 non-Russian targets require 5–10 verified Russian technical terms;
- Russian-language targets do not require an extra Russian-term gate;
- failed retention after a previously complete state produces `can_on`;
- active gap override blocks Master-ready;
- explicitly clearing a resolved gap can restore the derived gate.

## Prerequisite semantics

B95 consumes only the L24-H1 current prerequisite projection.

Required behavior:

- blocking: source must be `dat_prerequisite` or `master_ready`;
- just-in-time: same blocking state rule, while preserving segment identity;
- alternative/any-of: at least one group member must satisfy;
- concurrent: `dang_hoc`, `dat_prerequisite` or `master_ready` satisfies;
- recommended: explicit advisory, never blocks;
- contextual: explicit advisory, never blocks;
- blocking external gate: must be supplied explicitly as true;
- unresolved external gates remain visible.

## Safety

- all results are deeply frozen;
- all snapshots/evaluations remain non-persisted;
- malformed, duplicate, persisted or unknown snapshot inputs fail closed;
- no canonical graph or Mastery manifest is admitted;
- canonical Mastery/Consumer/Diagnostic sources remain byte-identical;
- production integration remains disconnected.

B96 remains blocked until B95 and all six project gates pass.


## Gate evidence

Accepted B95 head: `571e9bcd1e094ebc5f9531da1fd2caab82acf0bc`

- Roadmap V2 Current Gate — run `35335611053` — PASS
- Foundation Domain Model — run `35335611056` — PASS
- Windows checkout safety — run `35335611140` — PASS
- Russian Reference UI — run `35335611030` — PASS
- Cloudflare Preview — run `35335611059` — PASS
- Whole System Integration — run `35335611041` — PASS

B95 is closed. B96 is now active.
