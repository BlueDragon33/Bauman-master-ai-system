# L25-F3 — Priority Harness Decode Integrity Repair

Status: `FIX_APPLIED_PRE_GATE`

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
