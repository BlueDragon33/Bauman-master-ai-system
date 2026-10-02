# DB04 Transaction Simulation Contract

Capability: `db.transaction.simulate`

## Scenario

A deterministic scenario declares:
- theoretical or engine-backed mode;
- isolation model/profile;
- T1/T2/... sessions;
- ordered operations;
- reads/writes;
- commit/rollback;
- expected visibility/anomaly.

## Supported conceptual evidence

Where in scope:
- dirty read;
- non-repeatable read;
- phantom;
- lost update;
- write skew;
- deadlock/wait-for cycle.

## Truthfulness

Theoretical simulation is labeled **theoretical**.

Engine-backed simulation is labeled with engine/version/profile.

Do not claim a theoretical schedule exactly models all engines.

## Failure isolation

Simulation never uses application/control databases.

A simulator error does not produce mastery evidence.
