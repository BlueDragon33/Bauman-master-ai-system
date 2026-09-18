# CODEX_STATE

Current task: `CONTENT_RESOLUTION_RUNTIME_DELIVERY_FOUNDATION`

Status: `STEP14_FAILURE_INJECTION_GREEN`

Date: 2026-09-18
Branch: `work/foundation-content-resolution-delivery`
Base checkpoint: `540126ba568b73b84cde3efeba02677ac089e437`
Accepted implementation checkpoint: `277d451ded3fa05746e1f6c821bc0ead9d52e8e7`

## Architecture layer

**Foundation — Content Resolution & Runtime Delivery**

Purpose:

- resolve registry-backed content/assets into deterministic runtime resources;
- bind runtime delivery to pinned SHA-256 integrity and access policy;
- expose a reusable verified loader without silently taking learner-state or application authority.

## Completed development

Steps 1–14 are green.

1. Resolution contract and access-trust boundary.
2. Pure resolver runtime.
3. Immutable delivery-plan boundary.
4. Injected verified executor.
5. Same-origin package-relative fetch adapter.
6. Academic core Node shadow parity.
7. Source Chromium shadow acceptance.
8. Packaged Chromium shadow acceptance.
9. Opt-in real-Hub runtime shadow bridge.
10. Pinned Academic core registry promotion candidate.
11. Pinned-checksum runtime shadow.
12. Reusable non-authoritative Academic verified content loader.
13. Opt-in Academic verified-loader authority trial.
14. Failure injection proving checksum/registry failures fail closed with no hidden legacy fallback.

## Current Academic authority

Default behavior remains `legacy_fetch`.

Only `?academicVerifiedLoader=1` activates the verified core-loader authority trial.

The trial is intentionally not the default yet.

## Protected authority

This layer still does not own:

- learner state or mastery;
- Review Queue / SRS;
- schedules or scheduler mutation;
- Hub/subject routing;
- authentication or device authority;
- registry mutation.

## Integrity result

Source and packaged Chromium both prove:

- pinned SHA-256 + byte-length verification;
- no double-load of Academic core files;
- modified bytes are rejected;
- missing registry candidate is rejected before core JSON fetch;
- failures do not silently fall back to legacy core fetching.

## Branch policy

Do not merge to `main` without an explicit promotion decision.

New subject-learning work should use a responsibility-specific branch rather than extending Foundation ownership into subject pedagogy.
