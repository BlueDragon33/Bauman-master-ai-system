# P12 — AUTHORING · CONTENT GOVERNANCE · EDITOR WORKFLOW CONSTITUTION
## NO-CODE CONTENT OPERATIONS · SCHEMA-AWARE EDITING · REVIEW · PROVENANCE · PREVIEW · IMPACT · ROLLBACK

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/russian/`

Execution mode:

**AUTONOMOUS · NO-CODE-FIRST · CANONICAL-OWNER-AWARE · SCHEMA-AWARE · REVIEWABLE · AUDITABLE · ROLLBACK-SAFE · LARGE-DATA-READY · TOKEN-EFFICIENT**

---

# P12 CHANGELOG

- 2026-09-30 — Full deep P12 constitution created.
- 2026-09-30 — Final hardening: reviewer conflict/quorum, permission drift, content freeze, emergency patching, source-of-truth drift, audit integrity, import quarantine, agent/API authoring and snapshot reproducibility.

---

# 0. MISSION

P12 builds the sustainable maintenance layer for the Russian learning system.

Its goal is:

> allow future content to be created, enriched, corrected, reviewed, previewed, migrated and activated without routine code surgery and without breaking canonical ownership.

P12 turns content maintenance from:

“edit random JSON/code manually”

into:

`DRAFT`
→ `VALIDATE`
→ `REVIEW`
→ `PREVIEW`
→ `IMPACT ANALYSIS`
→ `APPROVE`
→ `ACTIVATE`
→ `MONITOR`
→ `ROLLBACK/DEPRECATE`.

---

# 1. P12 DEPENDENCIES

P12 consumes:

### P0
- change classes;
- evidence;
- rollback;
- merge/release rules.

### P1
- actual files/owners/routes;
- generated vs source data.

### P2
- curriculum structure;
- lesson/module/unit semantics.

### P3
- schemas;
- canonical owner registry;
- stable IDs;
- graph relations;
- migrations.

### P4
- assessment/mast ery boundaries;
- first-attempt integrity;
- official scoring data.

### P5
- personalization metadata;
- planner ownership.

### P6
- media/audio/speaking content contracts.

### P7
- linguistic authority;
- provenance;
- validation;
- generated candidate lifecycle.

### P8
- technical concept/domain semantics.

### P9
- source-based writing/research semantics.

### P10
- AI authoring candidate rules;
- AI permissions.

### P11
- scenario/state/role/world authoring model.

P12 must not invent alternate content semantics.

---

# 2. P12 OWNERSHIP

P12 owns:

- authoring workflow;
- content lifecycle;
- author roles/permissions;
- schema-aware editor semantics;
- draft storage;
- review queue;
- validation orchestration;
- provenance entry;
- source attachment/reference workflow;
- content diff;
- semantic diff;
- impact analysis;
- dependency visualization semantics;
- preview/sandbox;
- staged activation;
- bulk import/export;
- duplicate detection workflow;
- merge/split/deprecate workflow;
- alias/migration authoring;
- concurrent editing/conflict resolution;
- audit log;
- rollback/restore content workflow;
- emergency disable;
- authoring AI integration;
- editor search/filter;
- content health/governance dashboards semantics.

P12 does NOT own:

- linguistic truth itself;
- technical truth;
- learner mastery;
- SRS;
- scenario runtime;
- AI provider;
- learner-facing navigation;
- production deployment.

---

# 3. CENTRAL RULE

> **NO AUTHORING ACTION MAY BYPASS CANONICAL OWNERSHIP.**

The editor must know:

- entity type;
- canonical owner;
- schema;
- references;
- downstream impact;
- validation requirements;
- activation rules.

No generic “edit any JSON” textbox as primary workflow.

---

# 4. NO-CODE-FIRST

Routine content operations should not require editing application code:

- add vocab;
- add phrase;
- edit grammar explanation;
- add lesson unit;
- add listening item;
- add speaking task;
- add dialogue;
- add scenario;
- add technical concept;
- add assessment item;
- deprecate outdated item.

Code changes remain necessary only for:

- new entity behavior;
- new schema capability;
- engine feature;
- migration logic not representable declaratively.

---

# 5. AUTHORING ≠ RUNTIME STATE

Editor operates on content/config.

It must never directly edit:

- learner mastery;
- attempt history;
- SRS queues;
- official scores;

unless a separate authorized admin state-repair tool exists.

Keep content administration distinct from learner data administration.

---

# 6. CONTENT LIFECYCLE

Recommended lifecycle:

`DRAFT`

`READY_FOR_VALIDATION`

`VALIDATION_FAILED`

`READY_FOR_REVIEW`

`CHANGES_REQUESTED`

`APPROVED`

`STAGED`

`ACTIVE`

`DEPRECATED`

`RETIRED`

`BLOCKED`.

Not every entity needs every intermediate status in storage.

But semantic lifecycle must exist.

---

# 7. DRAFT

Draft may be incomplete.

It can:

- fail schema partially;
- reference candidate entities;
- contain notes.

Draft cannot appear in production learner path by default.

---

# 8. READY_FOR_VALIDATION

Minimum fields present.

Automated validators can run.

---

# 9. VALIDATION_FAILED

Findings attached.

Author can repair.

Do not silently auto-activate after validator pass.

---

# 10. READY_FOR_REVIEW

Structural + automated checks pass.

Human/curated/domain review required according to risk.

---

# 11. APPROVED

Approved means content passed required reviewers.

It still may require preview/build/staging before ACTIVE.

---

# 12. STAGED

Staged content available to:

- preview;
- test;
- QA;
- internal users.

No official learner exposure unless feature/staging policy explicitly allows.

---

# 13. ACTIVE

Canonical production-eligible content.

Activation must be atomic enough to avoid half-updated dependency state.

---

# 14. DEPRECATED

No new recommendation/use by default.

Existing references/history remain resolvable.

---

# 15. RETIRED

Removed from active runtime package when safe.

Historical alias/state references remain supported as required.

---

# 16. BLOCKED

Known unsafe/invalid content.

Should not activate.

---

# 17. ENTITY RISK TIERS

Use P7/P10 concepts to classify:

`LOW`

`MEDIUM`

`HIGH`

`CRITICAL`.

Examples:

LOW:
description typo.

HIGH:
technical definition.

CRITICAL:
assessment answer key / canonical grammar rule / state-sensitive ID change.

Review requirements scale with risk.

---

# 18. ROLE MODEL

Potential authoring roles:

`VIEWER`

`CONTRIBUTOR`

`EDITOR`

`REVIEWER_LINGUISTIC`

`REVIEWER_DOMAIN`

`ASSESSMENT_REVIEWER`

`APPROVER`

`ADMIN`.

Exact roles depend on project needs.

Do not give all users ADMIN.

---

# 19. LEAST PRIVILEGE

Contributor can draft.

Reviewer can review assigned scope.

Approver activates according to policy.

No role should gain unrelated production/system permissions.

---

# 20. ROLE SCOPE

Permissions may be limited by:

- entity type;
- domain;
- stage;
- action;
- environment.

Example:

technical reviewer can review Control terms

without editing mastery or deploy config.

---

# 21. SELF-APPROVAL POLICY

High-risk content should not be both authored and final-approved by same actor/process unless explicitly justified.

AI-generated candidate cannot self-approve.

---

# 22. AUTOMATION APPROVAL BOUNDARY

Trusted deterministic validator may auto-approve only low-risk mechanical changes if governance permits.

Examples:

whitespace normalization.

Not:

stress;
translation;
answer key;
technical definition.

---

# 23. AUTHOR IDENTITY

Every meaningful change should record:

- actor;
- time;
- action;
- entity;
- revision.

Do not need personally identifying data beyond project identity needs.

---

# 24. AUDIT LOG

Audit log records:

- create;
- edit;
- validate;
- review;
- approve;
- activate;
- deprecate;
- rollback;
- import;
- bulk action.

Audit log is append-oriented.

Do not rewrite history casually.

---

# 25. CONTENT REVISION

Each canonical entity should support revision semantics.

Minor field edit:

same ID + revision.

Semantic identity change:

new entity/sense/ID as required by P3.

---

# 26. REVISION COMMENT

Meaningful change should include concise reason:

- typo;
- linguistic correction;
- technical update;
- source update;
- scenario branch change;
- assessment repair.

Avoid meaningless “update”.

---

# 27. DIFF

Editor should show field-level diff.

For rich text:

text diff.

For arrays/relations:

added/removed refs.

For state graph:

nodes/edges changed.

---

# 28. SEMANTIC DIFF

Raw diff is insufficient for high-risk changes.

Semantic categories:

- meaning;
- stress;
- grammar;
- terminology;
- answer key;
- objective;
- prerequisite;
- scenario topology;
- world fact;
- media;
- provenance;
- status.

---

# 29. IMPACT ANALYSIS

Before approval/activation, show dependents:

entity

→ lessons

→ tasks

→ assessments

→ scenarios

→ indexes

→ packs

→ learner state identity if relevant.

---

# 30. IMPACT SEVERITY

Classify:

`LOCAL`

`MULTI-LESSON`

`STAGE-WIDE`

`ASSESSMENT-AFFECTING`

`STATE-AFFECTING`

`ARCHITECTURAL`.

Review gate scales accordingly.

---

# 31. DEPENDENCY GRAPH

P12 editor consumes P3 graph.

Do not maintain a second manually curated dependency map.

---

# 32. UNKNOWN DEPENDENCY

If dependency graph incomplete:

do not claim “safe change”.

Mark impact uncertainty.

---

# 33. CONTENT LOCK

During high-risk review/activation:

entity may be locked against conflicting edits.

Avoid permanent pessimistic locking for normal authoring.

---

# 34. OPTIMISTIC CONCURRENCY

Default editor can use:

revision number / ETag equivalent.

On save conflict:

do not overwrite newer revision silently.

---

# 35. CONFLICT DETECTION

If base revision changed:

show:

- your draft;
- latest;
- diff.

Require merge/rebase decision.

---

# 36. FIELD-LEVEL MERGE

Safe when edits touch independent fields.

Do not auto-merge semantic conflicts.

---

# 37. ARRAY MERGE

References/tags may merge if non-conflicting.

Ordered curriculum arrays require special care.

---

# 38. RICH TEXT MERGE

Do not blindly auto-merge overlapping text edits.

---

# 39. SCENARIO GRAPH MERGE

State-machine changes require graph-aware conflict handling.

Node IDs stable.

Conflicting edge changes require review.

---

# 40. AUTOSAVE

Draft editor may autosave.

Autosave:

does not mean approved;
does not activate.

---

# 41. DRAFT RECOVERY

Browser reload/crash should recover draft where practical.

Do not overwrite canonical active content until explicit save/submit.

---

# 42. LOCAL DRAFT VS SERVER/REPO DRAFT

If architecture supports both:

define owner/sync.

Avoid two divergent draft truths.

---

# 43. DRAFT EXPIRY

Do not delete old draft silently if it contains meaningful work.

Archive or allow cleanup policy.

---

# 44. EDITOR FORM GENERATION

Editor UI should be schema-driven where possible:

- field type;
- enum;
- required;
- refs;
- validation;
- help text.

Avoid hand-coding separate editor for every simple entity.

---

# 45. CUSTOM EDITOR COMPONENTS

Use custom editor for complex types:

- stress;
- morphology;
- state graph;
- rubric;
- formula;
- scenario world;
- media timeline.

Schema-driven base + specialized components.

---

# 46. REQUIRED FIELD

Show required clearly.

Do not require meaningless empty data.

---

# 47. OPTIONAL FIELD

Hide advanced optional fields progressively.

Avoid overwhelming author with 80 fields.

---

# 48. FIELD HELP

Help text should explain semantic meaning.

Not just repeat field name.

---

# 49. ENUM

Use canonical enum source.

Do not duplicate enum lists in UI code.

---

# 50. REFERENCE PICKER

Entity references should use:

search by ID/title/lemma/domain.

Store ID, not title.

---

# 51. REFERENCE VALIDATION

Cannot save/activate dangling required ref.

Draft may temporarily allow unresolved candidate refs with explicit status.

---

# 52. REFERENCE PREVIEW

Author can inspect referenced entity without losing draft.

---

# 53. BACKLINKS

Show where entity is used.

Critical for safe edits.

---

# 54. CIRCULAR DEPENDENCY

Prevent invalid prerequisite cycles.

Graph validator.

---

# 55. ORDERING

For ordered curriculum:

drag/order editor may be used.

Persist stable IDs + explicit sequence.

Do not derive identity from array index.

---

# 56. BULK REORDER

Show impact before activation.

---

# 57. VOCAB EDITOR

Fields may include:

- lemma;
- stress;
- POS;
- senses;
- morphology;
- government;
- aspect;
- collocations;
- domain;
- level;
- provenance.

Do not expose raw 50-field JSON as primary UX if structured editor is feasible.

---

# 58. SENSE EDITOR

Each sense:

- stable sense ID;
- meaning;
- domain;
- register;
- examples.

Moving meaning between senses may affect references.

Impact analysis required.

---

# 59. STRESS EDITOR

Must prevent impossible stress position.

High-risk change requires P7 validation.

---

# 60. MORPHOLOGY EDITOR

Structured fields.

Do not allow free-form paradigm text as only source.

---

# 61. GOVERNMENT EDITOR

Structured pattern builder.

Head + preposition + case + sense.

---

# 62. ASPECT EDITOR

Link reciprocal relation with validation.

Do not force pair.

---

# 63. COLLOCATION EDITOR

Reference lexical IDs.

Add register/domain.

---

# 64. GRAMMAR EDITOR

Fields:

- function;
- form;
- patterns;
- examples;
- contrasts;
- prerequisites;
- common errors;
- tasks.

---

# 65. PHONETIC EDITOR

Fields:

- target;
- contrast;
- stress/audio;
- error patterns;
- examples.

P6 media refs.

---

# 66. LESSON/MODULE EDITOR

Structured hierarchy:

module

→ unit

→ micro-lesson

→ objective

→ refs.

Do not embed copied vocab/grammar.

---

# 67. OBJECTIVE EDITOR

Objective maps:

verb;
skill;
concept;
criterion;
context.

Assessment alignment visible.

---

# 68. ACTIVITY EDITOR

Support:

input;
practice;
retrieval;
production;
assessment;
remediation.

---

# 69. LISTENING EDITOR

Fields:

- audio;
- transcript;
- reveal policy;
- target concepts;
- tasks;
- source.

P6 contracts.

---

# 70. SPEAKING EDITOR

Fields: