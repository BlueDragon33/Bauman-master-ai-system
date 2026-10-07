# Russian Engine RE06 — Derived Learner Model & Adaptive Recommendation

State: **PASS**

## Boundary

RE06 does not become the mastery authority.

It derives a learner projection from observation evidence.

RU04/C4 remain authoritative for mastery and official progression judgment.

## Derived dimensions

Initial mappings include:
- grounded semantic comprehension;
- listening;
- speech-recognition signal;
- speaking practice;
- repair;
- transfer;
- retention.

## Support dependency

For each observed dimension, the model tracks:
- evidence count;
- success rate;
- independent success rate;
- support dependency;
- derived estimate.

A success with high support is not treated the same as an independent success.

## Adaptive recommendation priority

1. due review;
2. weak-dimension remediation;
3. support-dependency variation;
4. milestone transfer;
5. introduce next validated experience;
6. pause if no safe content exists.

This remains recommendation logic, not a mastery writer.

## Coexistence

Existing `RussianAdaptivePlanner` remains the current planner owner.

RE06 stays isolated until RE09 defines the adapter/migration boundary.

## Validation

Executed against the branch implementation: **11/11 checks PASS**.

Verified:
- semantic comprehension and speaking remain asymmetric;
- support dependency affects the derived estimate;
- low speaking evidence triggers remediation;
- due review outranks new content;
- milestone triggers transfer;
- strong state can introduce the next experience;
- derived snapshot contains no mastery field.

## Exit

**RE06 PASS.**
