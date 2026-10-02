# RU05 — LISTENING · SPEAKING · AUDIO · DIALOGUE · SCENARIO EXPERIENCE
## Stateful oral interaction and real-world practice

Former source responsibility: P6 + P11.

---

# 0. MISSION

Create one coherent Russian oral-interaction experience layer:

audio input
→ learner response
→ dialogue/scenario state
→ repair
→ task completion
→ evidence.

RU05 merges the former separation between low-level audio interaction and high-level scenario runtime without merging their datasets or owners.

---

# 1. CONSTITUTION ROUTING

Load:

- C1: capability/extension/resource adapter, storage, offline, sandbox;
- C2: resource/lesson UI, accessibility, mobile interaction;
- C3: permissions, concurrency, offline, failure injection, browser/device QA;
- C4: oral evidence, performance tasks, mastery boundary.

Also consume RU03 linguistic truth and RU04 evidence contract.

---

# 2. DATASET ROLES

Keep distinct:

- basic speaking dataset;
- advanced contextual dialogue dataset;
- deep/pressure speaking dataset;
- speaking link/index;
- explicit simulation/scenario data.

Do not merge them into one mega JSON merely because one runtime can coordinate them.

---

# 3. AUDIO SOURCE CONTRACT

Distinguish as applicable:

- authentic recorded;
- pedagogical recorded;
- TTS;
- generated;
- external;
- unknown.

Track provenance.

Do not present TTS as authentic recording.

---

# 4. AUDIO PLAYER

Support where relevant:

- play/pause;
- seek/restart;
- speed;
- segment repeat;
- duration/current time;
- keyboard/touch;
- failure/fallback.

Playback never grants mastery.

---

# 5. TRANSCRIPT POLICY

Explicit states such as:

- hidden;
- after attempt;
- after submit;
- always available;
- accessibility accommodation.

Do not leak transcript/target when the task is spontaneous comprehension/production.

---

# 6. MICROPHONE / RECORDING

Explicit permission lifecycle.

Recording must handle:

- start;
- stop;
- cancel;
- route exit;
- visibility change;
- interruption;
- unsupported browser;
- quota/storage;
- cleanup.

Do not silently upload voice.

---

# 7. SPEECH RECOGNITION

One canonical adapter.

STT transcript is a noisy signal.

It may support rough transcription/keyword/task evidence.

It cannot alone prove pronunciation, stress, intonation or overall speaking mastery.

Engine failure must not mark learner wrong.

---

# 8. PRONUNCIATION PRACTICE

Ground feedback in real detectable evidence.

Target high-value Russian features:

- stress;
- vowel reduction;
- hard/soft;
- consonant contrasts;
- clusters;
- phrase rhythm/intonation.

Never fabricate phoneme-level precision the engine cannot measure.

---

# 9. BASIC SPEAKING

Progression may include:

listen
→ repeat
→ shadow
→ complete/substitute
→ answer
→ roleplay
→ short free production.

Shadowing is practice, not spontaneous mastery evidence.

---

# 10. DIALOGUE STATE

Dialogue runtime owns:

- role;
- turn;
- expected function;
- learner action;
- interlocutor/world response;
- variation;
- misunderstanding;
- repair;
- completion.

UI is not a static transcript viewer.

---

# 11. SCENARIO STATE MACHINE

Separate:

- scenario definition;
- run/session;
- turn;
- world state;
- learner state;
- evidence.

A scenario run may move through:

intro
→ active
→ response
→ consequence/repair
→ success/partial/fail-recoverable
→ debrief.

Exact implementation may vary, but refresh/render must not create progress.

---

# 12. GOAL-BASED SCENARIOS

Success should be outcome-based, not exact-phrase matching.

Examples:

- obtain correct dorm/admin information;
- clarify a deadline;
- solve a transport misunderstanding;
- explain a technical issue;
- present a research result;
- defend a method.

Allow multiple valid linguistic paths.

---

# 13. REPAIR LANGUAGE

Train first-class strategies:

- request repetition;
- ask for slower speech;
- clarify;
- confirm;
- rephrase;
- self-correct;
- spell/write a critical item.

Repair success can be evidence.

---

# 14. PRESSURE LADDER

Increase difficulty through controlled dimensions:

predictable
→ variation
→ ambiguity
→ interruption
→ misunderstanding
→ challenge/follow-up
→ time pressure/defense.

Do not use stress gimmicks for beginners.

---

# 15. AI DYNAMIC TURN BOUNDARY

RU07 may generate temporary NPC wording/variation.

RU05 remains owner of:

- scenario state;
- world facts;
- valid action envelope;
- completion.

AI cannot invent a new world fact and silently mark success.

Provide deterministic fallback where dynamic AI is unavailable.

---

# 16. EVIDENCE TO RU04

Emit observable events/signals such as:

- task goal completed;
- clarification used;
- target function produced;
- repair success;
- critical misunderstanding;
- support/hint level;
- recording/transcript reference where allowed.

RU04/C4 decide mastery.

Separate language failure from:

- STT failure;
- network failure;
- engine failure;
- world/task failure.

---

# 17. REPLAY

Replay creates a new run/attempt identity where required.

Do not overwrite first official run.

Controlled variation should reduce script memorization.

Scenario revision used by an official run should be traceable.

---

# 18. GRAPH VALIDATION

Validate scenario/dialogue graphs for:

- duplicate node IDs;
- unreachable nodes;
- dead ends;
- unintended non-terminating cycles;
- missing exits;
- missing target functions;
- invalid conditional references;
- missing fallback.

Never use arbitrary code eval for content-defined conditions.

---

# 19. OFFLINE / ACCESSIBILITY

Core learning should have text/fallback path when microphone/STT/AI is unavailable, where pedagogically possible.

No critical scenario should require:

- audio-only with no accommodation;
- color-only state;
- mouse-only action.

C2 owns global implementation standards.

---

# 20. REQUIRED OUTPUTS

Maintain:

- oral interaction contract;
- audio/STT capability map;
- dialogue dataset role map;
- scenario state machine;
- event/evidence contract;
- repair strategy framework;
- pressure ladder;
- offline fallback;
- graph validator;
- golden scenario fixtures;
- RU06/RU07/RU08 handoff.

---

# 21. EXIT GATE

PASS when:

- one active recorder/recognizer policy is safe;
- oral engines do not write mastery directly;
- dataset roles remain separate;
- scenario state survives refresh/resume as intended;
- AI outage has deterministic fallback;
- STT error does not become learner failure;
- branch graphs validate;
- replay/official attempt history is preserved;
- representative survival/university/technical/research scenarios pass browser/mobile/offline tests.

**RU05 OWNS INTERACTION STATE. RU04 OWNS LEARNING JUDGMENT.**
