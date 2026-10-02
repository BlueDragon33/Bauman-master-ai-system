# BAUMAN SHARED PROMPT CONSTITUTION
## Common authority for all Bauman Hub prompts

Repository: `BlueDragon33/Bauman-master-ai-system`

This file is the shared prompt Constitution for Hub, Curriculum and all subjects.

It does **not** replace the repository's enforced Blueprint OS adoption.
The repository-level authority remains:

`.blueprint/constitution-adoption.json`

Current adopted policy at the baseline used to create this structure:
- policyId: `blueprint-os:universal-century-grade`
- policyVersion: `1.1.0`
- blueprintLevel: `B4`
- enforcementMode: `enforced`
- evidenceAuthority: `canonical-quality-gates`
- productionAuthority: `separate-explicit-release-gate`

If this file ever conflicts with a newer repository-enforced adoption, stop and reconcile rather than silently overriding it.

---

# C1 — EXTENSIBLE PLATFORM ARCHITECTURE

Core should become more stable as the product grows.

Prefer, in order where appropriate:

`content → manifest → registry → adapter/provider → capability → extension/plugin`

before modifying Core.

A new subject, resource, PDF, URL, assessment type or add-on should increasingly require registration/configuration rather than a Core rewrite.

Requirements:
- canonical owners;
- stable IDs;
- versioned contracts;
- additive migration;
- backward compatibility;
- no duplicate kernels/registries/engines;
- failure isolation;
- explicit dependency boundaries;
- secrets never embedded in content/prompt data.

---

# C2 — FUTURE PROFESSIONAL UI/UX

Target:

`premium · calm · precise · consistent · responsive · accessible · future-ready`

Rules:
- clarity before decoration;
- hierarchy before density;
- focus before feature count;
- progressive disclosure;
- consistency before local creativity;
- content/learning before visual spectacle;
- reuse the shared Bauman shell, tokens, layouts and component contracts;
- no subject-specific second design system;
- no neon/cyberpunk excess;
- responsive desktop/tablet/mobile;
- visible focus, keyboard support and accessible semantics;
- browser acceptance must test real user journeys, not only element existence.

---

# C3 — PROFESSIONAL QA + AUTO-FIX

Required loop:

`TEST → REPRODUCE → ROOT CAUSE → FIX OWNER → RETEST → REGRESSION → UX REVIEW → WHOLE-SYSTEM VALIDATION`

Rules:
- CI green alone is not PASS;
- fix canonical owner, not a random symptom;
- do not weaken tests to obtain PASS;
- evidence must identify exact HEAD/SHA;
- record blockers/known limitations honestly;
- risky state/runtime changes require rollback planning;
- verify mobile/offline/accessibility/security when relevant;
- no merge/publish claim without evidence.

## C3 Release Annex

Production is a separate explicit gate.

Before publish:
- exact-head validation;
- required CI/tests;
- migration and rollback readiness;
- authority validation.

After publish:
- production SHA verification;
- smoke;
- cache/version verification where relevant;
- observability;
- rollback readiness.

A subject/module may prepare a release candidate; it may not redefine the production release mechanism.

---

# C4 — REAL LEARNING & OUTCOME SYSTEM

Core principle:

**Exposure ≠ Progress ≠ Performance ≠ Mastery**

Learning flow:

`learn → practice → assessment → evidence → mastery → transfer → real output`

Rules:
- clicks, playback, route-open, watch-time or completion are not mastery by themselves;
- content, assessment, evidence and mastery authorities must be explicit;
- plugins/providers emit evidence; they do not grant mastery unless the canonical policy explicitly assigns that authority;
- prerequisites and competency graphs must remain consistent;
- AI may assist, explain, coach and generate temporary practice but cannot silently become canonical truth/mastery;
- learner state/history must not be reset by refactor/migration without an explicit authorized migration.

---

# CROSS-CONSTITUTION RULE

Every major feature must satisfy all four:

`C1 Architecture + C2 UI/UX + C3 QA + C4 Real Learning`

If it passes three and breaks one, it is not done.

---

# COMMON EXECUTION RULES

1. Inspect before modify.
2. Architecture before implementation.
3. Dependency before roadmap.
4. Content as data where practical.
5. Additive migration by default.
6. Preserve backward compatibility.
7. Never claim PASS without evidence.
8. Do not ask for ordinary technical choices inside an authorized scope.
9. Ask only for real external authorization, credentials, irreversible destructive action, or genuinely ambiguous product/pedagogical decisions.
10. Keep one active work stream/branch when practical; avoid proliferating temporary variants.

---

# COMMON TOKEN ROUTER

Default load order:

1. this Constitution;
2. `prompts/PROMPT_REGISTRY.json`;
3. active Master Prompt;
4. active PROJECT_STATE;
5. current HEAD + diff from last validated SHA;
6. impacted owners/contracts;
7. targeted source/tests/evidence only.

Full repository rescans are exceptional, not default.

---

# CHANGE CONTROL

A Master Prompt is a durable source, not a disposable chat message.

Use:
**ONE MASTER PROMPT FILE · CONTINUOUS EVOLUTION**

When changing it:
- patch the same stable file;
- record what changed and why;
- preserve migration notes for superseded behavior;
- update registry/state if ownership or execution order changes.

Subject prompts may specialize domain semantics, but may not create a second platform kernel, second design system, second QA philosophy, second release authority, or second global mastery philosophy.


---

# DETAILED CANONICAL CONSTITUTION LIBRARY

This umbrella Constitution defines the shared authority model and non-negotiable invariants.

Detailed clause-level sources are canonical under:

- `prompts/constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md`
- `prompts/constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md`
- `prompts/constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md`
- `prompts/constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md`
- `prompts/constitution/C3_RELEASE_ANNEX_SHARED.md`

Subject routers may load only the exact clauses they need from those files. Subject directories must not maintain divergent Constitution copies.

This shared Constitution and its detailed library apply equally to ordinary ChatGPT chat, ChatGPT Work, and Codex.
