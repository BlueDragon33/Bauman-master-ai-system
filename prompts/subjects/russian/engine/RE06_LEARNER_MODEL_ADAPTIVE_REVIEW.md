# RE06 — LEARNER MODEL · ADAPTIVE PROGRESSION · REVIEW

Canonical owners: RU04 + C4, consuming RU02/RU03/RU05 evidence

Mission: build an honest learner model that adapts what happens next without reducing learning to XP, streak or raw completion.

---

# 1. SOURCE OF TRUTH

Canonical source:
append-oriented learning evidence + versioned learner state.

Derived:
- current estimates;
- weaknesses;
- level readiness;
- review queue;
- recommendations;
- dashboards.

Never treat a rendered progress bar as source truth.

---

# 2. SKILL VECTOR

Track estimates separately where useful:
- semantic comprehension;
- listening;
- natural-speed listening;
- pronunciation;
- stress;
- rhythm/intonation;
- reading;
- writing;
- vocabulary recognition;
- vocabulary production;
- chunk fluency;
- grammar recognition;
- grammar production;
- spontaneous speaking;
- response latency;
- repair;
- dialogue continuity;
- academic;
- technical;
- research;
- retention;
- transfer.

---

# 3. EVIDENCE WEIGHTING

Evidence quality may depend on:
- task type;
- support level;
- open vs closed response;
- novelty;
- delay;
- transfer;
- provider confidence;
- attempt integrity;
- content revision;
- repeated consistency.

Do not assign one permanent global weight formula before real validation.

Keep policies configurable and testable.

---

# 4. SUPPORT DEPENDENCY

Record support use:
- replay count;
- slow playback;
- visual cue;
- transcript reveal;
- grammar explanation;
- Vietnamese translation;
- model answer;
- AI hint.

Goal is not “never use help”.

Goal is increasing independent performance where appropriate.

---

# 5. ADAPTIVE DECISION ENGINE

Candidate next-action categories:
- introduce;
- reinforce;
- vary;
- remediate;
- review;
- transfer;
- advance;
- pause;
- diagnostic probe.

Decision inputs:
- prerequisite readiness;
- recent errors;
- retention risk;
- skill balance;
- support dependency;
- learner goal;
- available time;
- content availability;
- fatigue/session pattern only if measured responsibly.

---

# 6. SPACED REVIEW

Review should schedule more than word cards.

Reviewable units may include:
- concept;
- lexical sense;
- chunk;
- listening pattern;
- pronunciation contrast;
- grammar function;
- scenario strategy;
- technical terminology;
- repair pattern.

Different unit types can have different forgetting behavior.

---

# 7. SEMANTIC REVIEW

Prefer meaningful retrieval:
- recognize word in a new scene;
- act on instruction;
- use chunk in a different situation;
- explain concept;
- respond to a new speaker;
- repair a novel misunderstanding.

Avoid making all review “show Russian → recall Vietnamese”.

---

# 8. INTERLEAVING

Mix older and newer skills.

Do not make a session a single narrow block when interleaving improves retention/transfer.

But do not overwhelm beginners with uncontrolled novelty.

---

# 9. PROMOTION READINESS

Level promotion can consider:
- required competency coverage;
- independent evidence;
- retention;
- transfer;
- oral/listening gate;
- support ceiling;
- critical prerequisite gaps.

Promotion may be withheld for a critical gap while allowing higher-level exposure in stronger skills.

---

# 10. DIAGNOSTIC PLACEMENT

Allow:
- first-run diagnostic;
- returning learner re-check;
- skill-specific diagnostic;
- advanced academic placement.

Store confidence and date/revision.

Diagnostics never delete historical evidence.

---

# 11. STREAK / MOTIVATION

Streak may exist as optional motivation.

It must not:
- grant mastery;
- punish a learner by destroying academic progress;
- become the primary learner model;
- encourage meaningless activity solely to keep a counter alive.

---

# 12. EXPLAINABLE ADAPTATION

The system should be able to explain simply:
- why this review appeared;
- why a skill is weak;
- what evidence is missing;
- why the next activity changed.

Do not expose complex internal math unnecessarily.

---

# 13. COLD START

If there is little evidence:
- prefer robust beginner/diagnostic experiences;
- ask less, observe more;
- avoid false precision;
- increase certainty through varied evidence.

---

# 14. DATA INTEGRITY

Learner events should protect against:
- duplicate submit;
- replay overwriting official attempt;
- clock anomalies;
- content revision mismatch;
- corrupted partial writes;
- sync duplication.

Use idempotency where required.

---

# 15. EXPORT

Learner data should be exportable in a documented, versioned format.

At minimum preserve:
- profile identity;
- evidence;
- derived state or enough data to rebuild it;
- content revision refs;
- review schedule;
- preferences/support settings.

---

# 16. RE06 EXIT GATE

PASS when the same learner evidence can deterministically produce a defensible next-learning decision, survive reload/export-import, and preserve asymmetric skill strengths without a fake single-score mastery model.
