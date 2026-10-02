# HUB SCOPE BOUNDARY

## Canonical rule

**BAUMAN HUB IS AN ORCHESTRATOR / PORTAL, NOT THE INTERNAL IMPLEMENTATION OF SUBJECT APPS.**

The Hub owns cross-cutting navigation, presentation, scheduling, aggregation, orchestration and integration contracts.

Each subject app owns its own:
- curriculum content beyond Hub metadata;
- lessons/exercises/simulations;
- assessment logic;
- mastery calculation;
- pedagogy/adaptive logic;
- subject-specific AI tutor behavior;
- internal persistence/database;
- internal routes/components/build/deployment.

## Allowed Hub dependencies

A subject app is visible to Hub only as:
1. a registered descriptor;
2. an API/contract endpoint or message transport;
3. a launch/deep-link target;
4. a normalized read model;
5. a versioned command capability set.

## Forbidden coupling

Hub code/prompts must not:
- import subject source modules;
- query subject databases directly;
- reach into subject localStorage/IndexedDB/private runtime state;
- depend on subject DOM structure;
- scrape subject pages as an integration mechanism;
- write grades/mastery/scores unless a future explicit versioned contract delegates that authority;
- copy subject learning engines into Hub;
- modify `prompts/subjects/**` as part of Hub work.

## Failure behavior

When a subject app is unavailable or contract-incompatible:
- Hub degrades gracefully;
- preserve last safe summary only if provenance/TTL allow it;
- show unavailable/stale state explicitly;
- do not fabricate 0% progress or mastery;
- do not reverse-engineer subject internals as a workaround.
