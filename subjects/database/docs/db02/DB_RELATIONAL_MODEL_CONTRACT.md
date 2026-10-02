# DB Relational Model Contract

## Relation vs SQL table

A mathematical relation is modeled as a set of tuples over attributes/domains.

A practical SQL table/result may exhibit bag/multiset behavior unless duplicate elimination is explicit.

The platform must not teach "table = spreadsheet".

## Schema

A `RelationSchema` owns stable identity, attributes, domains, keys, constraints and provenance.

A schema is distinct from its current rows.

## Attribute/domain

Each attribute has a stable ID, semantic name, domain/type meaning and nullability.

Engine SQL types are attached through an engine-specific mapping, not used as the cross-engine semantic definition.

## Keys

Supported key kinds:

- super;
- candidate;
- primary;
- alternate;
- foreign.

Composite keys are first-class.

A primary key is a chosen candidate key, not merely an auto-increment column and not merely an index.

## Constraints

Canonical types:

- NOT NULL;
- UNIQUE;
- PRIMARY KEY;
- FOREIGN KEY;
- CHECK.

Constraints are database truth, not UI decoration.

## Referential integrity

Foreign keys reference an eligible key according to supported engine semantics.

Referential actions are engine-profiled; support must not be invented.

## Fixtures

`TupleFixture` is deterministic learning/test data.

Fixtures never redefine schema truth.

## Owner boundary

Algorithms may explain B-tree/hash mechanics.
Database owns how keys, constraints, indexes and query semantics affect database behavior.
