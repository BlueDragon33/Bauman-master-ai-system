# PYTHON04 RUNTIME PROVIDER DECISION — LOCAL-FIRST PROFILE

Status: **CANONICAL DEFAULT FOR CONSTITUTION 1.2**

Decision date: 2026-10-06

Supersedes as default: `PYTHON04_RUNTIME_PROVIDER_DECISION.md`

The prior Cloudflare Container decision is preserved as historical/optional-provider evidence. It no longer defines the mandatory Python execution path.

## Decision

Python execution uses a provider-neutral capability contract with this priority:

1. browser/WASM runtime for interactive practice and offline learning;
2. local desktop CPython for full-runtime/native/high-assurance tasks;
3. optional managed sandbox/container for stronger isolation or private hidden evaluation;
4. external runner only as contingency.

No paid managed provider is required for `LOCAL_STABLE`.

## Authority boundary

- Python language/runtime truth remains CPython/specification behavior appropriate to the declared profile.
- The execution provider does not own curriculum, assessment truth, mastery or learner state.
- Provider-specific IDs are not learner-state identity.
- A provider outage must disable only the capability that truly requires that provider.

## Browser/WASM profile

Purpose:
- exercises;
- REPL/code lab;
- deterministic public tests;
- offline practice;
- algorithm/data-structure experimentation where supported.

Requirements:
- worker isolation where practical;
- bounded execution/output;
- explicit supported-package profile;
- no claim that browser-visible hidden tests are confidential;
- deterministic fixture parity for supported semantics.

## Local CPython profile

Purpose:
- full CPython semantics;
- filesystem/process tasks permitted by policy;
- native package/toolchain tasks;
- trusted local high-assurance evaluation when configured.

Requirements:
- explicit runtime version/profile;
- bounded working directory;
- no platform secret injection;
- reproducible fixtures;
- normalized result contract compatible with other providers.

## Optional managed sandbox profile

The existing Cloudflare Container provider remains accepted as an optional high-fidelity provider.

It may be used for:
- private hidden tests;
- stronger shared isolation;
- hosted execution when explicitly desired.

It must not block subject completion when the accepted task profile can be satisfied locally.

## Release profiles

Required Python closure target:
- `LOCAL_STABLE`

Optional extensions:
- `SYNC_STABLE`
- `PUBLISHED_STABLE`
- `MANAGED_PRODUCTION_STABLE`

## Selective revalidation

This architectural change invalidates only provider/runtime assumptions in:
- PYTHON04;
- PYTHON05;
- PYTHON06.

PYTHON01-PYTHON03 remain accepted unless new evidence directly invalidates their academic/assessment contracts.

## Migration sequence

`existing provider facade → browser/WASM provider → local CPython provider contract → parity/security tests → LOCAL_STABLE → optional managed provider retained`

Do not delete the existing Cloudflare implementation until replacement profiles pass the same applicable normalized contract and rollback is proven.

## Google services

Google Drive/Sheets/Apps Script are optional sync/backup/coordination adapters only.

They are not Python execution providers and are not required for `LOCAL_STABLE`.

## Acceptance

The new default may PASS only when:
- browser/local provider behavior is deterministic for its declared profile;
- unsupported semantics fail explicitly rather than silently diverging;
- offline practice journey passes;
- local state survives provider outage;
- export/restore is proven;
- optional managed provider can be disabled without corrupting canonical state.
