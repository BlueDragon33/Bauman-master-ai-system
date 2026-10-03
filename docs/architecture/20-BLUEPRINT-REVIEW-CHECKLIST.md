# 20 — Blueprint Review Checklist

Use this document for the formal A0 design review.

## Product scope

- [ ] Product purpose is specific enough to reject feature creep.
- [ ] Primary user roles and responsibilities are explicit.
- [ ] Internal learning status is separated from official institutional authority.

## System structure

- [ ] Bounded contexts have owners.
- [ ] Dependency direction is explicit.
- [ ] Forbidden direct dependencies are documented.
- [ ] Core/package/extension boundaries are clear.

## Foundation

- [ ] Canonical identity remains stable.
- [ ] Schema, record and runtime versions are distinct.
- [ ] Registry/capability/event/storage abstractions have clear ownership.
- [ ] Legacy compatibility path exists.

## Data

- [ ] Data classes and lifecycle are defined.
- [ ] Evidence history is protected from semantic rewriting.
- [ ] Migration/idempotency rules are explicit.
- [ ] Delete/export/retention responsibilities are clear.

## Learning

- [ ] Outcome → competency → evidence relationship is explicit.
- [ ] Progress is not mastery.
- [ ] Plugin/AI cannot directly grant protected academic state.
- [ ] Transfer/project/portfolio can be represented.

## UI/UX

- [ ] One App Shell and Design System are the target.
- [ ] Extensions have approved slots/components.
- [ ] Responsive/mobile/accessibility are architecture requirements.
- [ ] Human UX acceptance is mandatory.

## Security

- [ ] Trust zones are explicit.
- [ ] Device Gate remains server-side for protected data.
- [ ] Control secret ownership remains unambiguous.
- [ ] Extension sandbox/data access is explicit.
- [ ] External AI/service data flow is classified.

## API/integration

- [ ] Integration contracts are versioned.
- [ ] Mutation retries are idempotent or protected.
- [ ] Stable errors/correlation behavior is defined.
- [ ] Host bridge has a compatibility migration path.

## Operations

- [ ] Preview/production isolation is preserved.
- [ ] Exact revision promotion is non-negotiable.
- [ ] Rollback/restore responsibilities are defined.
- [ ] Health/telemetry can identify revision/runtime/context.

## Quality

- [ ] P0/P1 block release.
- [ ] Performance/capacity budgets exist.
- [ ] Whole-system and human UX gates exist.
- [ ] Offline claims require actual offline acceptance.

## Migration

- [ ] Strangler strategy is used.
- [ ] First vertical slice is bounded and realistic.
- [ ] No big-bang rewrite is required.
- [ ] Legacy retirement has explicit exit conditions.

## Governance

- [ ] ADR triggers are defined.
- [ ] Deprecation lifecycle exists.
- [ ] Architectural debt can be recorded.
- [ ] No work package is created merely to continue numbering.

## Review outcome

Choose exactly one:

- **PASS** — authorize Wave 1 Foundation planning/implementation.
- **PASS WITH ACTIONS** — no implementation until listed design actions are closed.
- **FAIL** — return to architecture design.
