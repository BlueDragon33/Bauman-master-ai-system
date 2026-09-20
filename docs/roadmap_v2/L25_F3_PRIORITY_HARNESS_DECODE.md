# L25-F3 — Priority Harness Decode Integrity Repair

Status: `PASS`

## Trigger

B98 preflight inspection of the newly committed current Priority harness found a decode corruption in the derived-field guard:

- `KnowledgeGap` was incorrectly capitalized;
- the `weightedScore` string contained a malformed quote.

The file had not yet been admitted to the B98 CI gate.

## Fix

The forbidden derived fields are now exactly:

`knowledgeGap, prerequisiteUrgency, forgettingRisk, weightedScore, disposition, criticalOverride, reviewOnDemand, rank`

This restores valid JavaScript syntax and ensures callers cannot manually override any derived Priority field.

## Safety

No formula, normalization, disposition rule, persistence, scheduler or runtime behavior changed.

B98 remains in progress and must pass its own validator plus the complete project gate.


## Gate evidence

Accepted B98/F3 head: `18d3c772c19ebb912c6e4094ec3a4dab37cda55a`

- Roadmap V2 Current Gate — run `35338425039` — PASS
- Foundation Domain Model — run `35338424996` — PASS
- Windows checkout safety — run `35338425029` — PASS
- Russian Reference UI — run `35338424991` — PASS
- Cloudflare Preview — run `35338425087` — PASS
- Whole System Integration — run `35338425054` — PASS
