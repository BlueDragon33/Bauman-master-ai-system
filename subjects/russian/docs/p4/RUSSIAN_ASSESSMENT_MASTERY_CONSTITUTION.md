# Russian P4 Assessment & Mastery Constitution

Phase: **P4 — Assessment & Mastery Constitution**

## Mission

Establish truthful assessment and mastery that preserves first attempt, measures capability rather than clicks, supports SRS/remediation, and prevents Presentation or AI from granting mastery.

The governing question is:

> **What evidence proves the learner can actually do this?**

Valid learning chain:

`LEARN → RETRIEVE → PRODUCE → TRANSFER → RETAIN`.

## Four-layer separation

### Content
Owns what is taught: objectives, concepts, assessment specification and canonical content references.

### Learning Engine
Owns progression, review scheduling, pass logic and remediation routing.

### Learner State
Stores attempts, evidence, score signals, mastery evidence, due dates and history.

### Presentation
May render, collect input and display feedback. It must not:
- increase mastery because a route opened;
- increase progress because content was viewed/scrolled;
- grant pass because a button was clicked;
- write an authoritative score by itself.

## Completion is not mastery

The system distinguishes:
- visited;
- started;
- completed;
- passed;
- mastered;
- retained.

A completed lesson is not proof of mastery.

## Mastery dimensions

Mastery is not one global percentage. The canonical dimensions are:
- phonetics;
- listening;
- speaking;
- reading;
- writing;
- vocabulary recognition;
- vocabulary production;
- grammar recognition;
- grammar production;
- interaction;
- academic;
- technical;
- research.

Semantic depth is preserved from M0 not exposed through M6 retained after delay.

## Evidence-first rule

Mastery may increase only from evidence such as:
- correct retrieval;
- produced form;
- listening comprehension response;
- spoken response;
- written response;
- performance task;
- delayed successful review.

The following are never mastery evidence by themselves:
- opening a route;
- scrolling;
- playing audio;
- pressing Next;
- viewing an answer.

## First-attempt integrity

Every important assessment preserves:
- first response;
- first timestamp;
- first evaluation;
- mode;
- content revision when relevant.

Retry creates a new `attemptId`; it never overwrites the first attempt.

`assessment-mastery.js` is the canonical attempt/evidence/mastery owner. The legacy `core.js` exam state remains a live UI/compatibility projection.

## Exam and practice policy

Exam:
- no answer reveal before submit;
- preserve first response;
- navigation must not score;
- reload/recovery should preserve the attempt when feasible.

Practice:
- may provide hints;
- may show immediate feedback;
- may explain;
- may route remediation.

Practice and exam histories always retain mode metadata.

## Current 100-question / 80% rule

The current system has a 100-question deep paper and an 80% pass threshold. This remains a **component of an assessment gate**, not total mastery authority.

The current question bank is recognition-heavy: all 1,320 current questions are multiple choice. Therefore a high score cannot alone prove productive speaking, writing, transfer or performance mastery.

## 7 / 14 / 21 / 28-day assessment roles

- Day 7 — early retention / repair.
- Day 14 — mid retention.
- Day 21 — transfer / weakness check.
- Day 28 — longer retention / stage consolidation.

These cycles must not be aliases for repeating the same random bank.

## Speaking truth policy

Browser speech recognition is a signal only.

ASR transcript similarity is **not pronunciation mastery**.

Manual “I spoke it well” confirmation is stored as self-confirmation, not as a fake numeric 100% score.

API failure, microphone denial or unsupported recognition must not mark the learner wrong.

## Listening truth policy

Playing audio is not listening mastery. Listening evidence requires a learner response.

## Remediation policy

`FAILURE → CLASSIFY ERROR → CHECK PREREQUISITE → EXPLAIN/CONTRAST → CONTROLLED REPAIR → RETRIEVE → NEW EXAMPLE → PRODUCE → EXIT CHECK`.

Opening a remediation card never clears a weakness. Resolution requires exit evidence.

## SRS ownership

Two schedulers currently remain valid only because their scopes are explicitly separated:
- `learning-state.js` owns cross-skill review/remediation due routing;
- `vocab-srs.js` owns per-vocabulary-card scheduling.

Neither may key history by display text. Stable canonical content/concept identity is required.

## State safety

Malformed or oversize state must not silently reset or be deleted.

Current P4 runtime behavior:
- malformed/oversize core state is preserved in-place;
- recovery metadata is written separately;
- automatic writes are blocked until explicit recovery decision;
- canonical assessment state also fails closed on malformed JSON.

## AI boundary

AI Mentor may explain, coach, roleplay, generate temporary practice and provide feedback.

It must not:
- write official score directly;
- unlock a stage;
- increase official mastery;
- alter canonical answer keys;
- overwrite first attempt.

## Analytics and dashboard

Analytics must distinguish:
- activity;
- completion;
- attempts;
- correctness;
- retention;
- production evidence;
- performance tasks.

Dashboard values are derived from canonical state. Decorative percentages are not mastery.

## CEFR / TRKI claims

Internal quiz scores do not by themselves prove “A2 mastered” or “B2 achieved”. Formal level claims require evidence appropriate to the competency framework.

## Production effect

None. P4 remains a controlled foundation phase and does not authorize production publish.
