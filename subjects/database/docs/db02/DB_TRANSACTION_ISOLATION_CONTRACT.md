# DB Transaction & Isolation Contract

## Transaction entity

A transaction scenario contains:

- ordered operations;
- read/write sets where relevant;
- commit/abort outcome;
- invariants;
- named isolation context;
- optional engine profile.

## ACID

- **Atomicity** — all-or-nothing outcome.
- **Consistency** — declared database constraints/invariants are preserved by a valid transaction; it does not mean all business logic becomes automatically correct.
- **Isolation** — concurrent effects are constrained by the actual isolation model.
- **Durability** — committed effects survive according to the engine/storage guarantee being discussed.

## Canonical phenomena

May include:

- dirty read;
- non-repeatable read;
- phantom;
- lost update;
- write skew.

A task must not claim a phenomenon is possible/impossible without naming isolation/engine context when implementation matters.

## Locking/MVCC

Locking and MVCC are concurrency-control mechanisms.

Engine-specific visibility/locking behavior belongs in `DatabaseEngineProfile`.

## Deadlock

A wait-for cycle is conceptual evidence of deadlock possibility.

Deadlock is not synonymous with any slow transaction.

## Safety boundary

Learner transaction exercises must use isolated/resettable learner environments and must never run against control-service preview/production D1.
