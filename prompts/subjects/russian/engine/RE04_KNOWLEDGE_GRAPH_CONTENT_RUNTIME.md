# RE04 — KNOWLEDGE GRAPH & CONTENT RUNTIME

Canonical owners: RU02 + RU03 + RU08 + C1

Mission: represent Russian as a connected world of meaning rather than a flat list of translated vocabulary and isolated lessons.

---

# 1. GRAPH PRINCIPLE

The core semantic graph should support relationships among:

- concept;
- lexical sense;
- lemma/form;
- phonetic pattern;
- action;
- property;
- entity;
- person/role;
- place;
- time;
- intention;
- emotion;
- event;
- grammatical function;
- collocation/chunk;
- scenario;
- competency;
- prerequisite;
- media;
- evidence target.

---

# 2. EXAMPLE

Concept: APPLE
Russian lexical link: яблоко
Relations may include:
- IS_A food;
- IS_A object;
- HAS_PROPERTY red/green/round;
- AFFORDS eat/take/give/buy/cut;
- CAN_BE in/on/under;
- PARTICIPATES_IN shop/home/meal scenarios;
- lexical morphology refs;
- pronunciation/stress refs.

The graph stores meaning relationships.

Translation may exist as metadata/support, not the primary relation.

---

# 3. CANONICAL TRUTH

RU03 validates linguistic facts:
- spelling;
- stress;
- morphology;
- government;
- accepted variants;
- pronunciation-relevant facts;
- register;
- naturalness.

RE04 must reference those facts rather than inventing parallel lexical truth.

---

# 4. CONTENT EXPERIENCE TYPES

Content runtime should eventually support descriptors for:
- observe;
- identify;
- discriminate;
- match by meaning;
- act;
- sequence;
- manipulate;
- listen-and-act;
- listen-and-choose;
- shadow;
- repeat;
- answer;
- substitute;
- describe;
- narrate;
- clarify;
- roleplay;
- open conversation;
- reading;
- writing;
- technical explanation;
- research defense.

Each type emits evidence through a common contract.

---

# 5. SCENE MODEL

A scene can define:
- visible entities;
- roles;
- goals;
- affordances/actions;
- world state;
- audio lines;
- valid interpretations;
- distractors;
- transitions;
- consequences;
- support assets;
- accessibility description.

Do not encode scene logic only in DOM event handlers.

---

# 6. CONTENT POOLS

Levels and competencies should pull from content pools rather than exact fixed sequences where appropriate.

Pools allow:
- variation;
- anti-memorization;
- adaptive review;
- personalization;
- speaker variation;
- different visual scenes with same semantics.

Canonical official assessments may still use fixed controlled forms.

---

# 7. CONTENT PACKS

Prepare for Russian content packs:
- core foundation;
- survival Russia;
- university life;
- Moscow/transport;
- dorm/admin;
- technical Russian;
- Bauman academic;
- research/НИР;
- ВКР/defense;
- optional specialty packs.

Packs should declare:
- schema;
- dependencies;
- competencies;
- level ranges;
- media;
- offline policy;
- provenance;
- licensing metadata;
- revision.

Do not couple entitlement logic into content semantics.

---

# 8. AUTHORING VALIDATION

Validators should detect:
- orphan concept;
- invalid ref;
- circular prerequisite;
- missing media;
- missing accessibility fallback;
- unvalidated linguistic fact;
- duplicate stable ID;
- level outside declared range;
- missing evidence target;
- impossible scenario path;
- unsupported capability;
- translation accidentally exposed in Russian-first mode.

---

# 9. CONTENT REVISION

Published meaning-changing content creates a revision.

Historical official evidence must retain the revision used.

Learner review may migrate to newer revisions under explicit rules.

---

# 10. GENERATIVE CONTENT

AI-generated content is ephemeral/draft unless reviewed.

Dynamic variation must preserve:
- target meaning;
- linguistic validity constraints;
- difficulty bounds;
- scenario facts;
- safety.

Generated content never silently becomes canonical.

---

# 11. SEARCH / DISCOVERY

Search should understand more than titles.

Index:
- lemma;
- sense;
- concept;
- chunk;
- function;
- scenario;
- competency;
- level band;
- grammar concept;
- technical term.

Search results reference canonical IDs.

---

# 12. OFFLINE

Core packs should be packageable for offline use where practical.

Large media may use selective download.

Missing optional media must have explicit fallback rather than blank failure.

---

# 13. RE04 EXIT GATE

PASS when a small but real graph can generate multiple different experiences for the same concepts without duplicating linguistic truth or hardcoding lesson-specific UI.
