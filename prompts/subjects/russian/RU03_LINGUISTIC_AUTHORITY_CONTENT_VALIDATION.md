# RU03 — LINGUISTIC AUTHORITY & CONTENT VALIDATION
## Russian correctness · naturalness · terminology · provenance

Former source responsibility: P7.

---

# 0. MISSION

Establish whether Russian content is trustworthy enough to teach, assess and reuse.

RU03 validates truth.

It does not own learner mastery, SRS, UI, audio runtime, or production release.

---

# 1. CONSTITUTION ROUTING

Load:

- C4: content provenance, authority, quality gates, versioning;
- C1: content ownership/registry/schema compatibility;
- C3: validation, defect/root-cause/regression rules.

C2 only when an error is presentation-induced.

---

# 2. TRUST CLASSES

Use explicit provenance/trust semantics such as:

- authoritative;
- curated;
- corpus/source-supported;
- generated/machine-suggested;
- legacy/unverified;
- unknown.

Provenance and correctness are separate dimensions.

A generated item does not become authoritative because JSON validates.

---

# 3. VALIDATION RESULT

Support distinctions such as:

- VERIFIED;
- VERIFIED_WITH_VARIANTS;
- CONTEXT_DEPENDENT;
- DISPUTED;
- UNVERIFIED;
- INCORRECT.

Do not force genuine accepted variants into one artificial answer.

---

# 4. VALIDATION DOMAINS

Validate as applicable:

- orthography;
- ё/е handling;
- stress;
- morphology;
- inflection;
- case/preposition government;
- aspect;
- motion verbs;
- lexical sense/polysemy;
- false friends;
- collocation/phraseology;
- semantic compatibility;
- register;
- politeness/pragmatics;
- naturalness;
- classroom/academic wording;
- technical/research terminology;
- translation fidelity;
- examples;
- answer keys/distractors;
- transcripts;
- pronunciation-relevant text.

---

# 5. SENSE-LEVEL VALIDATION

Do not validate a lemma globally when:

- government differs by sense;
- register differs by sense;
- technical meaning differs from everyday meaning;
- translation differs by context.

Validation must attach to the correct semantic owner.

---

# 6. TECHNICAL RUSSIAN

Validate technical language against appropriate domain sources.

Handle:

- mathematics;
- computer science/software;
- database/data;
- AI/ML;
- operating systems/networks;
- control/automation;
- signals/measurement;
- probability/statistics;
- optimization;
- simulation/experiment;
- research methods.

RU03 validates terminology.

RU06 decides pedagogical depth and production tasks.

---

# 7. NUMBERS · SYMBOLS · UNITS

Validate Russian representation of:

- decimals;
- fractions;
- percentages;
- ranges;
- dates/times;
- scientific notation;
- dimensions;
- SI units;
- equations;
- formula reading;
- mixed-language technical text;
- abbreviations/acronyms.

Do not let typography normalization change mathematical/technical meaning.

---

# 8. VIETNAMESE LEARNER RISKS

Maintain validated error/contrast coverage for high-value Vietnamese interference such as:

- ы/и;
- ш/щ;
- ж/з;
- ц/ч;
- х;
- р;
- hard/soft consonants;
- stress;
- unstressed vowels;
- devoicing;
- consonant clusters;
- tonal-transfer effects where evidenced.

---

# 9. GENERATED CONTENT

Generated content begins non-authoritative.

Pipeline:

generate candidate
→ schema validate
→ linguistic validate
→ source/provenance check
→ reviewer/curation state where required
→ activate.

Never let AI-generated authoritative answer keys enter assessment silently.

---

# 10. CROSS-DATA CONSISTENCY

Validate that the same concept does not conflict across:

- vocab;
- grammar;
- lesson;
- speaking;
- dialogue;
- deep-speaking;
- reading/writing;
- assessment;
- technical content;
- derived indexes.

Fix the canonical owner, then regenerate consumers.

---

# 11. REVISION IMPACT

If a validated fact changes materially:

trace impact to:

- lessons;
- examples;
- assessment;
- evidence interpretation;
- audio/transcript;
- search/indexes;
- learner-facing references.

Do not rewrite historical learner evidence silently.

---

# 12. SAFE AUTO-FIX BOUNDARY

Safe examples:

- normalization that provably preserves meaning;
- duplicate derived index regeneration;
- deterministic metadata repair.

Require review for:

- meaning;
- stress;
- morphology;
- government;
- register;
- technical claim;
- answer key;
- translation nuance.

---

# 13. REQUIRED OUTPUTS

Maintain:

- validation policy;
- source hierarchy;
- trust/provenance model;
- terminology register;
- content issue queue;
- validated-variant policy;
- automated validator suite;
- golden linguistic fixtures;
- change/revalidation matrix;
- RU05/RU06/RU07 truth contract.

---

# 14. EXIT GATE

PASS when active high-risk Russian content has:

- known owner;
- known provenance/trust;
- validated linguistic status;
- no unresolved critical answer-key/terminology conflict;
- accepted variants handled explicitly;
- generated content separated from authoritative truth;
- downstream consumers tied to canonical IDs.

**RU03 answers: why should the system believe this Russian is correct?**