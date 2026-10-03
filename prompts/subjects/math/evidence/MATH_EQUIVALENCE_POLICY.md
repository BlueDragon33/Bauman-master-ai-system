# MATH03 · EQUIVALENCE POLICY

Status: ACTIVE · evaluator authority = MATH03

## Authority
MATH02 owns mathematical facts, definitions, assumptions and domains. MATH03 evaluates a learner response against a problem contract. MATH04 may later provide validated CAS/numeric capabilities, but provider output never silently overrides MATH02/MATH03 authority.

## Typed classes
- **exact_scalar**: exact canonical value/text when exact form is required.
- **algebraic_expression**: deterministic symbolic normalization only inside the implemented grammar; otherwise `INDETERMINATE`.
- **numeric_approximation**: per-problem absolute/relative tolerance and significant-figure policy. No global epsilon.
- **set_interval**: normalize interval endpoints, openness/closedness and union order; different sets are rejected.
- **vector/matrix**: dimension/order/orientation are meaningful unless the problem contract explicitly permits an equivalent representation.
- **unit_quantity**: compare dimension first, then convert only through units declared in the problem contract.
- **proof_reasoning/open_modeling**: rubric/review, not string equivalence.

## Domain preservation
Equivalent-looking expressions are not fully accepted when required exclusions/assumptions are missing. Example: simplifying `(x²-4)/(x-2)` to `x+2` is only accepted when `x ≠ 2` is preserved.

## Deterministic algebraic pilot
The MATH03 pilot normalizer supports polynomial expressions using explicit `+`, `-`, `*`, parentheses and non-negative integer powers. It intentionally does **not** claim general CAS capability. Unsupported division, transcendental functions or ambiguous syntax return `INDETERMINATE`.

## Numerical policy
A numeric response is accepted only when
`|actual-expected| <= max(absTolerance, relTolerance*|expected|)`
under the problem-specific contract. Exact-required tasks must use an exact class/policy rather than a permissive tolerance.

## Fail-honest rule
Unsupported syntax/provider absence is not `false`; it is `INDETERMINATE` with an explicit reason.
