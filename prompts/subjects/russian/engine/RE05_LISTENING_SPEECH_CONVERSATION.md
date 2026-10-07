# RE05 — LISTENING · SPEECH · PRONUNCIATION · CONVERSATION

Canonical owners: RU03 + RU04 + RU05 + RU07

Mission: train perception and production of real Russian speech while preserving honest evidence boundaries.

---

# 1. ORAL NORTH STAR

The learner should progressively:
- hear Russian without mentally reconstructing every written word;
- recognize known meaning under natural connected speech;
- respond before translating;
- speak intelligibly with useful stress/rhythm;
- survive misunderstanding;
- sustain real interaction;
- transfer speech skills to unseen situations.

---

# 2. AUDIO DIFFICULTY LADDER

For the same semantic target, support controlled progression:

A0 — isolated/careful token when pedagogically required;
A1 — careful phrase;
A2 — clear native sentence;
A3 — normal native rate;
A4 — natural connected speech;
A5 — alternate speaker;
A6 — reduced predictability;
A7 — mild environmental noise;
A8 — interruption/overlap;
A9 — multi-speaker;
A10 — spontaneous open response.

Do not expose every target at every tier mechanically.

Use the least support that produces productive struggle.

---

# 3. LISTENING TASK FAMILIES

Support:
- sound discrimination;
- stress discrimination;
- word recognition in context;
- chunk recognition;
- command following;
- semantic choice;
- event ordering;
- gist;
- detail;
- intent;
- attitude/register;
- inference;
- note-taking;
- technical lecture listening;
- multi-speaker discussion.

Transcript policy must be explicit per task.

---

# 4. TRANSCRIPT REVEAL POLICY

States:
- hidden;
- reveal after first attempt;
- reveal after support threshold;
- reveal after submit;
- accessibility always available.

For spontaneous comprehension, transcript must not be visible by default.

Transcript reveal should become an observable support event where relevant.

---

# 5. RECORDING LIFECYCLE

One canonical recording lifecycle:
permission
→ ready
→ recording
→ stopping
→ captured
→ local analysis / optional provider
→ evidence
→ cleanup/retain according to policy.

Handle:
- denial;
- interruption;
- route exit;
- tab visibility change;
- device loss;
- unsupported browser;
- storage quota;
- cancellation.

Never silently upload voice.

---

# 6. PRONUNCIATION SIGNAL HONESTY

Potential signals:
- recognized lexical content;
- timing;
- duration;
- pause structure;
- stress-related acoustic cues where the provider can actually estimate them;
- similarity/confidence from an approved pronunciation provider;
- human/self-comparison artifacts.

Forbidden:
- claiming phoneme precision from plain STT text;
- presenting provider confidence as linguistic truth;
- marking the learner wrong because a provider failed;
- inventing mouth-position diagnosis from unavailable signals.

Every signal should carry capability/source/confidence metadata.

---

# 7. RUSSIAN PRONUNCIATION PRIORITIES

High-value progression:
- stressed vs unstressed vowel awareness;
- hard/soft consonant contrast;
- voiced/unvoiced contrast;
- final devoicing;
- assimilation awareness;
- Ж/Ш/Щ/Ч/Ц families;
- Р;
- Ы;
- consonant clusters;
- word stress;
- phrase stress;
- rhythm;
- intonation;
- connected speech.

Priority is communicative intelligibility plus Russian perceptual accuracy, not cosmetic accent elimination.

---

# 8. SPEAKING PROGRESSION

`LISTEN → IMITATE → SHADOW → CONTROLLED CHANGE → ANSWER → REPAIR → ROLEPLAY → FREE PRODUCTION`

Shadowing is practice.

It is not by itself proof of spontaneous speaking mastery.

---

# 9. RESPONSE LATENCY

Track response latency only as contextual evidence.

A falling latency on known material may signal direct retrieval.

Never incentivize unsafe rushed speech.

Adjust for:
- task complexity;
- device delay;
- accessibility;
- recording startup;
- learner preference.

---

# 10. CONVERSATION WORLD

Conversation must be modeled as world interaction, not a chatbot transcript.

State includes:
- location/context;
- roles;
- goals;
- known world facts;
- hidden information when appropriate;
- current turn;
- relationship/register;
- learner actions;
- consequences;
- repair options;
- success criteria.

---

# 11. GOAL-BASED SUCCESS

Accept multiple valid linguistic paths.

Examples:
- obtain correct train/platform information;
- resolve dormitory check-in;
- clarify a university deadline;
- ask a lecturer to explain;
- explain a device failure;
- present a technical result;
- defend a research choice.

Do not require one memorized sentence if the communicative goal is satisfied naturally.

---

# 12. REPAIR AS FIRST-CLASS COMPETENCY

Train:
- Я не понял / Я не поняла.
- Повторите, пожалуйста.
- Можно помедленнее?
- Что значит ...?
- Правильно я понял, что ...?
- Вы имеете в виду ...?
- То есть ...?
- Let the exact Russian variants be canonical RU03 content, not hardcoded forever in this prompt.

Measure whether repair restores communication.

---

# 13. OPEN CONVERSATION BOUNDARY

AI conversation may vary wording and follow-up turns.

It may not:
- rewrite scenario truth;
- invent hidden requirements;
- grant mastery;
- bypass content safety;
- leak official answer keys.

When AI is unavailable, provide scripted/deterministic fallback for core scenarios.

---

# 14. SPEAKER DIVERSITY

Content planning should allow:
- male/female voices where relevant;
- age variation where appropriate;
- different speaking styles;
- clear and conversational speech;
- multiple speakers.

Do not intentionally train stereotypes.

---

# 15. CONTENT QUALITY

Audio must track:
- source/provenance;
- speaker/voice metadata where available;
- text revision;
- speed/style category;
- licensing rights;
- transcript alignment status.

Generated audio must be labeled in provenance.

---

# 16. PRIVACY

Default voice strategy:
- local processing where practical;
- explicit consent before remote upload;
- shortest retention consistent with the feature;
- delete/export controls;
- no hidden use of voice for unrelated analytics.

Commercial deployment must document provider data handling before enabling cloud speech.

---

# 17. ORAL EVIDENCE

Examples:
- followed instruction;
- understood gist;
- understood detail;
- produced target function;
- maintained turn;
- repair succeeded;
- response required support level Sx;
- pronunciation signal confidence;
- task goal completed.

RU04 decides how evidence contributes to mastery.

---

# 18. FAILURE CLASSIFICATION

Separate:
- learner did not understand;
- learner answer invalid;
- microphone unavailable;
- recording corrupted;
- STT uncertain;
- TTS failed;
- AI failed;
- media missing;
- scenario logic failed;
- network failed.

Only actual learner evidence may affect learner judgment.

---

# 19. RE05 ACCEPTANCE JOURNEYS

At minimum validate:
- beginner listen-and-act;
- short imitation;
- normal-speed known chunk;
- repair after misunderstanding;
- survival roleplay;
- university clarification;
- technical explanation;
- research Q&A;
- AI unavailable fallback;
- microphone denied fallback.

---

# 20. RE05 EXIT GATE

PASS when oral runtime can represent and test a complete progression from grounded listening to open conversation without confusing infrastructure confidence with language mastery.
