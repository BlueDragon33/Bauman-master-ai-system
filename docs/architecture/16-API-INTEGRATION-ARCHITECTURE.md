# 16 — API and Integration Architecture

## Purpose

Define how browser, Learning Runtime, Control Service, Application Management, subject packages and future extensions communicate without hidden coupling.

## Integration principles

1. Contracts are versioned and explicit.
2. Every integration has one owner and one authority boundary.
3. UI calls APIs; it does not depend on database structure.
4. Subject packages communicate through host/SDK contracts, not parent DOM internals.
5. External integrations are adapters/providers, not domain owners.
6. Retries require idempotency or explicit duplicate protection.
7. API errors are stable machine-readable codes plus user-safe messages.

## API classes

### Public learner runtime APIs
Used by the Bauman runtime for learner-owned operations and protected learning access.

### Protected control APIs
Used by Application Management / authorized operators for device, review and administrative actions.

### Internal extension host APIs
Used by sandboxed extensions to request approved capabilities.

### Import/authoring APIs
Used to stage, validate, preview and publish content packages.

## Contract envelope

Platform APIs should converge toward an envelope that carries:

- contract/schema version;
- request/correlation ID;
- operation result;
- stable error code;
- optional human-safe message;
- relevant canonical IDs.

Do not expose implementation stack traces to learners.

## Idempotency

Commands with mutation risk should carry an idempotency key or expected-state token where appropriate.

Examples:

- device approval;
- content review command;
- publish action;
- evidence submission;
- package import;
- destructive evidence deletion.

## Version strategy

Prefer additive changes inside a compatible API version.

Breaking change process:

`proposal → ADR → parallel version → migration → compatibility window → deprecation → retirement`

## Host bridge evolution

Current `BAUMAN_SUBJECT_BRIDGE_V1` remains valid during migration.

Target evolution:

`legacy bridge adapter → Platform Host SDK → capability/event contracts`

No subject may be forced into a flag-day migration.

## External URL / service integration

An external service never becomes trusted merely because it is embedded.

Define for each integration:

- origin;
- authentication;
- allowed data;
- timeout/retry;
- offline behavior;
- privacy/security classification;
- fallback behavior.

