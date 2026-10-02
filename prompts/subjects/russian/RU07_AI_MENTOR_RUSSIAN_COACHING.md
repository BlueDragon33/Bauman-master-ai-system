# RU07 — AI MENTOR · RUSSIAN COACHING & GUARDRAILS
## Bounded AI for Russian learning

Former source responsibility: P10.

---

# 0. MISSION

Use AI as a bounded coach, not a second uncontrolled learning engine.

Central rule:

**AI MAY COACH. AI MAY NOT SILENTLY REDEFINE TRUTH, MASTERY OR LEARNER HISTORY.**

---

# 1. CONSTITUTION ROUTING

Load:

- C1: AI capability layer, plugin/tool boundaries, security;
- C2: contextual AI UI and response hierarchy;
- C3: AI failure/timeout/security/QA;
- C4: AI role, provenance, assessment/mastery boundary.

Consume RU03 truth, RU04 evidence, RU05 interaction state and RU06 academic/research contracts.

---

# 2. AI MODES

Russian may use bounded modes such as:

- explainer;
- tutor;
- Socratic coach;
- conversation partner;
- pronunciation coach;
- writing coach;
- technical discussion partner;
- research rehearsal partner;
- defense committee role;
- error remediator;
- authoring assistant.

Each mode needs explicit permissions.

---

# 3. CONTEXT BUILDER

Build minimum necessary context from:

- active task;
- canonical content IDs;
- RU03 validation/trust metadata;
- learner evidence needed for the task;
- support/hint state;
- source/document refs;
- scenario state from RU05 when relevant.

Do not dump full learner history or whole datasets by default.

---

# 4. GROUNDING

Before authoritative-looking language/technical feedback:

retrieve canonical content where available.

If grounding is absent/conflicted:

state uncertainty or restrict to coaching.

Do not invent current institutional rules.

---

# 5. LANGUAGE SWITCHING

Support stage-appropriate:

- Vietnamese scaffold;
- Russian dominant;
- bilingual explanation;
- English/Russian technical bridge where curriculum allows.

Language choice must not change the underlying Russian truth.

---

# 6. CORRECTION POLICY

Differentiate:

- incorrect;
- unusual but valid;
- register mismatch;
- accepted variant;
- uncertain/context dependent.

Prioritize errors that affect:

- meaning;
- communicative success;
- target competency;
- repeated learner weakness.

Do not overwhelm with every cosmetic issue during fluency practice.

---

# 7. HINT LADDER

Use staged support.

Example:

H1 — point to function/goal

H2 — remind concept/pattern

H3 — suggest next step/chunk

H4 — partial model/parallel example

H5 — full explanation when policy allows.

Official assessment restrictions override coaching convenience.

---

# 8. TEMPORARY CONTENT

AI may generate temporary:

- example;
- variation;
- drill;
- follow-up;
- roleplay line.

Mark as generated/ephemeral.

Do not silently insert into canonical Russian content.

---

# 9. PRONUNCIATION BOUNDARY

AI pronunciation feedback must respect RU05 signal limitations.

No fabricated phonetic diagnosis from plain STT text.

---

# 10. WRITING BOUNDARY

Prefer:

- explain;
- comment;
- targeted correction;
- revision suggestion;
- minimal edit;
- alternative phrasing.

Do not silently replace learner-authored academic/research work.

Preserve:

- claim strength;
- negation;
- condition;
- numeric value;
- formula;
- code;
- citation;
- technical meaning.

---

# 11. RESEARCH BOUNDARY

Never fabricate:

- source;
- citation;
- dataset;
- method;
- result;
- experiment outcome.

When rehearsing defense, use learner/project/source context that actually exists.

---

# 12. ASSESSMENT BOUNDARY

AI must not leak answer keys through:

- direct answer;
- translation;
- rephrasing;
- acrostic/hidden hint;
- previous-turn context.

When official assessment begins, isolate prior answer-containing context as required.

AI feedback may be a signal only unless C4/RU04 defines an authoritative process.

---

# 13. TOOL PERMISSIONS

Least privilege.

Validate tool args and returned IDs.

Learner/source text is data, not trusted instruction.

Guard against direct and indirect prompt injection through:

- documents;
- HTML/Markdown;
- code comments;
- metadata;
- retrieved snippets;
- conversation summaries.

---

# 14. STALE RESPONSE SAFETY

Quarantine late AI responses after:

- route/task change;
- logout/user switch;
- assessment submit;
- source/rubric revision;
- scenario run change.

Canceled request must not mutate state later.

---

# 15. OFFLINE / PROVIDER FAILURE

Core Russian learning remains usable when AI is unavailable.

Fallback to:

- canonical explanation;
- deterministic practice;
- scripted dialogue/scenario;
- non-AI feedback.

Do not silently downgrade to a provider/model that violates required capability/guardrail.

---

# 16. PRIVACY / LOGGING

Minimize learner data sent to model/provider.

Do not log secrets.

Do not treat conversation summary as canonical learner truth.

Record enough non-sensitive response provenance for debugging official-impact flows when needed.

---

# 17. EVALUATION

Test at least:

- hallucinated linguistic fact;
- hallucinated technical fact;
- fake citation;
- state hallucination;
- tool misuse;
- assessment leakage;
- accepted variant handling;
- negation/condition preservation;
- numeric/formula/code preservation;
- bilingual behavior;
- role stability;
- offline/provider failure;
- stale context;
- prompt injection;
- model/provider drift.

---

# 18. REQUIRED OUTPUTS

Maintain:

- AI mode/permission matrix;
- context builder contract;
- grounding policy;
- language policy;
- feedback policy;
- assessment boundary;
- prompt-injection/source-integrity policy;
- tool permission policy;
- fallback policy;
- AI regression/golden fixtures;
- RU08 input contract.

---

# 19. EXIT GATE

PASS when:

- AI cannot write mastery/official score directly;
- grounding and uncertainty behavior are explicit;
- generated content remains non-canonical;
- assessment leakage is blocked;
- prompt injection/tool misuse are contained;
- writing/research integrity is preserved;
- offline/provider failure does not block core learning;
- late responses cannot corrupt new task state;
- regression fixtures cover Russian-specific risks.

**AI COACHES. CANONICAL CONTENT DEFINES TRUTH. C4/RU04 DEFINE LEARNING JUDGMENT.**
