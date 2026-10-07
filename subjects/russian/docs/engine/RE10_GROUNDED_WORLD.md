# Russian Engine RE10 — Grounded World Runtime

State: VALIDATING

## Purpose

Move beyond one-off lesson scenes into reusable world definitions.

One world now describes:
- entities;
- spatial relations;
- roles;
- several Russian experiences;
- action goals;
- consequences;
- transfer.

## Current fixture

WORLD-ROOM-001 contains ball, book, cup, table and requester.

It can produce at least three experiences from one world definition:
- give ball;
- give book;
- place cup on table.

Russian wording remains fixture/noncanonical pending RU03 validation.

## Truth boundary

World state is Engine-owned semantic/runtime state.

Russian linguistic authority remains outside Engine.

## Failure semantics

A wrong action:
- emits failure observation;
- does not mutate the world into success;
- does not write mastery.

A correct action:
- changes holder/location state;
- emits non-authoritative observation evidence.

## Transfer

After a successful transfer-object task, runtime can return a different experience using the same action family with a different object.

## Exit gate

PASS when:
- one world produces multiple experiences;
- wrong action cannot fake state success;
- correct actions update deterministic world state;
- transfer works;
- reset is deterministic;
- no mastery mutation exists.
