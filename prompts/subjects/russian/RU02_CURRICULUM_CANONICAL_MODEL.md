# RU02 — CURRICULUM · COMPETENCY · CANONICAL RUSSIAN MODEL
## Academic blueprint + Russian content semantics

Former source responsibility: P2 + P3.

---

# 0. MISSION

Turn Russian from a collection of lessons/resources into a coherent competency-driven subject model while preserving validated existing content and learner history.

RU02 defines Russian-specific academic structure and canonical entity semantics.

It does not decide whether an individual linguistic fact is correct; RU03 validates truth.

---

# 1. CONSTITUTION ROUTING

Primary:

- C4 — program outcomes, competency graph, prerequisite graph, learning contracts, evidence mapping, content provenance/versioning;
- C1 — content-as-data, manifest, registry, Subject/Lesson Factory, schema versioning;
- C3 — schema/contract/regression validation.

C2 is loaded only for curriculum-facing information architecture questions.

---

# 2. RUSSIAN LEARNING JOURNEY

Preserve staged progression conceptually:

foundation / Vietnam
→ survival
→ preparatory Russian
→ university Russian
→ academic/technical Russian
→ research Russian
→ НИР
→ ВКР
→ defense.

Do not collapse learner ability to one scalar level.

Track skills independently where needed:

- phonetics;
- listening;
- speaking;
- reading;
- writing;
- vocabulary recognition/production;
- grammar recognition/production;
- interaction;
- academic;
- technical;
- research.

---

# 3. CURRICULUM STRUCTURE

Use:

Program/Subject Outcome
→ Competency
→ Skill
→ Concept
→ Prerequisite
→ Learning Experience
→ Practice
→ Assessment
→ Evidence
→ Mastery
→ Transfer.

Academic sequence may additionally expose:

Stage
→ Macro Module
→ Unit
→ Micro-Lesson.

Lesson is not the root authority.

---

# 4. PRESERVE R01–R26 MACRO MAP

Treat R01–R26 as macro curriculum identity unless RU01 evidence proves a required migration.

The current target progression remains conceptually:

R01–R06 foundation/survival

R07–R10 preparatory Russian

R11–R14 university/HK1

R15–R18 technical/HK2

R19–R22 НИР/HK3

R23–R26 ВКР/HK4.

Do not use title changes to change stable identity.

---

# 5. CANONICAL ENTITY FAMILIES

Russian needs canonical semantics for at least:

- Stage;
- Macro Module;
- Unit;
- Micro-Lesson;
- Competency;
- Linguistic Function;
- Phonetic Concept;
- Grammar Concept;
- Lexical Entry;
- Phrase/Collocation;
- Listening Item;
- Speaking Item;
- Dialogue Scenario;
- Deep Speaking Task;
- Reading Text;
- Writing Task;
- Technical Concept;
- Academic Function;
- Exercise;
- Assessment Item;
- Performance Task;
- Error Pattern;
- Remediation Path;
- Media Asset;
- Provenance Record.

Indexes/caches are derived unless proven otherwise.

---

# 6. ONE FACT · ONE OWNER · MANY USES

Do not copy one Russian fact into multiple canonical sources.

Examples:

- stress belongs to canonical lexical/phonetic data;
- grammar government belongs to canonical grammar/lexical relation;
- dialogue consumes lexical/grammar refs;
- assessment consumes canonical concept refs;
- search returns canonical IDs;
- lesson references objects instead of embedding conflicting copies.

---

# 7. STABLE ID RULE

IDs must be:

- stable;
- machine-readable;
- independent of UI title;
- version-free;
- immutable once learner state/evidence references them.

Separate:

`schemaVersion`

from:

`contentRevision`.

---

# 8. PREREQUISITE GRAPH

Machine-readable.

Validate:

- missing prerequisite;
- circular prerequisite;
- orphan concept;
- unreachable competency;
- assessment for untaught competency.

---

# 9. PHONETIC MODEL

Russian-specific first-class concepts include:

- Cyrillic sound-letter mapping;
- hard/soft;
- voiced/unvoiced;
- devoicing;
- assimilation;
- word stress;
- vowel reduction;
- difficult consonants;
- consonant clusters;
- phrase stress;
- intonation;
- connected speech.

Stress is data, not cosmetic markup.

---

# 10. GRAMMAR MODEL

Separate:

`FORM`

from:

`FUNCTION`.

Model structured:

- cases;
- preposition + case;
- agreement;
- tense;
- aspect;
- motion verbs;
- prefixed motion;
- numerals/quantity;
- negation;
- comparison;
- clause relations;
- passive/participles where appropriate;
- word order/information structure;
- academic nominalisation.

Government must be structured and refer to meaning/sense where needed.

---

# 11. LEXICAL MODEL

Support when verified:

- lemma;
- stress;
- POS;
- gender/animacy;
- morphology;
- senses;
- aspect/aspect pair;
- government;
- collocations;
- word family;
- confusables;
- frequency/domain/level;
- active/passive/reference role;
- examples;
- provenance;
- lesson/speaking/dialogue links.

Do not fabricate morphology to fill schema fields.

---

# 12. SKILL MODELS

Listening:

audio/transcript/task/reveal/provenance/concepts.

Speaking:

basic task semantics and evidence refs.

Dialogue:

roles/functions/turns/variations/repair.

Deep Speaking:

monologue/explanation/argument/research/defense/pressure Q&A.

Reading/Writing:

purpose/audience/register/functions/rubric/source refs.

---

# 13. ERROR CORPUS

Model Russian learner errors by:

- category;
- severity;
- wrong/correct examples;
- explanation;
- Vietnamese interference where evidenced;
- concept refs;
- repair task;
- production check.

RU03 validates linguistic correctness.

RU04 uses errors for remediation.

---

# 14. CONTENT GRAPH

Core edges may include:

`requires`

`teaches`

`uses`

`reviews`

`tests`

`contrasts`

`extends`

`remediates`

`contains`

`belongs-to`

`derived-from`.

Derived indexes must be regenerable.

---

# 15. MIGRATION

Any canonical schema change must include:

- old fixture;
- mapping;
- aliases;
- idempotent migration;
- validation;
- rollback/recovery;
- preservation of learner state/evidence.

No silent reset.

---

# 16. REQUIRED OUTPUTS

Create/update:

- Russian curriculum/competency graph;
- canonical content schemas;
- owner registry;
- prerequisite graph;
- content graph;
- migration map from legacy datasets;
- validation rules;
- RU03/RU04 input contract.

---

# 17. EXIT GATE

PASS when:

- curriculum outcomes/competencies are explicit;
- prerequisite graph is valid;
- canonical entity owners are unambiguous;
- lessons reference rather than duplicate truth;
- stable IDs are preserved/migrated safely;
- Russian-specific schemas are compatible with global Content/Academic architecture;
- downstream RU03/RU04 can work without rediscovering semantics.

**RU02 defines structure. RU03 proves truth. RU04 proves learning evidence.**
