# DB Index & Query Plan Contract

## Index model

An index concept separates:

- logical access goal;
- indexed key columns;
- column order;
- selectivity/workload assumptions;
- physical structure family;
- engine-specific support.

## B-tree/hash boundary

Algorithms owns generic data-structure mechanics.

Database owns access-pattern implications, selectivity/workload reasoning, maintenance cost and planner interaction.

## Composite indexes

Column order matters.

A proposal must name the target predicates/join/order workload.

## Covering indexes

Treat as engine/context dependent.

## Query plan

A plan may capture:

- operators;
- access paths;
- join strategy;
- estimated rows;
- planner cost;
- actual rows/time when analyze evidence exists.

## Estimate vs actual

Estimated rows/cost are planner estimates.

Actual rows/time are runtime observations.

Do not silently merge them.

## Planner cost

Planner cost is engine-specific relative cost, not universal milliseconds.

## Statistics

Planner decisions may depend on statistics, skew and correlation.

## Index use

Index existence does not guarantee use.

A sequential scan can be correct depending on selectivity, table size, statistics, data distribution, projected columns/order and engine configuration.

## Benchmark evidence

Performance claims require a controlled dataset/workload, engine/version, comparable context, repeated measurements and non-cherry-picked reporting.
