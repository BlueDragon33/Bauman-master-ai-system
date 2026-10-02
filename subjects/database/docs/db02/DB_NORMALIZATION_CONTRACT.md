# DB Normalization Contract

## Functional dependency

Canonical form:

`X -> Y`

where X and Y are attribute sets in a named relation schema.

FDs are semantic assumptions/constraints and require provenance.

## Closure / candidate keys

Attribute closure may be computed when required.

A candidate key must be a minimal superkey.

## Normal forms

Canonical scope supports:

- 1NF;
- 2NF;
- 3NF;
- BCNF.

Do not teach normalization as "split tables until small".

## Anomalies

Normalization examples connect redundancy to update, insertion and deletion anomalies.

## Decomposition properties

Lossless join and dependency preservation are separate properties.

## Performance boundary

Normalization is primarily a logical design/integrity decision.

It does not guarantee faster queries.

Denormalization requires workload evidence; it is not a blanket optimization rule.

## P6 bridge

The Enrollment-style example from P6 is source evidence, but DB02 owns the canonical definitions and IDs.
