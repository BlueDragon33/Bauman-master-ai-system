# Bauman Foundation — Content Resolution & Runtime Delivery — Step 13 Opt-in Verified Loader Authority Trial Audit

## Goal

Allow a real Academic runtime authority trial without changing default behavior.

## Default behavior

Without `?academicVerifiedLoader=1`:

- `academic-main.js` uses the existing three-way `Promise.all(fetchJson(...))`;
- the verified loader candidate is not called;
- Content Resolution dependencies remain unloaded;
- the pinned registry candidate is not requested.

## Opt-in trial

With `?academicVerifiedLoader=1`:

- the three Academic core JSON resources are supplied by `BaumanAcademicVerifiedContentLoader.loadCore()`;
- the pinned registry candidate is required;
- SHA-256 and byte length are verified before JSON reaches Academic globals;
- there is no silent fallback to legacy core fetch on verification failure.

Prerequisite pack files referenced by the verified manifest remain on the existing loader path in this step.

## Observability

`window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS` records:

- ready;
- mode;
- verified;
- authority;
- candidate status/authority where applicable;
- error.

## Safety boundary

This step does not change:

- learner-state authority;
- scheduler mutation policy;
- Hub/subject routes;
- Subject Bridge;
- Device Access Gate.

## Promotion rule

The trial remains opt-in. Default authority cannot change until source + packaged browser acceptance proves both legacy-default and verified-trial modes on the same head, including exact core request counts and no hidden legacy fallback.
