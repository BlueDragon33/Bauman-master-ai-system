# 13 — Evolution and Governance

## Why governance exists

A long-lived platform fails when every new requirement is solved by the shortest local edit.

Governance protects architectural coherence without blocking legitimate evolution.

## Architecture Decision Records

Any important change to:

- domain identity;
- authority boundary;
- public SDK;
- schema compatibility;
- storage ownership;
- security trust boundary;
- deployment topology;
- mastery/evidence semantics

requires an ADR.

ADRs record context, decision, alternatives, consequences and migration/rollback impact.

## Change classification

### Content change
Prefer package/content data. No Core change.

### Adapter/provider change
Add a provider behind an existing capability.

### Extension change
Add isolated capability through SDK.

### Platform capability change
Allowed when multiple domains need a genuinely missing abstraction.

### Core invariant change
Rare. Requires ADR, migration strategy and expanded review.

## Deprecation policy

A public contract is not removed abruptly.

Lifecycle:

`active → deprecated → compatibility period → migration complete → retired`

Published content compatibility must be considered before retirement.

## Technical debt register

Debt should be recorded with:

- location;
- architectural reason;
- risk;
- owner;
- intended removal trigger.

Do not normalize permanent TODOs inside Core.

## Four-constitution review

Every major work package is reviewed against:

1. extensibility;
2. professional UI/UX;
3. QA/auto-fix;
4. real learning/outcomes.

A feature that passes three and violates one is not complete.

## No-number-for-number rule

Do not invent epochs/rounds solely to continue numbering.

A new work package requires a real gap, defect, migration or capability.

