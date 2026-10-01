# RUSSIAN PROMPT SYSTEM
## Constitution-routed · Subject-specific · Evidence-first · Token-efficient

This directory replaces the **P0–P17 execution topology** for Russian with a smaller subject system.

It does **not** throw away the work in P0–P17.

The old prompt bodies are preserved under `legacy/` as detailed reference material and migration evidence. They are no longer the default execution sequence.

---

# 1. AUTHORITY MODEL

Russian is governed by four global constitutions:

1. `../../constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md`
2. `../../constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md`
3. `../../constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md`
4. `../../constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md`

They are **cross-subject constitutions**.

Russian-specific prompts may specialize them but may not silently contradict them.

Production uses:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

as the detailed operational release annex.

This annex does not create a fifth constitution.

---

# 2. ACTIVE RUSSIAN PROMPTS

The active Russian system contains nine files:

- `RUSSIAN_MASTER_PROMPT.md` — RU00 master entry/orchestrator
- `RU01_FORENSIC_BASELINE.md`
- `RU02_CURRICULUM_CANONICAL_MODEL.md`
- `RU03_LINGUISTIC_AUTHORITY_CONTENT_VALIDATION.md`
- `RU04_ASSESSMENT_MASTERY_ADAPTIVE.md`
- `RU05_LISTENING_SPEAKING_DIALOGUE_SCENARIO.md`
- `RU06_ACADEMIC_TECHNICAL_RESEARCH_PRODUCTION.md`
- `RU07_AI_MENTOR_RUSSIAN_COACHING.md`
- `RU08_AUTHORING_INTEGRATION_ACCEPTANCE.md`

This is a **dependency graph**, not a 100-floor building.

---

# 3. EXECUTION GRAPH

`RU00`
→ `RU01`
→ `RU02`

After RU02 is stable:

`RU03` and `RU04` may proceed in dependency-aware order.

Then:

`RU03 + RU04`
→ `RU05`
→ `RU06`
→ `RU07`

Finally:

`RU05 + RU06 + RU07`
→ `RU08`
→ shared production release annex.

RU03/RU04/RU05/RU06/RU07 may be revalidated selectively when their owners or inputs change.

Do not rerun the entire chain for an isolated change.

---

# 4. TOKEN-EFFICIENT RULE

For each task load only:

1. `RUSSIAN_MASTER_PROMPT.md`;
2. the active `RUxx` prompt;
3. exact constitution sections named by that prompt;
4. current status/evidence/diff;
5. detailed legacy source sections only when a missing edge case requires them.

Never load all four constitutions + all nine Russian prompts + all source archive files by default.

---

# 5. FOUR-CONSTITUTION GATE

A major Russian feature is incomplete if it satisfies three constitutions but violates the fourth.

The router in `RUSSIAN_CONSTITUTION_ROUTER.json` identifies the relevant clauses.

---

# 6. SOURCE ARCHIVE

`legacy/` contains the former P0–P17 prompts.

Use it for:

- clause recovery;
- historical detail;
- migration verification;
- edge-case lookup.

Do not treat it as a second active execution architecture.

---

# 7. VERSIONING RULE

Do not create:

- `RU04_v2.md`;
- `RU04_final.md`;
- `RU04_new.md`.

Patch the same stable file.

Use changelog/history inside the file or repository.

---

# 8. DEFINITION OF SUCCESS

The restructuring is successful when:

- no important P0–P17 responsibility is lost;
- every responsibility has one new owner;
- global architecture/UI/QA/learning rules are not duplicated into every subject prompt;
- Russian-specific semantics remain deep;
- Work/Codex can execute one coherent scope without rescanning the whole prompt estate;
- release still uses exact-RC production verification.


---

# NORMAL CHAT / WORK / CODEX ENTRY

This prompt system is channel-neutral. It may be used from an ordinary ChatGPT chat, ChatGPT Work, or Codex.

For a new ordinary chat, ask the assistant to read only:

1. `prompts/CONSTITUTION.md`;
2. the exact C1–C4 clauses routed by `RUSSIAN_CONSTITUTION_ROUTER.json`;
3. this `README.md`;
4. `RUSSIAN_MASTER_PROMPT.md`;
5. `PROJECT_STATE.json`;
6. the active module prompt;
7. current repository diff/evidence only when repository work is requested.

Chat history is context, not project authority. The repository files above are the durable handoff.

If the task is discussion/planning only, do not pretend repository changes were executed. If the task explicitly asks to modify the repo and GitHub access is available, use the same state/evidence rules.