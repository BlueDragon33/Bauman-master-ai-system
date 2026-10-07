# Russian Engine RE06 — Derived Learner Model & Adaptive Recommendation

State: VALIDATING

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

## Exit gate

PASS when:
- learner dimensions remain asymmetric;
- support dependency affects estimates;
- review outranks new content;
- weak skills can trigger remediation;
- milestones trigger transfer;
- model writes no mastery.
