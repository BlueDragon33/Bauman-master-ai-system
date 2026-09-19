# Bauman Foundation — Content Resolution & Runtime Delivery — Step 12 Academic Verified Content Loader Candidate Audit

## Goal

Extract the verified Academic core loading path into one reusable, non-authoritative runtime API before changing `academic-main.js`.

## Runtime API

`window.BaumanAcademicVerifiedContentLoader.loadCore()`:

- loads the Content Resolution dependencies lazily;
- loads the pinned Academic core registry candidate;
- validates registry integrity and candidate authority metadata;
- resolves the three content records;
- builds delivery plans;
- fetches package-relative resources through the injected adapter;
- verifies SHA-256 and byte length through the executor;
- parses JSON only after verification;
- returns an immutable verified result.

## No automatic authority

The loader candidate:

- does not auto-run;
- does not write `BAUMAN_CURRICULUM_2026`;
- does not write `BAUMAN_PREREQ_2026`;
- does not write prerequisite pack status;
- does not write learner state;
- does not change routes;
- does not persist the registry.

It is loaded before `academic-main.js` only so a future separately gated opt-in authority trial has a stable API available.

## Why this step exists

The shadow bridge and any future authoritative migration must share the same verified loading implementation.

Without this extraction, shadow and production paths could drift while both tests remain locally green.

## Next step

Refactor the shadow bridge to consume only this loader API. Then browser acceptance must prove source/package parity is unchanged before any opt-in authority trial is added.
