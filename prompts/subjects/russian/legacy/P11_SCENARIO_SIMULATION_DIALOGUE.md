# P11 — SCENARIO · SIMULATION · DIALOGUE EXPERIENCE CONSTITUTION
## STATE MACHINES · WORLD FACTS · BRANCHING · DETERMINISTIC/AI HYBRID · TRANSFER · PERFORMANCE

Repository: `BlueDragon33/Bauman-master-ai-system`

Primary scope: `subjects/russian/`

Primary curriculum targets:

- R02–R06 survival interaction.
- R07–R11 classroom/university operations.
- R13–R18 technical/lab/problem-solving interaction.
- R19–R22 seminar/research interaction.
- R23–R26 presentation/defense interaction.

Execution mode:

**AUTONOMOUS · STATEFUL · DETERMINISTIC-FIRST · AI-BOUNDED · TRANSFER-ORIENTED · EVIDENCE-FIRST · OFFLINE-FALLBACK · TOKEN-EFFICIENT**

---

# P11 CHANGELOG

- 2026-09-30 — Full deep P11 constitution created.
- 2026-09-30 — Final hardening: event/state forensic separation, role knowledge matrix, reusable components, dependency/impact analysis, author preview, branch harness, analytics privacy, revision freshness and incident handling.

---

# 0. MISSION

P11 turns isolated skills into realistic multi-step communication.

The goal is not:

“chat with AI”.

The goal is:

> learner can complete meaningful Russian-language tasks inside controlled realistic scenarios while preserving state, objectives, evidence, difficulty and recovery.

P11 builds integrated practice for:

- arrival;
- transport;
- dorm;
- shopping;
- bank/SIM;
- administration;
- classroom;
- project work;
- lab;
- troubleshooting;
- seminar;
- research meeting;
- presentation;
- defense.

---

# 1. FOUNDATION DEPENDENCIES

P11 consumes:

### P2
- curriculum;
- stage goals;
- R01–R26 progression.

### P3
- dialogue/scenario schemas;
- stable IDs;
- content graph.

### P4
- performance evidence;
- official assessment boundary;
- mastery ownership.

### P5
- adaptive difficulty;
- weakness routing;
- scenario recommendation.

### P6
- audio;
- recording;
- speech recognition;
- dialogue runtime primitives;
- Deep Speaking.

### P7
- validated Russian;
- register;
- politeness;
- administrative language.

### P8
- technical/academic concepts;
- lab/problem-solving language.

### P9
- research/presentation/defense language.

### P10
- AI role contract;
- context builder;
- permission matrix;
- dynamic-turn interface;
- prompt injection guardrails.

P11 must not recreate these engines.

---

# 2. P11 OWNERSHIP

P11 owns:

- scenario topology;
- scenario state machine;
- world facts;
- roles;
- objectives;
- subgoals;
- branches;
- events;
- turn expectations;
- completion criteria;
- fail/recovery paths;
- deterministic dialogue logic;
- AI-assisted branch contract;
- scenario difficulty;
- scenario variation;
- scenario evidence specification;
- scenario replay;
- scenario content packs;
- scenario QA;
- scenario authoring semantics for P12.

P11 does NOT own:

- canonical linguistic truth;
- mastery;
- SRS;
- speech recognition;
- AI context builder;
- AI provider;
- official scoring;
- UI layout;
- production deployment.

---

# 3. SCENARIO ≠ DIALOGUE SCRIPT

A dialogue script is:

a sequence of lines.

A scenario is:

- situation;
- goal;
- world state;
- roles;
- constraints;
- available actions;
- information gaps;
- unexpected events;
- completion conditions;
- recovery paths.

P11 must move beyond static script playback.

---

# 4. SCENARIO MODEL

Each scenario should conceptually define:

- scenario ID;
- title;
- stage;
- level;
- domain;
- purpose;
- learner role;
- counterpart roles;
- world facts;
- learner-known facts;
- hidden facts;
- objectives;
- prerequisites;
- initial state;
- state variables;
- allowed events;
- turn policy;
- branch graph/state machine;
- success conditions;
- partial success;
- fail conditions;
- recovery;
- evidence;
- difficulty;
- variation;
- offline behavior;
- provenance.

Do not require every field for trivial micro-scenario.

---

# 5. WORLD FACTS

World facts are scenario truth.

Examples:

- room number;
- train time;
- price;
- missing document;
- assignment deadline;
- sensor fault;
- experimental result.

They must remain internally consistent.

AI cannot change them unless event contract allows.

---

# 6. WORLD FACT CLASSES

Possible:

`STATIC`

`MUTABLE`

`HIDDEN`

`LEARNER_DISCOVERABLE`

`DERIVED`.

Do not store every derived display value as separate truth.

---

# 7. LEARNER-KNOWN VS HIDDEN

A realistic interaction often depends on information asymmetry.

Example:

clerk knows a document is missing.

learner discovers it through dialogue.

Do not expose hidden fact in prompt/UI before intended.

---

# 8. SCENARIO OBJECTIVE

Objective should be functional:

- register at dorm;
- buy correct ticket;
- ask lecturer to clarify;
- report lab fault;
- explain result;
- defend method.

Not:

“use 5 Genitive forms”.

Grammar can be hidden pedagogical target.

---

# 9. SUBGOALS

Complex scenario can include:

1. identify problem;
2. ask information;
3. provide data;
4. confirm understanding;
5. resolve issue.

Subgoals support partial evidence.

---

# 10. PEDAGOGICAL TARGETS

Each scenario may map:

- language functions;
- grammar;
- vocabulary;
- listening;
- speaking;
- interaction;
- technical concepts;
- repair skills.

Do not turn scenario into checklist spoken unnaturally.

---

# 11. STATE MACHINE

Scenario progression should use explicit state.

Example:

`START`

→ `GREETING`

→ `IDENTIFY_NEED`

→ `CHECK_DOCUMENTS`

→ `MISSING_DOCUMENT`

→ `CLARIFY`

→ `RESOLUTION`

→ `CLOSE`.

State may branch.

---

# 12. STATE TRANSITION

Transition requires:

- current state;
- learner action/meaning;
- event;
- guard conditions;
- next state.

Do not transition purely because learner clicked Next if scenario objective is interaction.

---

# 13. SEMANTIC ACTION

Learner action can be interpreted as:

- asks location;
- provides passport;
- requests repetition;
- rejects option;
- explains result.

Do not bind scenario only to exact sentence text.

---

# 14. INTENT VS WORDING

Scenario engine should separate:

`WHAT learner is trying to do`

from:

`HOW well Russian expresses it`.

P4 evaluates language evidence.

P11 advances scenario when intent/action is sufficiently satisfied according to contract.

---

# 15. DETERMINISTIC-FIRST

Core scenario logic should be deterministic when possible.

Use deterministic engine for:

- world facts;
- branches;
- success conditions;
- item availability;
- events;
- state transitions.

Use AI for:

- natural turn phrasing;
- paraphrase;
- unexpected but bounded response;
- open-ended roleplay.

---

# 16. AI DOES NOT OWN WORLD STATE

AI cannot decide:

“passport accepted”

if deterministic state says missing visa.

AI response must be conditioned on world state.

---

# 17. AI TURN CONTRACT

P10 AI role receives:

- role;
- current state;
- allowed world facts;
- learner-visible facts;
- target function;
- difficulty;
- forbidden revelations;
- allowed event choices.

AI returns:

- role utterance;
- optional semantic action;
- optional emotion/register metadata if needed.

Engine validates before applying state change.

---

# 18. INVALID AI TURN

If AI turn contradicts state:

reject/regenerate/fallback.

Do not mutate world to fit hallucinated turn.

---

# 19. DETERMINISTIC FALLBACK

Every core scenario should have usable deterministic fallback.

AI outage must not make scenario impossible.

---

# 20. HYBRID SCENARIO

Recommended architecture:

deterministic state machine

+ validated phrase/dialogue pool

+ optional AI variation.

This gives naturalness without losing control.

---

# 21. BRANCH TYPES

Branches may arise from:

- learner choice;
- missing information;
- error;
- successful clarification;
- unexpected event;
- difficulty variant;
- technical outcome.

Do not create random branches without pedagogical purpose.

---

# 22. BRANCH DEPTH

Beginner scenarios:

shallow branches.

Advanced scenarios:

deeper branching.

Avoid combinatorial explosion.

---

# 23. BRANCH MERGE

Different paths can converge when state meaning becomes same.

Do not duplicate whole downstream tree unnecessarily.

---

# 24. OPTIONAL BRANCH

Optional exploration should not block core completion.

---

# 25. CRITICAL BRANCH

Some branches test essential skill:

e.g. missing document / clarification.

Mark as critical for scenario target.

---

# 26. FAILURE IS NOT ALWAYS END

Learner may:

- misunderstand;
- choose wrong line;
- provide incomplete info.

Scenario should often offer recovery.

---

# 27. RECOVERY PATH

Possible:

counterpart asks again;

learner requests repetition;

hint;

rephrase;

return to previous subgoal.

Do not instantly reset entire scene.

---

# 28. HARD FAIL

Use only when logically unavoidable:

- learner ends interaction;
- deadline passes in timed simulation;
- unsafe/invalid technical action if scenario models it;
- official assessment rule.

Even then provide post-scene feedback.

---

# 29. PARTIAL SUCCESS

Scenario can complete with unresolved minor issue.

Store:

which subgoals succeeded.

Do not force binary success for complex real-world task.

---

# 30. SUCCESS CONDITION

Success should reflect functional goal.

Examples:

- ticket purchased correctly;
- dorm registration issue understood/resolved;
- lecturer clarification obtained;
- technical error reported clearly;
- method defended.

Not simply number of correct sentences.

---

# 31. LANGUAGE QUALITY VS TASK SUCCESS

A learner may complete task with imperfect Russian.

P11 records task success.

P4 language rubric records quality.

Keep separate.

---

# 32. REPAIR ABILITY

Scenario should reward functional repair:

- repeat;
- clarify;
- confirm;
- rephrase.

Repair is not failure.

---

# 33. TIME PRESSURE

Optional difficulty element.

Beginner:
usually low.

Defense:
may be higher.

Time pressure must not be default everywhere.

---

# 34. INFORMATION PRESSURE

Advanced scenarios may include:

- incomplete information;
- conflicting info;
- last-minute change.

Use carefully.

---

# 35. SOCIAL PRESSURE

Counterpart can be:

busy;
formal;
skeptical.

Do not use humiliation/aggression as default difficulty.

---

# 36. REGISTER SHIFT

Advanced learner may need switch:

classmate informal

→ teacher formal.

Scenario should model register explicitly.

---

# 37. ROLE MODEL

Each role defines:

- identity;
- purpose;
- knowledge;
- attitude/register;
- permissions;
- goals;
- forbidden behavior.

Do not define role as just a name.

---

# 38. LEARNER ROLE

Examples:

- student;
- passenger;
- dorm resident;
- customer;
- lab student;
- project member;
- presenter;
- researcher.

Role sets realistic actions.

---

# 39. COUNTERPART ROLE

Examples:

- border officer;
- dorm administrator;
- cashier;
- lecturer;
- lab assistant;
- teammate;
- supervisor;
- committee member.

Use validated institutional realism.

---

# 40. ROLE CONSISTENCY

Counterpart must not know facts outside role/world without event.

---

# 41. ROLE OBJECTIVE

Counterpart may have own objective:

clerk needs correct document.

teacher needs learner to clarify method.

This creates realistic dialogue.

---

# 42. ROLE ATTITUDE

Possible controlled metadata:

`NEUTRAL`

`HELPFUL`

`BUSY`

`FORMAL`

`SKEPTICAL`

`STRICT`.

Avoid stereotypes.

---

# 43. ROLE LANGUAGE LEVEL

AI/deterministic turns should match learner level while remaining plausible.

Do not make real clerk speak A1 textbook Russian forever; use scaffolding/repair.

---

# 44. SPEECH RATE

Scenario audio may vary:

slow pedagogical;

normal;

fast.

P6 owns audio.

P11 selects appropriate difficulty.

---

# 45. ACCENT / VOICE VARIATION

Only use if actual audio support exists.

Do not fabricate accent metadata.

---

# 46. SCENARIO DIFFICULTY VECTOR

Difficulty can include:

- language complexity;
- speech speed;
- vocabulary novelty;
- branch depth;
- information gap;
- time pressure;
- support level;
- unexpectedness;
- technical complexity.

Do not reduce to one magic number internally unless derived transparently.

---

# 47. DIFFICULTY PRESETS

Examples:

`GUIDED`

`STANDARD`

`TRANSFER`

`PRESSURE`.

P5 may choose.

---

# 48. GUIDED MODE

Provides:

- phrase support;
- visible objective;
- fewer branches;
- slower audio.

---

# 49. STANDARD MODE

Reduced support.

Natural variation.

---

# 50. TRANSFER MODE

Novel details.

Less predictable wording.

Same competencies.

---

# 51. PRESSURE MODE

Advanced:

- limited prep;
- unexpected follow-up;
- stricter timing.

Use for seminar/defense, not survival beginner by default.

---

# 52. SCAFFOLDING

Possible supports:

- phrase bank;
- keywords;
- translation;
- transcript;
- hints;
- role objective;
- visible state goal.

P5 controls fading.

---

# 53. SUPPORT LOGGING

If support affects official evidence:

record usage through P4-compatible metadata.

---

# 54. PHRASE BANK

Phrase bank references canonical phrases.

Do not copy local truth into scenario.

---

# 55. HINTS

Hints should point to:

function or concept.

Do not reveal entire response immediately unless practice policy allows.

---

# 56. PROMPT CARD

Scenario may show:

- where;
- who;
- goal;
- known facts.

Do not expose hidden branch facts.

---

# 57. TURN TYPES

Possible:

`SYSTEM_EVENT`

`COUNTERPART_SPEECH`

`LEARNER_SPEECH`

`LEARNER_ACTION`

`CHOICE`

`DOCUMENT/OBJECT`

`FEEDBACK`

`STATE_UPDATE`.

---

# 58. NON-VERBAL ACTION

Some scenarios require:

- show document;
- select ticket;
- enter value;
- choose file.

Language can accompany action.

Do not force all interaction into speech.

---

# 59. OBJECTS

Scenario object may be:

- passport;
- visa;
- ticket;
- form;
- schedule;
- lab data;
- graph;
- code snippet;
- slide.

Objects need stable IDs.

---

# 60. OBJECT STATE

Example:

document:

`PRESENT`

`MISSING`

`INVALID`

`EXPIRED` if scenario uses it.

Do not model unnecessary complexity.

---

# 61. DOCUMENT SCENARIOS

Administrative scenario should use realistic document sequence.
P7 validates language.

Do not provide legal advice beyond scenario training.

---

# 62. NUMERIC FACTS

Prices/times/room numbers must remain consistent across turns.

Use structured world variables.

---

# 63. DATE/TIME EVENTS

Scenario may change:

room/time/deadline.

Event engine updates state.

Do not let AI invent conflicting time.

---

# 64. RANDOMIZATION

Randomize only within validated ranges.

Use seed in official/reproducible tests.

---

# 65. RANDOM FACT CONSISTENCY

If random room = 318:

all later turns use 318.

World state owns.

---

# 66. SCENARIO REPLAY

Learner can replay with:

same seed

or:

new variation.

Official assessment policy decides.

---

# 67. REPLAY ≠ FIRST ATTEMPT OVERWRITE

P4 preserves attempt history.

---

# 68. VARIATION TYPES

- names;
- numbers;
- lexical paraphrase;
- branch event;
- role attitude;
- technical parameters;
- source/figure.

Variation must keep objective stable unless scenario variant explicitly changes it.

---

# 69. ANTI-MEMORIZATION

After multiple replays:

vary wording/facts/branch.

Do not let learner pass by memorizing fixed transcript.

---

# 70. SCENARIO FAMILY

A scenario family shares:

objective + competencies

with multiple variants.

Example:

`DORM_REGISTRATION_FAMILY`.

---

# 71. SCENARIO INSTANCE

An instance has:

- seed;
- world facts;
- variation;
- attempt ID.

---

# 72. SURVIVAL SCENARIO FAMILY

Core families:

- airport/arrival;
- transport;
- directions;
- dorm;
- food/shop;
- SIM;
- bank;
- pharmacy/basic communication;
- administration.

---

# 73. AIRPORT / ARRIVAL

Objectives may include:

- understand instruction;
- answer identity/travel question;
- ask clarification;
- locate transport.

Avoid simulating legal consequences.

Focus language.

---

# 74. TRANSPORT

Tasks:

- buy ticket;
- ask platform;
- transfer;
- understand announcement;
- handle wrong route.

---

# 75. DIRECTIONS

Use:

map/landmark

+ oral instruction.

P13 may provide visual map UI.

---

# 76. DORM

Tasks:

- registration;
- room issue;
- internet;
- key/access;
- payment/info;
- maintenance request.

---

# 77. SHOP / CAFETERIA

Tasks:

- ask item;
- quantity;
- price;
- payment;
- substitution.

---

# 78. SIM / MOBILE

Tasks:

- tariff;
- data;
- activation;
- identity/document request;
- problem.

Keep technical/legal details generic unless validated.

---

# 79. BANK / ATM

Language:

- card;
- transfer;
- cash;
- account issue.

Do not teach financial advice.

---

# 80. PHARMACY / BASIC HEALTH COMMUNICATION

Focus:

- describe simple symptom;
- ask where/what;
- understand basic directions.

Do not diagnose.

---

# 81. ADMINISTRATION

Tasks:

- forms;
- registration;
- missing document;
- office;
- appointment;
- correction.

Institution-specific facts require validation.

---

# 82. CLASSROOM SCENARIO FAMILY

- enter class;
- understand instruction;
- ask repeat;
- ask task;
- homework;
- deadline;
- answer teacher;
- group discussion.

---

# 83. LECTURE INTERRUPTION

Learner asks clarification politely without derailing lecture.

---

# 84. AFTER-CLASS QUESTION

Learner asks lecturer about:

- task;
- concept;
- deadline.

---

# 85. GROUP WORK

Roles:

- coordinator;
- teammate;
- presenter.

Objectives:

- assign task;
- report progress;
- clarify problem.

---

# 86. TECHNICAL LAB FAMILY

- setup;
- configure;
- measure;
- error;
- compare result;
- report issue;
- explain conclusion.

---

# 87. LAB STATE

World facts can include:

- parameter values;
- sensor state;
- expected output;
- observed output;
- error condition.

P8 validates technical truth.

---

# 88. TROUBLESHOOTING FAMILY

Structure:

symptom

→ reproduce

→ gather info

→ hypothesize

→ test

→ fix

→ verify.

Language focus:

technical problem solving.

---

# 89. SOFTWARE DEBUGGING SCENARIO

World:

code/log/error.

Learner:

describe bug

→ clarify

→ propose test.

Do not execute destructive code.

---

# 90. DATABASE TROUBLESHOOTING

World:

schema/query/result.

Learner explains mismatch.

---

# 91. NETWORK TROUBLESHOOTING

World:

connection symptoms.

Learner asks/checks.

Keep safe/non-operational if scenario doesn't need real network commands.

---

# 92. CONTROL/LAB SCENARIO

World:

signal/controller/sensor condition.

Learner explains behavior.

P8 owns technical truth.

---

# 93. PROJECT MEETING FAMILY

Tasks:

- progress update;
- blocker;
- task allocation;
- deadline;
- decision;
- disagreement.

---

# 94. PROJECT STATUS

World state:

tasks;

owners;

deadlines;

blockers.

Learner communication changes project state only through allowed scenario actions.

---

# 95. SEMINAR FAMILY

Learner:

- presents claim;
- answers question;
- asks question;
- disagrees politely;
- defends evidence.

---

# 96. RESEARCH MEETING FAMILY

Learner discusses with supervisor:

- objective;
- method;
- result;
- limitation;
- next step.

P9 research truth.

---

# 97. LITERATURE DISCUSSION

World includes source claims.

Learner compares sources.

AI cannot invent new citations.

---

# 98. EXPERIMENT REVIEW

Learner explains:

- setup;
- unexpected result;
- possible causes;
- next experiment.

---

# 99. NIR REHEARSAL

Scenario:

mini presentation

→ reviewer questions

→ learner defense

→ feedback.

---

# 100. VKR DEFENSE FAMILY

Roles:

- chair;
- reviewer;
- committee member.

World:

project package;
slides;
claims;
results;
limitations.

---

# 101. DEFENSE WORLD FACTS

AI cannot alter learner/project facts.

Question must derive from:

- objective;
- method;
- result;
- limitation;
- source/evidence.

---

# 102. DEFENSE QUESTION SEQUENCE

Possible:

warm-up

→ method

→ result

→ challenge

→ limitation

→ future work.

Do not use fixed same sequence every time.

---

# 103. COMMITTEE ROLE DIVERSITY

Different roles may focus on:

- method;
- technical implementation;
- statistics;
- application;
- limitations.

Avoid caricatures.

---

# 104. DEFENSE PRESSURE

Use controlled:

- follow-up;
- concise answer requirement;
- challenge.

Do not simulate hostility as pedagogical default.

---

# 105. UNKNOWN QUESTION HANDLING

Scenario recognizes valid:

- clarification;
- outside scope;
- insufficient data.

Do not force fabricated answer.

---

# 106. SCENARIO CONTENT SOURCES

Scenario facts can be:

- canonical course data;
- validated synthetic;
- learner/project data;
- source package.

Classify provenance.

---

# 107. SYNTHETIC WORLD

Synthetic scenario must be internally consistent.

Label as practice context.

---

# 108. LEARNER-PROVIDED WORLD

If learner provides project details:

treat as user data.

Do not overwrite with AI assumptions.

---

# 109. WORLD FACT VALIDATION

Before start:

validate required fields.

Missing critical fact:

ask or use explicit synthetic default.

Do not silently invent “real” learner project facts.

---

# 110. SCENARIO INIT

Initialization should be deterministic from:

scenario definition

+ variant/seed

+ learner mode

+ optional learner/project data.

---

# 111. SESSION IDENTITY

Each scenario session:

scenario ID;
instance ID;
attempt ID;
seed/version.

Supports replay/debug.

---

# 112. SCENARIO REVISION

Scenario content changes over time.

Attempt should know scenario revision.

Old attempt remains interpretable.

---

# 113. STATE PERSISTENCE

For long scenario:

state may persist across reload if product requires.

Do not confuse saved state with completed evidence.

---

# 114. PAUSE / RESUME

Learner can pause.

Resume from valid state.

AI context can be rebuilt from scenario state.

Do not rely solely on chat transcript.

---

# 115. RESET

Reset options:

- current turn;
- current scene;
- full scenario.

Official assessment restrictions may differ.

Do not erase attempt history silently.

---

# 116. SAVEPOINT

Complex scenario may define savepoints.

Useful for long research/defense simulations.

Not necessary for short shop dialogue.

---

# 117. EVENT LOG

Scenario engine may record:

- state transition;
- learner action;
- counterpart action;
- support used;
- event;
- completion.

This is interaction evidence.

Not automatically mastery.

---

# 118. EVENT LOG SIZE

Store compact semantic events.

Do not store huge duplicate transcripts if not needed.

---

# 119. TRANSCRIPT

Conversation transcript may be learner artifact/evidence.

Separate from semantic event log.

---

# 120. TRANSCRIPT PRIVACY

Voice/text learner data follows privacy policy.

Do not expose across learners.

---

# 121. SEMANTIC PARSER

Scenario may need map learner utterance to intent/action.

Possible layers:

deterministic keyword/pattern

→ structured classifier

→ AI classifier.

Use simplest reliable.

---

# 122. CLASSIFIER OUTPUT

Should return:

- intent;
- slots/entities;
- confidence;
- unresolved ambiguity.

Do not return state transition directly without engine validation.

---

# 123. LOW CONFIDENCE

If intent confidence low:

counterpart asks clarification.

Do not guess branch aggressively.

---

# 124. MULTIPLE INTENTS

Learner may:

greet + ask question.

Parser can handle multiple semantic actions if scenario allows.

---

# 125. SLOT EXTRACTION

Examples:

- room number;
- date;
- price;
- parameter;
- concept.

Validate against world/context.

---

# 126. SLOT CONFLICT

If learner states wrong world fact:

counterpart can correct.

Do not mutate world to learner's incorrect statement.

---

# 127. LANGUAGE ERRORS WITH CORRECT INTENT

Scenario may advance while logging language error.

This preserves communicative realism.

---

# 128. CORRECT LANGUAGE WITH WRONG ACTION

Learner may speak grammatically but fail task.

Scenario should not mark success.

---

# 129. OFF-TOPIC RESPONSE

Counterpart may redirect.

Repeated off-topic can offer hint/exit.

---

# 130. SILENCE / NO RESPONSE

Handle:

- timeout;
- microphone issue;
- learner skip.

Do not interpret silence as linguistic failure automatically.

---

# 131. TEXT FALLBACK

If speech unavailable:

learner can type.

Scenario continues.

P6 defines modality fallback.

---

# 132. CHOICE FALLBACK

For early beginner/unsupported input:

offer semantic choices.

Choice completion is lower-quality evidence than free speech but still useful practice.

---

# 133. MULTIMODAL INPUT

Possible:

speech;
text;
choice;
object selection;
form field.

P11 state machine is modality-agnostic.

---

# 134. MULTIMODAL OUTPUT

Possible:

text;
audio;
image/diagram;
table;
document.

P13 handles presentation.

---

# 135. ACCESSIBILITY

Scenario semantics must support:

- keyboard;
- screen reader;
- transcript;
- non-audio fallback;
- no color-only state.

---

# 136. HEARING ACCESS

Listening-heavy scenario should provide accessible alternative consistent with assessment policy.

---

# 137. SPEECH ACCESS

Speaking task may allow typed equivalent in accessibility/practice mode.

Official speaking assessment policy defines equivalence.

---

# 138. COGNITIVE LOAD

Do not present:

long world description

+ 10 objectives

+ 20 buttons.

Scenario should reveal information progressively.

---

# 139. MOBILE DESIGN INPUT

P11 defines compact semantic blocks.

P13 handles mobile layout.

---

# 140. SCENARIO FEEDBACK TIMING

Options:

`TURN_LEVEL`

`SCENE_LEVEL`

`END_OF_SCENARIO`.

Choose by mode.

---

# 141. TURN FEEDBACK

Useful for beginner accuracy practice.

---

# 142. DELAYED FEEDBACK

Useful for fluency/transfer.

Do not interrupt every turn.

---

# 143. END SUMMARY

After scenario:

- objective outcome;
- subgoals;
- language highlights;
- repair use;
- key errors;
- recommended retry.

P4/P5 decide official state/next plan.

---

# 144. COUNTERPART FEEDBACK VS COACH FEEDBACK

Role character should not always become teacher.

Separate:

scenario role turn
from:

coach feedback.

---

# 145. DEBRIEF MODE

After scenario:

exit role.

Review:

what happened;
why;
better alternatives.

---

# 146. REPLAY RECOMMENDATION

Suggest replay if:

critical subgoal failed

or:

target weakness remains.

P5 owns canonical recommendation.

---

# 147. SCENARIO EVIDENCE

Potential evidence:

- task completion;
- intent completion;
- repair strategy;
- response relevance;
- lexical/grammar signals;
- spoken/written response;
- time/support usage.

P4 determines mastery.

---

# 148. TASK COMPLETION EVIDENCE

Functional outcome can be authoritative for scenario success.

Language mastery still separate.

---

# 149. INTERACTION EVIDENCE

Track:

- initiative;
- response;
- clarification;
- turn-taking;
- repair.

Use carefully.

---

# 150. NO FAKE SOCIAL SCORE

Do not output:

“communication skill 97%”

without defined rubric.

---

# 151. SCENARIO RUBRIC

P11 can propose:

- goal completion;
- information exchange;
- response relevance;
- interaction repair;
- register appropriateness;
- technical accuracy.

P4 owns scoring.

---

# 152. OFFICIAL SIMULATION

Some scenarios may be assessment.

Then:

- answer/help restrictions;
- deterministic seed;
- first attempt;
- reproducibility;
- evidence.

---

# 153. PRACTICE SIMULATION

Allows:

- hints;
- reset;
- repeat;
- explanation.

Mode must be explicit.

---

# 154. DIAGNOSTIC SIMULATION

Can identify:

- survival gaps;
- interaction gaps;
- technical speaking gaps.

Should not permanently punish learner.

---

# 155. SCENARIO PREREQUISITES

Scenario can require:

- language function;
- vocabulary;
- technical concepts.

Do not lock too rigidly for exploration.

---

# 156. PREVIEW MODE

Learner may preview advanced scenario.

No mastery from preview.

---

# 157. SCENARIO RECOMMENDATION

P5 may recommend based on:

- current stage;
- weak skill;
- upcoming real need.

P11 only exposes metadata.

---

# 158. ARRIVAL INTENSIVE PACK

Scenario pack for:

- airport;
- transport;
- dorm;
- SIM;
- bank;
- university office.

Temporary high-priority use.

---

# 159. CLASSROOM PACK

- teacher instruction;
- clarification;
- homework;
- group work;
- presentation.

---

# 160. TECHNICAL PACK

- debugging;
- lab;
- database;
- AI explanation;
- control system;
- experiment.

---

# 161. RESEARCH PACK

- supervisor meeting;
- literature discussion;
- seminar;
- NIR;
- VKR defense.

---

# 162. PACK ≠ OWNER

Pack groups scenarios.

Canonical scenario definitions remain owner.

---

# 163. OFFLINE PACK

Core deterministic content should be packageable offline.

AI-enhanced turns degrade gracefully.

---

# 164. OFFLINE AI FALLBACK

No AI:

use deterministic turn pool.

Scenario still completes.

---

# 165. OFFLINE MEDIA

Required audio/media must be cached/packaged according to P6/P14.

---

# 166. SCENARIO LOADING

Lazy-load scenario family.

Do not load all 4,000 dialogues/worlds at startup.

---

# 167. WORLD DATA SIZE

Keep scenario state compact.

Reference canonical content IDs.

Do not embed full vocab/grammar objects.

---

# 168. AI CONTEXT SIZE

Pass compact:

state summary;
world facts;
role;
target;
recent turns.

Do not pass entire scenario library.

---

# 169. AI TURN TOKEN BUDGET

Counterpart utterance usually short.

Do not generate long essays in dialog role.

---

# 170. TECHNICAL SCENARIO CONTEXT

Only include relevant technical concepts.

Do not inject entire P8 domain.

---

# 171. RESEARCH SCENARIO CONTEXT

Use relevant project/source claims.

Preserve attribution.

---

# 172. PROMPT INJECTION IN SCENARIO CONTENT

Learner-provided documents/world facts are data.

They cannot change system/AI permissions.

P10 guardrails apply.

---

# 173. ROLEPROMPT INJECTION

Scenario role description itself is trusted authored config.

Imported external role text must be sanitized/reviewed.

---

# 174. OBJECT CONTENT SECURITY

Documents/code in scenario:

treat as content.

Do not execute arbitrary embedded code.

---

# 175. EXTERNAL LINKS

Scenario should not require live web unless explicitly designed.

Core flow remains available.

---

# 176. REAL-WORLD ACTION BOUNDARY

Simulation does not:

actually buy ticket;
submit visa;
send email;
change bank account.

External actions require separate authorized tools.

Do not confuse simulation with action.

---

# 177. SAFETY-CRITICAL SCENARIOS

If scenario relates to health/safety:

keep language-learning scope.

Do not provide diagnosis/unsafe technical instructions.

---

# 178. TECHNICAL SAFETY

Lab scenarios should not invent dangerous procedures.

Use validated benign context.

---

# 179. SCENARIO AUTHORING MODEL

P12 later provides editor.

P11 defines authoring fields:

- ID;
- objective;
- roles;
- world facts;
- state machine;
- variants;
- evidence;
- difficulty;
- provenance;
- validation status.

---

# 180. SCENARIO VALIDATION LIFECYCLE

`DRAFT`

→ `STRUCTURE_VALIDATED`

→ `LANGUAGE_VALIDATED`

→ `DOMAIN_VALIDATED`

→ `RUNTIME_VALIDATED`

→ `ACTIVE`.

Not every simple survival scene needs domain validation.

---

# 181. SCENARIO VERSIONING

Scenario revision changes when:

- topology changes;
- world facts logic changes;
- objective changes;
- major content changes.

Minor wording can be content revision.

---

# 182. STATE MIGRATION

If active saved scenario state exists and topology changes:

define migration or invalidate session safely.

Do not strand learner in nonexistent state.

---

# 183. INVALIDATED SESSION

If migration impossible:

preserve attempt/history

and restart scenario with explanation.

Do not corrupt mastery.

---

# 184. SCENARIO ID IMMUTABILITY

Stable ID once referenced by learner state.

---

# 185. BRANCH ID

Stable IDs for important branches/states help:

- analytics;
- debugging;
- migration.

---

# 186. EVENT ID

World events can have IDs.

Useful for replay.

---

# 187. DETERMINISTIC SEED

Official/reproducible scenario should save seed.

Practice can randomize.

---

# 188. RANDOMNESS BOUNDARY

Randomness selects from validated possibilities.

It does not invent new truth.

---

# 189. AI VARIATION BOUNDARY

AI can paraphrase turn.

It cannot create new world fact unless event API permits.

---

# 190. STATE GUARD

Before applying AI semantic action:

validate:

- allowed role;
- allowed event;
- current state;
- world constraints.

---

# 191. EVENT SOURCES

Event may come from:

- learner action;
- deterministic timer/branch;
- seeded random event;
- AI suggestion validated by engine.

Engine remains authority.

---

# 192. SCENARIO ENGINE FACADE

All UI/features should call canonical scenario engine.

Avoid feature-specific branch logic scattered across components.

---

# 193. DIRECT UI STATE MUTATION

UI must not directly set:

scenario completed

or:

world fact changed

without engine action.

---

# 194. SCENARIO STORE

One canonical store for active session.

Avoid duplicate local state + engine state diverging.

---

# 195. SERIALIZATION

Saved state must include:

- scenario ID;
- revision;
- state ID;
- world variable values;
- seed;
- progress/subgoals;
- attempt link.

Do not serialize unnecessary UI state as domain truth.

---

# 196. DESERIALIZATION VALIDATION

On load:

verify revision/schema.

Malformed state:

preserve backup;

recover/restart safely.

---

# 197. IDEMPOTENT EVENT APPLICATION

Reload/retry must not apply same event twice.

---

# 198. DOUBLE SUBMIT

Learner double-click/send:

one semantic turn/evidence event.

---

# 199. OUT-OF-ORDER TURN

Async AI response from old state:

reject/stale.

Do not apply to new state.

---

# 200. TURN ID

Each turn:

session ID;
turn ID;
state-before;
state-after;
request ID if AI.

---

# 201. CONVERSATION ORDER

Transcript order must follow committed turns, not network completion order.

---

# 202. AI RETRY

Retry can produce alternative wording.

State transition occurs only once.

---

# 203. AI TIMEOUT

Fallback deterministic counterpart turn.

Do not freeze scene.

---

# 204. AI INVALID RESPONSE

Fallback or regenerate with bounded retry.

No infinite loop.

---

# 205. TRANSCRIPT CONSISTENCY

Transcript must reflect final accepted counterpart turn, not rejected AI drafts.

---

# 206. AUDIO-TEXT CONSISTENCY

If AI text gets TTS audio:

displayed text and spoken text must match sufficiently.

P6 handles audio.

---

# 207. SPEECH RECOGNITION ERROR

If transcript uncertain:

scenario should ask clarification or allow text fallback.

Do not branch on low-confidence misrecognition as if true.

---

# 208. SEMANTIC CONFIDENCE THRESHOLD

Threshold can vary by criticality.

Administrative number:

higher certainty.

Casual greeting:

lower.

Do not use one threshold for all intents.

---

# 209. CONFIRMATION STEP

For critical values:

counterpart can confirm:

“318?”

This is authentic interaction.

---

# 210. NUMBER SLOT VALIDATION

Phone/date/room/price values use structured parsing.

P7 numeric language rules.

---

# 211. FORM SCENARIO

Learner fills fields.

Validate semantic values separately from Russian spelling where appropriate.

---

# 212. DOCUMENT CHECK SCENARIO

World defines required documents.

Learner provides/mentions them.

Do not infer real legal requirements unless validated scenario source.

---

# 213. TECHNICAL PARAMETER SLOT

P8 defines units/range.

Scenario engine validates synthetic task values.

---

# 214. FIGURE/TABLE SCENARIO

World references canonical figure/table asset.

Learner explains.

AI cannot change data.

---

# 215. CODE SCENARIO

World references code fixture.

Learner explains/debugs.

Do not mutate code unless scenario action explicitly includes edit.

---

# 216. SOURCE DISCUSSION SCENARIO

World references P9 source claims.

AI counterpart cites only available source data.

No fabricated references.

---

# 217. SUPERVISOR SCENARIO

Role may ask:

“Why this method?”

But cannot invent supervisor policy as official course rule.

---

# 218. COMMITTEE SCENARIO

Committee questions grounded in project package.

No random domain trivia unless assessment spec includes it.

---

# 219. QUESTION POOL

Deterministic validated question pool can seed scenarios.

AI may paraphrase or select.

---

# 220. QUESTION DIFFICULTY

Tag:

- recall;
- explanation;
- comparison;
- justification;
- limitation;
- transfer.

---

# 221. FOLLOW-UP LOGIC

Follow-up triggered by:

- incomplete answer;
- claim requiring evidence;
- contradiction;
- uncertainty;
- preconfigured challenge.

Do not follow up endlessly.

---

# 222. FOLLOW-UP LIMIT

Define max per branch/session when useful.

Prevent AI interrogation loop.

---

# 223. SCENARIO END CONDITION

End when:

- objective resolved;
- learner exits;
- hard fail;
- time/session limit;
- assessment policy.

Not because AI “feels done”.

---

# 224. POST-SCENE DEBRIEF

Debrief uses committed event log.

It should not invent missed turn.

---

# 225. ERROR SUMMARY

Group recurring errors.

Do not list every typo.

---

# 226. SUCCESS SUMMARY

Report actual completed subgoals.

Avoid generic praise.

---

# 227. ALTERNATIVE PATH

Show one or two better phrases/actions.

Do not flood.

---

# 228. RETRY TARGET

Suggest specific branch/skill.

P5 decides planner.

---

# 229. SCENARIO ANALYTICS

Possible internal metrics:

- completion;
- branch;
- repair use;
- support;
- retries;
- time;
- intent success.

Do not convert to mastery automatically.

---

# 230. BRANCH ANALYTICS

Identify branches causing excessive failure.

Could indicate:

- genuine difficulty;
- bad wording;
- parser issue;
- state bug.

Investigate before blaming learner.

---

# 231. PARSER ERROR ANALYTICS

Track low-confidence/unrecognized intents.

Use to improve parser/scenario.

---

# 232. AI TURN ERROR ANALYTICS

Track:

- role drift;
- world contradiction;
- excessive length;
- invalid source claim.

---

# 233. SCENARIO ABANDONMENT

High abandonment may indicate:

- too long;
- bug;
- unclear goal;
- difficulty.

Not necessarily learner laziness.

---

# 234. QA — STATE MACHINE

Test every state:

- reachable;
- valid transitions;
- no dead-end unless intentional;
- success path;
- recovery path.

---

# 235. QA — BRANCH COVERAGE

Automated traversal where possible.

Find unreachable branches.

---

# 236. QA — WORLD CONSISTENCY

Check:

- numbers;
- names;
- times;
- document states;
- technical values.

---

# 237. QA — ROLE CONSISTENCY

Ensure role knows/does only allowed things.

---

# 238. QA — LANGUAGE

P7 validates:

- wording;
- register;
- politeness.

---

# 239. QA — TECHNICAL

P8 validates technical world facts.

---

# 240. QA — RESEARCH

P9 validates source/claim/project facts.

---
# 241. QA — AI

P10 validates dynamic turn policy.

---

# 242. QA — AUDIO

P6 validates playback/recording/fallback.

---

# 243. QA — STATE

P4 verifies attempt/evidence integrity.

---

# 244. QA — ADAPTIVE

P5 verifies difficulty/recommendation metadata.

---

# 245. GOLDEN SCENARIO FIXTURES

Create known-good fixtures:

- dorm missing document;
- metro wrong direction;
- classroom clarification;
- lab measurement error;
- software bug;
- database query issue;
- control loop explanation;
- seminar disagreement;
- supervisor meeting;
- defense challenge.

---

# 246. GOLDEN FAILURE FIXTURES

Include:

- AI contradicts world;
- learner gives wrong number;
- parser low confidence;
- role drift;
- source fabrication;
- stale AI response;
- double submit;
- reload mid-scene;
- offline AI outage;
- scenario revision mismatch.

---

# 247. SIMULATION REPRODUCIBILITY

Given same:

scenario revision;
seed;
learner semantic actions;

deterministic world progression should be reproducible.

AI wording may vary unless fixed.

---

# 248. OFFICIAL ASSESSMENT REPRODUCIBILITY

For official simulation:

store enough event/seed/state info to audit.

---

# 249. SCENARIO PERFORMANCE BASELINE

Measure:

- load time;
- first turn;
- AI turn latency;
- state transition;
- memory;
- reload/resume.

No arbitrary target before baseline.

---

# 250. LARGE SCENARIO PACK

Do not parse all scenario bodies at startup.

Use manifest/index.

---

# 251. MANIFEST

Scenario index may include:

- ID;
- title;
- stage;
- skills;
- estimated duration;
- pack;
- difficulty;
- prerequisites.

Derived metadata.

---

# 252. SEARCH

Learner/admin may search scenario by:

- situation;
- skill;
- domain;
- stage.

P13 handles UI.

---

# 253. FAVORITES / RECENT

Presentation/user preference feature.

Not P11 canonical truth.

---

# 254. SCENARIO PROGRESS DISPLAY

Can show:

subgoal progress.

Do not show hidden branches.

---

# 255. ESTIMATED DURATION

Estimate, not promise.

Use ranges if needed.

---

# 256. SCENARIO AUTHORING VALIDATOR

Validate:

- ID;
- state graph;
- start state;
- terminal states;
- world vars;
- role refs;
- branch refs;
- missing transition;
- unreachable state;
- hidden fact leak;
- success criteria;
- fallback.

---

# 257. LANGUAGE VALIDATOR

Ensure every canonical line references validated content or passes P7 review.

---

# 258. AI TURN SCHEMA VALIDATOR

AI output matches expected fields.

Reject unknown action.

---

# 259. WORLD VARIABLE SCHEMA

Typed variables:

string;
number;
enum;
boolean;
entity ref.

Avoid unstructured blob for critical state.

---

# 260. GUARD EXPRESSION

State guards should use safe declarative rules.

Do not eval arbitrary code from content.

---

# 261. ACTION EXPRESSION

Likewise declarative actions.

No dynamic script execution from scenario JSON.

---

# 262. SECURITY

Scenario content is data.

No embedded script execution.

P14 later hardens.

---

# 263. IMPORTED SCENARIO

Imported/user scenario enters:

draft

+ validation.

Not active automatically.

---

# 264. SCENARIO PROVENANCE

Track:

- authored;
- generated;
- adapted;
- source;
- validation.

---

# 265. GENERATED SCENARIO

AI can generate candidate topology/content.

Requires:

- schema validation;
- state graph validation;
- P7/P8/P9 review as relevant;
- runtime test.

No auto-activation.

---

# 266. BULK GENERATION

Pilot one family first.

Do not generate 1,000 scenes before engine proven.

---

# 267. SCENARIO DUPLICATION

Detect near-duplicate scenarios.

Different names/room numbers alone do not justify separate canonical scenario.

Use variants.

---

# 268. SCENARIO FAMILY REUSE

Core topology + parameter variants.

This reduces maintenance.

---

# 269. LOCALIZATION

Russian is target language.

Vietnamese UI/support can vary.

Do not duplicate scenario topology per support language.

---

# 270. SUPPORT LANGUAGE

Phrase hints/translation can be localized separately.

---

# 271. SCENARIO CONTENT UPDATE

Change language line:

content revision.

Change topology/objective:

scenario revision.

---

# 272. ATTEMPT COMPATIBILITY

Old attempt remains tied to old revision.

Do not reinterpret with new topology.

---

# 273. SCENARIO RETIREMENT

Deprecated scenario:

no new recommendation.

Old attempts remain viewable.

---

# 274. ALIAS

If scenario renamed:

stable ID.

No need alias unless identity changes.

---

# 275. MERGE DUPLICATES

If two scenarios duplicate responsibility:

choose owner;

map history;

deprecate duplicate.

---

# 276. P11 PILOT

Pilot four layers:

### Pilot A — Survival
Dorm registration with missing document.

### Pilot B — Classroom
Ask lecturer clarification.

### Pilot C — Technical
Lab/debugging problem.

### Pilot D — Research
Defense question sequence.

This tests different complexity.

---

# 277. PILOT ACCEPTANCE

Must prove:

- state machine;
- world facts;
- semantic intent;
- deterministic fallback;
- AI bounded turn;
- replay;
- reload;
- evidence;
- no duplicate mastery;
- offline behavior.

---

# 278. MIGRATION ORDER

Recommended:

1. Scenario engine contract.
2. State machine schema.
3. World facts.
4. Deterministic dialogue migration.
5. Survival families.
6. Classroom.
7. Technical.
8. Research.
9. AI hybrid turns.
10. Replay/variation.
11. Analytics/debrief.
12. Legacy dialogue cleanup.

---

# 279. LEGACY DIALOGUE MIGRATION

Existing `dialogue-bauman-az.json` content:

classify:

`KEEP_AS_TURN_POOL`

`MAP_TO_SCENARIO`

`MAP_TO_VARIANT`

`DEPRECATE_LATER`

`UNKNOWN`.

Do not delete static dialogue value.

---

# 280. DEEP SPEAKING INTEGRATION

Deep Speaking tasks can become:

- scenario subtask;
- terminal performance;
- follow-up.

P6 remains owner.

---

# 281. SIMULATION DATA INTEGRATION

Existing `simulations.json`:

audit before replacement.

May contain scenario seed/world data.

Preserve useful content.

---

# 282. SCENARIO CONTENT GRAPH

Relations:

scenario `requires` competency;

scenario `uses` concept;

scenario `contains` state;

scenario `tests` function;

scenario `references` object/source.

Use P3 graph conventions.

---

# 283. P12 HANDOFF

P11 supplies P12:

- scenario schema;
- state graph;
- role schema;
- world variable schema;
- branch/guard/action model;
- variation model;
- validation rules;
- provenance;
- lifecycle;
- generated candidate rules.

P12 builds authoring/editor workflow.

---

# 284. REQUIRED DELIVERABLES — CORE

Create/maintain:

`subjects/russian/docs/p11/RUSSIAN_P11_EXECUTIVE_SUMMARY.md`

`RUSSIAN_SCENARIO_ENGINE_CONTRACT.md`

`RUSSIAN_SCENARIO_STATE_MACHINE_SCHEMA.json`

`RUSSIAN_SCENARIO_WORLD_MODEL.md`

`RUSSIAN_SCENARIO_ROLE_MODEL.md`

`RUSSIAN_SCENARIO_EVENT_MODEL.md`

`RUSSIAN_SCENARIO_VARIATION_POLICY.md`

`RUSSIAN_SCENARIO_EVIDENCE_CONTRACT.md`.

---

# 285. REQUIRED DELIVERABLES — FAMILIES

Create as needed:

`RUSSIAN_SURVIVAL_SCENARIO_MAP.md`

`RUSSIAN_CLASSROOM_SCENARIO_MAP.md`

`RUSSIAN_TECHNICAL_SCENARIO_MAP.md`

`RUSSIAN_RESEARCH_SCENARIO_MAP.md`

`RUSSIAN_DEFENSE_SCENARIO_MAP.md`.

---

# 286. REQUIRED DELIVERABLES — QA

Create:

`RUSSIAN_SCENARIO_GOLDEN_FIXTURES.json`

`RUSSIAN_SCENARIO_BRANCH_COVERAGE_REPORT.md`

`RUSSIAN_SCENARIO_WORLD_CONSISTENCY_REPORT.md`

`RUSSIAN_P11_RISK_REGISTER.json`

`RUSSIAN_P11_EVIDENCE_INDEX.md`

`RUSSIAN_P12_INPUT_CONTRACT.md`.

No empty ceremonial docs.

---

# 287. TEST MATRIX — ENGINE

Test:

- start;
- valid transition;
- invalid transition;
- guard;
- event;
- success;
- partial success;
- recovery;
- reset;
- replay;
- reload.

---

# 288. TEST MATRIX — AI

Test:

- valid role turn;
- world contradiction;
- role drift;
- stale response;
- timeout;
- fallback;
- prompt injection.

---

# 289. TEST MATRIX — INPUT

Test:

- text;
- speech transcript;
- low confidence;
- wrong number;
- multiple intent;
- silence;
- choice fallback.

---

# 290. TEST MATRIX — STATE

Test:

- double submit;
- out-of-order response;
- duplicated event;
- corrupted saved state;
- scenario revision mismatch.

---

# 291. TEST MATRIX — OFFLINE

Test:

- no AI;
- cached media;
- deterministic turn;
- resume.

---

# 292. TEST MATRIX — PEDAGOGY

Test:

- beginner support;
- support fade;
- repair;
- transfer variation;
- anti-memorization.

---

# 293. TEST MATRIX — DOMAINS

Representative:

- dorm;
- classroom;
- lab;
- software;
- control;
- seminar;
- defense.

---

# 294. RISK REGISTER

Track:

- world contradiction;
- hidden fact leak;
- branch dead-end;
- AI role drift;
- duplicate scenario owner;
- parser misclassification;
- over-randomization;
- static transcript masquerading as simulation;
- no offline fallback;
- state loss;
- unbounded branch explosion;
- technical falsehood;
- assessment ambiguity.

---

# 295. BLOCKER EXAMPLES

BLOCKER:

- AI can mutate world outside engine;
- official scenario state not reproducible;
- learner attempt lost on reload;
- hidden answer/world fact leaked;
- double submit duplicates evidence;
- prompt injection changes scenario permissions;
- no fallback when AI unavailable for core scenario.

---

# 296. CRITICAL EXAMPLES

CRITICAL:

- scenario success = number of lines spoken;
- static dialogue called simulation;
- world facts conflict between turns;
- scenario requires exact sentence memorization;
- technical scenario uses false data;
- defense AI invents project claims;
- parser routes low-confidence speech to irreversible branch.

---

# 297. P11 FAIL CONDITIONS

P11 FAIL if:

- no explicit scenario state;
- AI owns world state;
- branches exist only in AI memory;
- scenario cannot run without AI where core fallback required;
- learner intent and language quality are conflated;
- no repair path;
- no replay/variation strategy;
- official attempt history overwritten;
- no scenario revision;
- generated scenarios auto-activate;
- branch graph unvalidated;
- scenario content duplicates canonical vocab/grammar truth;
- hidden facts leak;
- long scenarios lose state;
- P12 has no stable authoring contract.

---

# 298. P11 PASS CONDITIONS

P11 PASS when:

1. Scenario engine owner is explicit.
2. World facts are explicit.
3. Roles are explicit.
4. State machine exists.
5. Intent and wording are separate.
6. Deterministic core works.
7. AI is bounded to turn generation/variation.
8. AI cannot mutate world directly.
9. Core scenarios have no-AI fallback.
10. Branches are validated.
11. Recovery paths exist.
12. Repair language is first-class.
13. Difficulty vector exists.
14. Support modes exist.
15. Replay/variation prevents transcript memorization.
16. Attempt history preserved.
17. Scenario revision/seed recorded where needed.
18. Saved state validates.
19. Double-submit/out-of-order are safe.
20. Survival families exist.
21. Classroom family exists.
22. Technical family exists.
23. Research/defense family exists.
24. P6 audio/speech integration works.
25. P7 language alignment works.
26. P8 technical truth alignment works.
27. P9 research/source alignment works.
28. P10 role/context guardrails work.
29. Offline deterministic fallback works.
30. P12 receives stable schema/editor contract.

---

# 299. P11 PROMPT COMPLETENESS GATE

P11 prompt is structurally complete only if it covers:

1. scenario definition;
2. world facts;
3. roles;
4. objectives/subgoals;
5. state machine;
6. intent;
7. branches;
8. events;
9. recovery;
10. success/partial/fail;
11. deterministic fallback;
12. AI hybrid;
13. difficulty;
14. scaffolding;
15. variation/replay;
16. survival scenarios;
17. classroom;
18. technical/lab;
19. project/seminar;
20. research/NIR;
21. defense;
22. evidence;
23. persistence;
24. concurrency;
25. offline;
26. authoring schema;
27. QA/golden fixtures;
28. P12 handoff.

If all are defined:

`P11 PROMPT STATUS: COMPLETE / READY TO EXECUTE`.

This does not mean repository P11 implementation has PASSed.

---

# 300. FINAL RESPONSE FORMAT

When P11 implementation completes:

`P11 STATUS: PASS / FAIL / BLOCKED`

`Base SHA:`

`Head SHA:`

`Scenario engine: PASS / FAIL`

`State machine: PASS / FAIL`

`World consistency: PASS / FAIL`

`Role consistency: PASS / FAIL`

`Deterministic fallback: PASS / FAIL`

`AI hybrid boundary: PASS / FAIL`

`Semantic intent mapping: PASS / FAIL`

`Replay/variation: PASS / FAIL`

`Persistence/reload: PASS / FAIL`

`Concurrency/idempotence: PASS / FAIL`

`Survival scenarios: PASS / FAIL`

`Classroom scenarios: PASS / FAIL`

`Technical scenarios: PASS / FAIL`

`Research/defense scenarios: PASS / FAIL`

`P6 integration: PASS / FAIL`

`P7/P8/P9 alignment: PASS / FAIL`

`P10 guardrails: PASS / FAIL`

`Offline behavior: PASS / FAIL`

`P12 readiness: READY / NOT READY`

`PR:`

`Merged SHA:`

`Production: UNCHANGED unless explicitly authorized`

End:

**P11 SCENARIO · SIMULATION · DIALOGUE EXPERIENCE COMPLETE**

---

# 301. EXECUTION RULE

When authorized:

`audit existing dialogues/simulations`

→ `identify canonical runtime owner`

→ `baseline`

→ `define scenario schema`

→ `define state machine`

→ `pilot survival`

→ `pilot classroom`

→ `pilot technical`

→ `pilot defense`

→ `integrate AI bounded turns`

→ `add deterministic fallback`

→ `test replay/reload/offline`

→ `migrate useful legacy dialogue`

→ `validate branch/world consistency`

→ `document evidence`

→ `open PR`.

Do not begin by generating thousands of scenarios.

---

# 302. FINAL P11 PRINCIPLE

A simulation is successful only if:

> the learner must understand the situation, act through Russian, recover from misunderstanding and reach a meaningful outcome inside a consistent world.

For every scenario ask:

1. What is the world truth?
2. What does the learner know?
3. What does the counterpart know?
4. What is the learner trying to accomplish?
5. Which actions can change state?
6. What happens after misunderstanding?
7. Can the scenario run without AI?
8. Can AI contradict world truth?
9. What evidence proves task completion?
10. Can the same skill transfer to a new variant?

If these are not answerable:

it is a dialogue script, not a robust simulation.

**STATE BEFORE CHAT.**
**WORLD TRUTH BEFORE AI IMPROVISATION.**
**RECOVERY BEFORE RESET.**
**TRANSFER BEFORE MEMORIZATION.**
**FUNCTIONAL OUTCOME BEFORE FAKE SCORE.**


---

# P11 HARDENING ADDENDUM
## FINAL COMPLETENESS PASS BEFORE P12

This addendum closes the remaining scenario/runtime edge cases that usually appear only after large-scale authoring, analytics, content revision and real learner replay.

It does not expand P11 into P12.

---

# 303. EVENT-SOURCED DEBUG VIEW

For complex scenarios, the engine should be able to reconstruct what happened from committed semantic events where practical.

This does not require full event-sourcing architecture for every simple scene.

But debugging should be able to answer:

- state before;
- learner action;
- event;
- state after;
- world change;
- AI turn accepted/rejected;
- support used.

Do not rely only on rendered transcript.

---

# 304. TRANSCRIPT ≠ STATE HISTORY

A transcript is human-readable conversation history.

State/event history is domain truth.

They may differ when:

- AI draft rejected;
- learner retries;
- object action occurs without speech;
- hidden event fires.

Do not rebuild authoritative scenario state from transcript alone.

---

# 305. ANALYTICS PRIVACY

Scenario analytics should prefer compact semantic events.

Avoid storing unnecessary:

- raw audio;
- full private learner speech;
- full source documents;

unless feature/evidence policy requires them.

---

# 306. ANALYTICS RETENTION

Define retention class for:

- aggregate metrics;- attempt events;
- transcript;
- recording.

Do not keep all rich artifacts indefinitely by default.

Actual platform retention implementation may be P14/system-specific.

---

# 307. SCENARIO TELEMETRY ≠ MASTERY

Telemetry such as:

- time;
- branch;
- retries;
- abandonment;

is diagnostic.

It is not automatically official mastery evidence.

---

# 308. AUTHORING PREVIEW CONTRACT

P12 editor must be able to preview scenario in:

`SANDBOX_PREVIEW`.

Preview:

- uses draft scenario revision;
- cannot write official mastery;
- cannot alter learner production state;
- can emit test diagnostics;
- may use mock learner state.

This contract belongs to P11 semantics and P12 workflow.

---

# 309. PREVIEW WORLD SEED

Author preview should support:

- fixed seed;
- custom world values;
- specific branch/state start.

This helps test edge branches without replaying full scenario.

---

# 310. STATE JUMP — AUTHOR ONLY

Debug/editor may jump to a state.

Learner runtime must not expose arbitrary state jump unless product intentionally supports practice navigation.

Debug jump never counts as evidence.

---

# 311. BRANCH TEST HARNESS

Provide tooling capable of:

- traverse all deterministic states;
- validate guards;
- validate terminal paths;
- identify unreachable nodes;
- detect cycles;
- detect missing fallback.

AI branches can use mocked structured outputs.

---

# 312. LOOP DETECTION

A scenario may intentionally loop:

clarification

→ repeat.

But validator should detect accidental infinite cycles.

Every intentional loop should have:

- exit condition;
- attempt/support limit where useful.

---

# 313. DEADLOCK DETECTION

Detect state where:

no valid learner action

and:

no event/counterpart transition.

This is a scenario engine defect.

---

# 314. HIDDEN-FACT LEAK VALIDATOR

Validate that hidden world variables do not appear in:

- prompt card;
- learner context;
- AI visible context if role should not know;
- deterministic hints;
- transcript before reveal.

---

# 315. ROLE-KNOWLEDGE MATRIX

For complex scenarios, define:

world fact

× role visibility.

This prevents AI counterpart from using privileged data.

---

# 316. KNOWLEDGE UPDATE EVENT

A role may learn new fact during scenario.

Visibility changes should be explicit event/state update.

Do not assume every utterance becomes globally known automatically.

---

# 317. PRIVATE ROLE STATE

Some counterpart intent may remain hidden.

Do not expose internal role objective as learner hint unless scenario policy says so.

---

# 318. OBJECT OWNERSHIP

Scenario object may be owned/held by:

learner;
counterpart;
environment.

This matters for document/item exchanges.

Use only where pedagogically meaningful.

---

# 319. INVENTORY BOUNDARY

Do not build game-like inventory system unless scenario actually needs object state.

Keep scenario engine educational, not RPG architecture.

---

# 320. PHYSICAL ACTION LIMIT

Simulated actions should stay representational.

Do not pretend to execute real physical/legal/financial action.

---

# 321. MULTI-ROLE SCENE

Advanced scenario may include several counterpart roles.

State engine must define:

- current speaker;
- who knows what;
- allowed speaker order.

Avoid AI free-for-all.

---

# 322. TURN OWNERSHIP

Only one committed counterpart turn per turn slot unless multi-speaker event explicitly defined.

Prevents duplicate responses.

---

# 323. INTERRUPTION EVENT

Advanced classroom/defense scenario may allow interruption.

Represent as explicit event.

Do not let arbitrary AI interrupt unpredictably.

---

# 324. SIDE QUESTION

A side question can temporarily suspend main subgoal.

After resolved:

return to previous state.

This needs stack/substate or explicit transition.

---

# 325. SUBSCENE

Complex scenarios may contain subscenes:

e.g. dorm desk

→ payment desk

→ room issue.

Subscene IDs help organization.

Do not create separate canonical scenario if one integrated journey is pedagogically useful.

---

# 326. CHECKPOINT BETWEEN SUBSCENES

Checkpoint can preserve:

- world facts;
- completed subgoals;
- evidence.

Useful for long sessions.

---

# 327. SCENARIO COMPOSITION

Reusable subscene/component may be composed across scenario families if ownership is clear.

Example:

generic clarification subscene.

Do not copy same branch logic everywhere.

---

# 328. REUSABLE EVENT COMPONENT

Common events:

- ask repeat;
- wrong number;
- missing document;
- changed deadline.

Can be reusable templates with scenario-local parameters.

---

# 329. COMPONENT VERSIONING

Reusable component changes may affect many scenarios.

Impact analysis must list dependents before activation.

P12 must support this.

---

# 330. SCENARIO DEPENDENCY GRAPH

Track:

scenario

→ component

→ phrase/dialogue pool

→ technical concept

→ media

→ source.

This enables safe authoring changes.

---

# 331. BULK SCENARIO CHANGE

Before changing reusable component across many scenarios:

preview affected sample.

Run branch validation.

Do not bulk publish without impact report.

---

# 332. SCENARIO LOCAL OVERRIDE

Allow local override only when variation is genuinely scenario-specific.

Avoid override proliferation that defeats reusable component owner.

---

# 333. DEFAULT INHERITANCE

If scenario uses component template:

inherit defaults.

Store only differences when architecture supports.

---

# 334. INHERITANCE DEBUG VIEW

Editor should show:

inherited

vs:

overridden

values.

Prevents invisible behavior surprises.

---

# 335. CONTENT LOCALIZATION SEPARATION

Scenario topology/world logic should remain language-independent where practical.

Russian target language content references canonical text/phrase entities.

Vietnamese support is localized separately.

---

# 336. LOCALIZED HINTS

Hints can vary by UI/support language.

They must not change scenario logic.

---

# 337. TRANSLATION LEAK

A Vietnamese hint must not reveal hidden information not present in Russian hint/objective.

---

# 338. MEDIA VARIANTS

Same semantic turn may have:

- text;
- recorded audio;
- TTS;
- accessibility transcript.

They reference one semantic content ID.

---

# 339. MEDIA FALLBACK ORDER

Define per scenario/turn:

recorded audio

→ TTS

→ text

as available.

Do not leave learner stuck.

---

# 340. MEDIA REVISION

Replacing audio should not change scenario identity.

But if spoken wording changes semantically:

content revision required.

---

# 341. SCENARIO SOURCE FRESHNESS

Institution-specific/admin scenarios may become outdated.

Tag source/version/date when relevant.

Revalidate on known process change.

---

# 342. ADMINISTRATIVE REALISM BOUNDARY

Language scenario may model generic university process.

Do not label generic process as current official Bauman procedure without evidence.

---

# 343. TECHNICAL SCENARIO VERSIONING

Software/API scenario may depend on version.

Record version if behavior/terminology matters.

---

# 344. SCENARIO CONTENT EXPIRY SIGNAL

Some scenarios can have:

`REVALIDATE_BY_EVENT`

rather than fixed date.

Examples:

policy/process/software update.

---

# 345. LEARNER-PROJECT SCENARIO SNAPSHOT

For personalized defense rehearsal:

capture project data revision used for scenario.

If learner edits project later:

old rehearsal remains tied to old snapshot.

---

# 346. STALE DEFENSE QUESTION

Question generated from old claim becomes stale after draft changes.

Bind question to project revision.

---

# 347. PROJECT CLAIM TRACEABILITY

Defense question should link to:

claim ID;
section;
result;
source;

where available.

---

# 348. SCENARIO RECOMMENDATION EXPLANATION

P5 may surface reason:

“Luyện lại vì bạn vừa gặp khó khăn ở clarification.”

P11 provides reason codes/metadata.

It does not own recommendation UI.

---

# 349. SCENARIO DIFFICULTY CALIBRATION

Difficulty preset must be validated with real tasks.

Do not label scenario “B2” just because it has many branches.

Use:

- language level;
- concept load;
- support;
- interaction complexity.

---

# 350. DIFFICULTY DRIFT

If scenario content is enriched later:

reassess difficulty.

Do not preserve old label blindly.

---

# 351. TIME ESTIMATE DRIFT

Branch additions can lengthen scenario.

Update estimated duration.

---

# 352. SCENARIO ACCESSIBILITY VARIANT

Accessibility fallback must preserve objective when possible.

If speaking objective cannot be equivalent via text:

mark evidence type difference.

P4 decides official equivalence.

---

# 353. NO-AUDIO ACCESSIBILITY

For listening scenario:

text alternative may convert task into different skill.

In practice mode okay.

In assessment mode:

must use approved accommodation policy.

P11 records mode distinction.

---

# 354. SCENARIO ABORT REASON

Optional reasons:

- user exit;
- technical failure;
- timeout;
- unsupported device;
- content error.

Abort is not automatically learner failure.

---

# 355. TECHNICAL FAILURE RECOVERY

If AI/audio/network fails:

resume from same committed state after fallback.

Do not restart learner unnecessarily.

---

# 356. CORRUPT STATE FORENSIC COPY

If state cannot be deserialized:

preserve raw copy/log for debugging when safe.

Then recover/restart.

Never silently delete evidence.

---

# 357. SCENARIO INCIDENT CLASSIFICATION

Possible:

`STATE_CORRUPTION`

`WORLD_CONTRADICTION`

`AI_ROLE_DRIFT`

`HIDDEN_FACT_LEAK`

`BRANCH_DEADLOCK`

`MEDIA_FAILURE`

`SOURCE_STALENESS`

`DOUBLE_EVENT`

`ASSESSMENT_INTEGRITY`.

---

# 358. KILL SWITCH

A broken scenario family should be disableable without disabling entire Russian subject.

---

# 359. DEPRECATION WITHOUT DELETE

If scenario is unsafe/outdated:

remove from recommendation/navigation;

preserve old attempts.

---

# 360. ANALYTICS VERSION SEGMENTATION

Do not compare completion metrics across materially different scenario revisions without labeling.

---

# 361. BRANCH QUALITY REVIEW

Branch should exist because it adds:

- realistic recovery;
- important skill;
- meaningful choice;
- transfer.

Remove decorative branching that only adds maintenance.

---

# 362. TURN QUALITY REVIEW

Counterpart turn should:

- move scenario;
- elicit target;
- reveal appropriate information.

Avoid filler chat.

---

# 363. SCENARIO LENGTH REVIEW

If scenario grows too long:

split into subscenes or family variants.

Do not force 30-turn interaction for one simple objective.

---

# 364. CONVERSATION NATURALNESS REVIEW

Even deterministic turn pool must sound coherent across branch transitions.

P7 validates language.

P11 validates conversation continuity.

---

# 365. BRANCH TRANSITION NATURALNESS

A technically valid state jump can still feel abrupt.

Review:

- discourse continuity;
- role response;
- knowledge continuity.

---

# 366. SCENARIO GOLDEN REPLAY

Maintain fixed replay traces for core scenario families.

After engine/content change:

same semantic actions should reach expected states.

---

# 367. PROPERTY-BASED TESTING

Where tooling supports:

generate valid world values/seeds and assert invariants:

- no impossible state;
- no hidden leak;
- terminal reachable;
- IDs resolve.

Useful for scenario engine quality.

---

# 368. FUZZ INPUT

Test malformed/odd learner input:

- empty;
- very long;
- repeated punctuation;
- wrong script;
- mixed language.

Engine must fail safely.

---

# 369. MIXED-LANGUAGE RESPONSE

Learner may use Russian + Vietnamese/English.

Practice parser can extract intent while feedback encourages target Russian.

Official task policy may differ.

---

# 370. CODE-SWITCH POLICY

Do not automatically fail communication when learner code-switches in practice.

Record language support/quality separately.

---

# 371. SCENARIO CHEATING BOUNDARY

Learner may ask AI counterpart:

“tell me the correct answer.”

Role/assessment policy applies.

Do not expose hidden scoring key.

---

# 372. WORLD-FACT QUERY

Learner can legitimately ask counterpart for information that role knows.

This is not cheating.

Scenario must distinguish:

available world fact

from:

hidden assessment answer.

---

# 373. AUTHORING QA GATE

Before activation, scenario must pass:

- schema;
- state graph;
- world consistency;
- language validation;
- domain validation where required;
- media refs;
- deterministic fallback;
- runtime smoke.

---

# 374. P11 PROMPT COMPLETENESS GATE — HARDENED

P11 prompt is fully hardened only if it covers:

1. scenario semantics;
2. state/event truth;
3. transcript separation;
4. world/role knowledge;
5. hidden facts;
6. branching;
7. reusable components;
8. dependency graph;
9. deterministic fallback;
10. AI hybrid;
11. difficulty;
12. accessibility;
13. offline;
14. persistence/revision;
15. concurrency;
16. analytics/privacy;
17. author preview/debug;
18. branch test harness;
19. incident/deprecation;
20. source/version freshness;
21. personalized project snapshots;
22. golden replay/property tests;
23. P12 authoring contract.

If all are defined:

`P11 PROMPT STATUS: COMPLETE / HARDENED / READY TO EXECUTE`.

**P11 PROMPT HARDENING COMPLETE**