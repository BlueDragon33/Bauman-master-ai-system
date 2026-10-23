# BAUMAN HUB — CANONICAL MASTER PROMPT

Repository: `BlueDragon33/Bauman-master-ai-system`

Status: CANONICAL DOMAIN AUTHORITY

This is the single durable Master Prompt for the Bauman Hub. Chat, Work and Codex share this authority. Mode-specific START files may specialize execution behavior, but may not redefine Hub architecture, truth semantics or boundaries.

## Authority chain

1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. `prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md` when infrastructure/storage/provider decisions are involved
4. this Master Prompt
5. `prompts/hub/HUB_SCOPE_BOUNDARY.md`
6. `prompts/hub/api/HUB_SUBAPP_API_BOUNDARY.md`
7. `prompts/hub/HUB_SHARED_STATE.json`
8. active work packet/evidence when present

## Canonical learner routes

Exactly five primary routes:
1. Home
2. Roadmap
3. Subjects
4. Schedule
5. Research / НИР & Luận văn

A sixth primary route requires an explicit architecture decision and state update.

## Operating order

Correct → Complete → Consistent → Evidence-backed → Dependency-light → No regression → Optimize last.

Work continuously inside the authorized mode. Internal checkpoints are not stop conditions.

## Data truth

Preserve:
- CURRENT
- STALE
- UNAVAILABLE
- LOCAL_HUB

Never map:
- unknown → 0
- stale → current
- mock/reference → learner truth
- activity/checklist → mastery
- progress → assessment evidence without an explicit contract

## Hub ↔ Subject boundary

Subject integration is:

Descriptor → Capability → Launch Adapter → Normalized Hub Read Model

Forbidden Hub shortcuts:
- subject-private DB/storage/DOM reads;
- subject-private mastery/assessment/pedagogy reads;
- invented endpoints/capabilities;
- Hub-only fixes that modify `subjects/**` or use `prompts/subjects/**` as runtime implementation input.

Missing capability becomes UNAVAILABLE or an explicit blocker.

## Maintainability and premium UX recovery guardrail

The target is **100-level modular capability**, never 100 always-loaded UI layers.
Keep the learner's primary action obvious; progressively disclose secondary dashboards, data, AI, calendar and diagnostics.
Do not create a new Vn/overlay/decorator to fix an older Vn. Consolidate the canonical owner and retire superseded code with regression evidence.
Treat duplicate render implementations, embedded fake learner data, coupled route wrappers, CSS specificity escalation, and increasing critical-path resources as architectural debt.
Every UI change must name its screen owner, report net complexity added/removed, preserve learning/data state, and pass real browser UX acceptance in addition to static CI.
Performance claims require a measured before/after baseline at an exact commit. A merge is not performance acceptance.
Follow `prompts/hub/plans/HUB-UX-RECOVERY-20261008.md` for the phased cleanup; it does not replace the active packet, Constitution, or release authority.

## Work allocation

Default: Chat 90–95%; Codex 5–10% maximum.

- Class A: Chat owns architecture/audit/state/prompt/CI review/small-medium safe implementation.
- Class B: Codex owns deep coupled runtime/refactor/migration/E2E work only after Chat narrows one packet.
- Class C: real external/user authority blocker.

Use `prompts/hub/WORK_SPLIT_CHAT_CODEX.md` for detailed classification.

## State discipline

The state must distinguish:
- prompt/governance review SHA;
- runtime review SHA;
- active packet id/revision/status;
- previous accepted packet/execution;
- blockers;
- next action.

Do not use a self-referential commit SHA as a state invariant. Record the observed main/runtime baseline explicitly.

## Packet discipline

Only one active Hub packet at a time.

For an active packet:
- state packet id/revision/status must match `CURRENT_WORK_PACKET.json`;
- `CURRENT_EXECUTION_RESULT.json` must refer to the same packet/revision while awaiting or executing;
- completed historical packets are not re-executed unless an explicit new packet says so.

## Infrastructure default

LOCAL-FIRST → OFFLINE-FIRST → FREE-FIRST → PORTABLE → OPTIONAL CLOUD.

Managed providers are adapters, not canonical learner truth. Provider failure must degrade only the dependent capability where practical.

## Release discipline

Compilation is not PASS. Merge is not production release.

Release target must be explicit:
- LOCAL_STABLE
- SYNC_STABLE
- PUBLISHED_STABLE
- MANAGED_PRODUCTION_STABLE

No production deployment unless the active packet explicitly authorizes it.

## Mode entry

- Ordinary Chat: `prompts/hub/chat/CHAT_START.md`
- Codex: `prompts/hub/codex/CODEX_START.md`

Legacy `prompts/hub/chat/HUB_CHAT_MASTER_PROMPT.md` is compatibility-only and must delegate here.
