# RE09 — APP INTEGRATION · MIGRATION · ACCEPTANCE

Canonical owner: RU08 + C1/C2/C3/C4

Mission: provide the ONLY default RE work package authorized to cross the Engine/App boundary, and only for explicit minimal integration.

---

# 1. AUTHORIZATION

RE09 is not automatically authorized to rewrite the Russian app.

Every RE09 execution must declare:
- Engine version/HEAD;
- exact app files allowed;
- contract being integrated;
- current legacy owner;
- expected learner behavior;
- rollback point.

Anything not listed remains read-only.

---

# 2. STRANGLER MIGRATION

Default:
legacy capability
→ facade/adapter
→ Engine implementation in parallel
→ parity evidence
→ controlled routing
→ regression
→ gradual retirement.

No mass rewrite.

---

# 3. FIRST VERTICAL SLICE

Recommended first slice:

`grounded listen-and-act experience`

Why:
- proves direct-meaning philosophy;
- requires content-as-data;
- exercises experience/interaction/evidence contract;
- can work offline;
- avoids premature AI/backend dependency;
- small blast radius.

Do not begin by rebuilding every current Russian screen.

---

# 4. APP CONTRACT

The Russian app may:
- request next experience;
- render returned experience using shared UI primitives;
- submit learner interaction;
- display Engine state/progress projection;
- invoke support action;
- open conversation/speech capability through approved facade.

The app must not:
- calculate mastery itself;
- edit raw Engine evidence;
- import Engine internals directly;
- bypass provider abstraction;
- hardcode 100-level rules.

---

# 5. DESIGN SYSTEM

Use shared Bauman visual tokens/components.

Russian Engine defines learning semantics and required interaction behavior.

C2/shared app owns visual system.

No independent Russian Engine design system.

---

# 6. MIGRATION OF LEARNER STATE

Before replacing any existing Russian progress/SRS/speaking state:
- inventory current schema;
- map stable IDs;
- preserve history;
- write deterministic migration;
- test round-trip/rollback;
- keep compatibility reader until accepted.

Never reset progress because a new Engine is cleaner.

---

# 7. LEGACY COEXISTENCE

During migration:
- old paths may remain;
- new Engine path may be feature-flagged;
- the same learner event must not be double-counted;
- only one canonical writer per state family;
- analytics must distinguish old/new runtime.

---

# 8. ACCEPTANCE JOURNEYS

Minimum eventual acceptance set:

Beginner:
open Russian
→ receive grounded Russian
→ act correctly
→ get consequence
→ repeat/variation
→ return later
→ state persists.

Listening:
known meaning
→ normal-speed alternate speaker
→ comprehension evidence
→ no forced transcript.

Speaking:
record
→ honest feedback
→ retry
→ no fake phoneme claim.

Conversation:
goal
→ misunderstanding
→ repair
→ successful completion
→ evidence.

Adaptive:
weak item
→ later meaningful review
→ successful transfer
→ queue updates.

100-level:
diagnostic placement
→ level readiness
→ uneven skill profile preserved.

Offline:
launch cached core
→ learn
→ evidence saved
→ optional sync waits.

Multi-profile:
switch profile
→ no state leakage.

---

# 9. RELEASE BOUNDARY

RE09 may produce Russian Engine integration acceptance and RC readiness.

Production still uses shared C3 Release Annex.

RE09 must not claim production success.

---

# 10. ROLLBACK

A release/integration plan must know how to:
- route back to legacy path;
- restore prior content revision;
- disable provider;
- roll back schema when safe or continue forward with compatibility;
- preserve newly created learner evidence.

Rollback must not silently discard legitimate learning activity.

---

# 11. EXIT GATE

PASS when:
- Engine public contract is the only integration seam;
- existing learner history is safe;
- app UI does not own Engine logic;
- shared design remains intact;
- core journey works offline where declared;
- old/new coexistence is controlled;
- acceptance evidence binds exact HEAD;
- production remains separate.
