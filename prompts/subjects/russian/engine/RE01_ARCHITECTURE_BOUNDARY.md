# RE01 — ARCHITECTURE · CONTRACTS · SCALE BOUNDARY

Canonical owners: C1 + RU02 + RU08

Mission: define a Russian Engine architecture that can grow to 100 learner levels, very large content libraries and many users without turning the Russian app into tightly coupled feature code.

---

# 1. TARGET SHAPE

Conceptual structure:

```
subjects/russian/
  app-facing existing code
  engine/
    public/
    runtime/
    acquisition/
    knowledge/
    speech/
    conversation/
    adaptive/
    evidence/
    storage/
    providers/
    content/
    schemas/
    validators/
    tests/
```

This is a target direction, not permission to mass-create folders before evidence justifies them.

---

# 2. PUBLIC / PRIVATE BOUNDARY

Only `engine/public/**` or equivalent approved facade may be consumed by general Russian UI.

General UI must not import:
- SRS internals;
- knowledge graph internals;
- scoring internals;
- provider-specific speech implementation;
- raw learner event storage;
- AI prompt internals.

Engine internals must not reach into:
- navbar;
- shell theme;
- global auth internals;
- global route internals;
- unrelated subject state.

---

# 3. CONTRACT FAMILIES

Design versioned contracts for:

## Experience contract
Describes what the learner sees/does without encoding UI layout.

Fields may include:
- experienceId;
- type;
- targetCompetencies;
- prerequisiteRefs;
- scene/context;
- stimulus;
- expected action family;
- support policy;
- evidence policy;
- difficulty vector;
- offline requirement;
- accessibility alternatives;
- revision.

## Interaction contract
Captures learner action:
- selected object;
- gesture/action;
- text;
- speech recording reference;
- response timing;
- replay usage;
- hint usage;
- abandon/repair.

## Evidence contract
Immutable/append-oriented facts:
- attempt identity;
- competency refs;
- observed behavior;
- confidence/quality;
- provider uncertainty;
- support level;
- environment limitations;
- timestamp/order;
- content revision.

## Learner snapshot contract
Derived state only:
- capability vector;
- recent weaknesses;
- review queue summary;
- current band/level presentation;
- support dependency;
- confidence.

## Scenario contract
- world facts;
- roles;
- goals;
- valid action envelope;
- state transitions;
- repair paths;
- completion rules;
- deterministic fallback.

---

# 4. VERSIONING

Every public contract requires:
- `schemaVersion`;
- stable IDs;
- migration path;
- backward compatibility rule;
- reject/repair behavior for unsupported versions.

Content revision is separate from schema version.

Never make UI title the identity.

---

# 5. EVENT MODEL

Prefer domain events over cross-module direct calls.

Candidate events:
- experience.started;
- stimulus.played;
- replay.requested;
- hint.requested;
- interaction.submitted;
- comprehension.demonstrated;
- speech.sample.captured;
- speech.signal.received;
- scenario.repair.used;
- scenario.goal.completed;
- evidence.recorded;
- review.scheduled;
- learner.snapshot.updated.

Events are observations, not automatic mastery decisions.

---

# 6. STORAGE PORT

Engine semantics use a storage facade.

Required conceptual operations:
- load learner profile;
- append evidence;
- persist resumable session;
- query review candidates;
- load content by stable ID;
- export/import;
- migrate schema;
- journal pending sync.

Default local provider should be viable.

Provider-specific storage IDs must not leak into canonical domain identity.

---

# 7. PROVIDER PORTS

External capabilities sit behind ports:
- audio playback;
- TTS;
- recording;
- STT;
- pronunciation signal extraction;
- AI conversation/coaching;
- optional sync;
- optional analytics.

Every provider declares:
- capability;
- availability;
- privacy characteristics;
- offline support;
- confidence/limitations;
- fallback.

Provider outage must degrade a capability, not crash the subject.

---

# 8. PERFORMANCE MODEL

Architecture must support:
- lazy content loading;
- chunked media;
- bounded in-memory graphs;
- index-based lookup;
- worker-based heavy local computation when useful;
- no loading all vocabulary/dialogue/audio at startup;
- resumable caches;
- deterministic cache invalidation by content revision.

Set measurable budgets during implementation; do not invent permanent numbers in this planning prompt.

---

# 9. 100-LEVEL SCALING RULE

A level must be a record/configuration, not a branch in source code.

Forbidden:
```
if level === 1 ...
if level === 2 ...
...
if level === 100 ...
```

Preferred:
```
LevelDefinition
  requires competencies
  configures difficulty ranges
  defines evidence gates
  links content pools
  defines promotion/readiness policy
```

---

# 10. MULTI-USER READINESS

From day one, avoid assuming a global singleton learner.

Every learner-owned record must be scopeable by a stable learner/profile identity, even if the first release uses one local profile.

Do not implement commercial auth before needed.

Do prevent architectural assumptions that make multi-user migration expensive.

---

# 11. FAILURE ISOLATION

Failures must be typed:
- content missing;
- invalid content;
- media unavailable;
- speech permission denied;
- STT uncertain;
- AI offline;
- storage full;
- migration failed;
- sync conflict;
- unsupported capability.

Never transform infrastructure failure into learner failure.

---

# 12. SECURITY

No content-defined arbitrary code evaluation.

Validate:
- schemas;
- IDs;
- external URLs;
- HTML/sandbox capability;
- provider responses;
- imported packs;
- file sizes/types;
- stored rich text.

Secrets remain outside content and client-exposed prompt data.

---

# 13. RE01 OUTPUTS

Produce before broad implementation:
- module boundary map;
- public facade contract;
- schema inventory;
- provider-port map;
- storage-port map;
- event taxonomy;
- error taxonomy;
- migration policy;
- performance strategy;
- multi-user identity strategy;
- architecture tests.

---

# 14. RE01 EXIT GATE

PASS only when a minimal vertical slice can be represented end-to-end without UI hardcoding:
content definition
→ experience
→ interaction
→ evidence
→ derived learner update
→ next experience.

No new mandatory backend is required for PASS.
