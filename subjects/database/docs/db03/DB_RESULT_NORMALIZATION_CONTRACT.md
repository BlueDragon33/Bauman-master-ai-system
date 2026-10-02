# DB Result Normalization Contract

## Columns

Columns may be contractually relevant by semantic alias, count and (only if required) order.

Irrelevant display formatting must not reject correct semantics.

## Rows

Task row policies:
- `bag` — multiplicity matters;
- `set` — multiplicity ignored;
- `ordered-bag` — multiplicity and sequence matter;
- `ordered-set` — uniqueness and sequence matter.

Default SQL task behavior is unordered bag unless explicitly overridden.

## NULL

NULL is a distinct canonical marker and is never coerced to empty string, zero, false or text "NULL".

## Unordered comparison

Canonicalize rows and compare multisets for bag policy or sets for set policy.

## Ordered comparison

Compare declared ordering keys/directions. Ties require declared secondary keys or explicitly tie-insensitive groups.

## Diagnostics

Report semantic mismatch dimension: columns, row inclusion, duplicates, NULL, ordering or aggregation—not merely "wrong answer".
