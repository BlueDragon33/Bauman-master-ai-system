# RU08 — AUTHORING · SUBJECT INTEGRATION · ACCEPTANCE · RC READINESS
## Make Russian maintainable, extensible and releasable without rebuilding the platform

Former source responsibility: P12 + P13 + Russian-specific parts of P14 + P15 + P16.

---

# 0. MISSION

Integrate the Russian domain into the shared Bauman platform cleanly.

RU08 is the final Russian-specific module.

It does not rebuild the platform kernel, design system, QA philosophy or production release system.

It proves Russian uses them correctly.

---

# 1. CONSTITUTION ROUTING

Primary:

- C1: Subject Factory, Lesson Factory, content packs, extension/capability registry, import/no-code authoring, versioning, backward compatibility, offline/security;
- C2: shared app shell, lesson/resource layouts, responsive, accessibility, dark mode, interaction states;
- C3: full functional/UX/regression/performance/offline/security/release-candidate QA;
- C4: academic authoring contract, competency/evidence mapping, truthful reports.

Production is executed only through C3 Release Annex.

---

# 2. NO RUSSIAN PLATFORM FORK

Russian must not create a second:

- router;
- auth;
- storage abstraction;
- search system;
- offline framework;
- design system;
- generic resource viewer;
- generic importer;
- generic plugin runtime;
- generic release mechanism.

If a capability is reusable across subjects, promote it to C1-governed platform architecture.

---

# 3. RUSSIAN SUBJECT PACKAGE

Russian-specific package/manifest should register:

- subject identity;
- curriculum/course structure;
- competencies;
- lessons/content;
- required capabilities;
- resource packs;
- assessments/performance tasks;
- offline policy;
- search metadata;
- migration/compatibility metadata.

Core should not know individual Russian lessons.

---

# 4. RUSSIAN CAPABILITIES

Examples that may require providers/extensions rather than Core edits:

- audio playback;
- recording;
- speech recognition;
- pronunciation practice;
- handwriting;
- dialogue/scenario runtime;
- vocabulary/SRS views;
- academic writing workspace;
- AI coaching.

Use registry/capability contracts.

---

# 5. AUTHORING SEMANTICS

Russian authoring must support domain-specific validation such as:

- stress;
- ё/е policy;
- morphology/government refs;
- accepted variants;
- audio/transcript pairing;
- dialogue turns/roles;
- speaking/deep-speaking tasks;
- source/provenance;
- technical terminology;
- assessment alignment;
- research/source-based writing.

Do not make ordinary author edit raw JSON by default.

---

# 6. CONTENT LIFECYCLE

Use shared lifecycle concepts:

draft
→ review
→ approved
→ published
→ superseded/archived.

Published meaning-changing content should create a new revision/version, not silent overwrite.

---

# 7. UI INTEGRATION

Russian uses shared:

- App Shell;
- navigation patterns;
- Lesson/Resource layouts;
- components/tokens;
- loading/empty/error states;
- responsive/mobile patterns;
- accessibility.

Russian may specialize content layout only where language learning truly requires it.

No independent “Russian design language”.

---

# 8. RUSSIAN-SPECIFIC UX

Validate:

- Cyrillic rendering;
- stress display;
- long bilingual text;
- audio controls;
- recording state;
- transcript reveal;
- handwriting canvas;
- dialogue turn state;
- mobile keyboard/input;
- technical/research writing;
- screen-reader alternatives.

C2 remains final visual/interaction authority.

---

# 9. LEGACY MIGRATION

Use strangler/incremental migration.

For each legacy Russian subsystem:

old owner
→ new canonical owner/capability
→ compatibility bridge
→ migration
→ regression
→ retire only after evidence.

Do not mass-rewrite Russian.

---

# 10. OFFLINE / PACKAGING

Russian-specific checks include:

- staged content packs;
- large vocab/dialogue datasets lazy loading;
- audio cache/fallback;
- assessment durability offline;
- planner offline;
- scenario fallback;
- AI optionality;
- service-worker/package parity.

C1/C3 own generic offline platform implementation/testing.

---

# 11. PERFORMANCE

Baseline and guard:

- startup dataset bytes;
- route requests;
- vocab open/search;
- dialogue/scenario load;
- audio/media;
- DOM nodes;
- memory;
- repeated route lifecycle;
- listener/observer leaks.

Do not load full 8000 vocab + all deep dialogues at startup.

---

# 12. SECURITY

Russian-specific attack surfaces include:

- imported JSON/content;
- external media/URL;
- HTML/micro-app resources;
- AI/document input;
- recording/storage;
- dangerous HTML/rendering;
- capability permission bypass.

Use global sandbox/permission/storage contracts.

---

# 13. RUSSIAN ACCEPTANCE MATRIX

Must cover representative journeys:

## Beginner

enter Russian
→ understand next action
→ learn
→ practice
→ review
→ return later.

## Survival

listen/speak
→ handle repair
→ complete real-world scenario.

## University

read/listen assignment
→ clarify
→ complete learning task.

## Technical

read formula/technical text
→ explain concept
→ solve communication task
→ produce report/explanation.

## Research

source reading
→ notes
→ writing
→ presentation
→ Q&A/defense.

## Admin/Author

import/create
→ map academic contract
→ validate
→ preview
→ review
→ publish
→ update/rollback.

---

# 14. RUSSIAN FAILURE MATRIX

Include at least:

- invalid linguistic content;
- broken audio;
- mic denied;
- STT wrong/unavailable;
- malformed learner state;
- duplicate submit;
- offline reload;
- content revision;
- huge vocab backlog;
- dialogue graph defect;
- AI unavailable;
- AI prompt injection;
- long formula/technical text;
- mobile overflow;
- screen reader/keyboard;
- plugin/resource failure;
- old client/package compatibility.

---

# 15. RC READINESS

RU08 may produce Russian RC readiness only when:

- RU02–RU07 required owners PASS/current;
- no unresolved Russian blocker/critical;
- subject package validates;
- compatibility/migration is tested;
- full Russian acceptance passes;
- C1 architecture boundary passes;
- C2 UX/accessibility passes;
- C3 QA/regression passes;
- C4 learning truthfulness passes;
- rollback/compatibility point is known.

---

# 16. PRODUCTION HANDOFF

Output an exact handoff to shared release protocol:

- main/source SHA;
- build artifact identity;
- Russian content snapshot;
- schema/migration identity;
- required config/capabilities;
- known warnings;
- test/evidence index;
- rollback target;
- production smoke journeys.

RU08 stops here.

It does not claim production is live.

---

# 17. PRODUCTION

Invoke:

`prompts/CONSTITUTION.md#c3-release-annex`

using the exact accepted RC.

If production smoke reveals Russian defect:

contain/rollback as required;
return to canonical RU owner;
fix;
regress;
produce new RC.

No production-only architecture fork.

---

# 18. EXIT GATE

RU08 PASS when Russian is:

- academically coherent;
- linguistically trustworthy;
- evidence/mastery safe;
- interaction-safe;
- AI-bounded;
- editable through platform governance;
- visually integrated;
- accessible/responsive;
- offline/failure-aware;
- regression-tested;
- migration-compatible;
- ready to become an immutable RC.

**RU08 COMPLETES THE SUBJECT. THE SHARED RELEASE PROTOCOL PROVES PRODUCTION.**
