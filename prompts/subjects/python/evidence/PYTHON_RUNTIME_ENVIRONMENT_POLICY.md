# PYTHON04 RUNTIME ENVIRONMENT POLICY
Status: POLICY — version binding pending provider selection.

## Runtime profiles
Official tasks must reference a stable `runtimeProfileId` that resolves to an exact Python implementation/minor version and a reproducible package environment. The current repository has no learner interpreter, so no version is asserted yet.

## Environment identity
Evidence records runtime profile, interpreter version, platform/provider identity, package profile/revision and dataset revisions when behavior can differ.

## Packages
Prefer curated allowlisted environments. Uncontrolled learner `pip install` in shared runtime is forbidden. Package downloads must be bounded, cache-aware and version pinned.

## Determinism
Official tasks declare seed/randomness policy, input files and dataset revisions. Environment drift invalidates exact reproducibility and requires revalidation.

## Offline truth
No offline interpreter is currently proven. Offline fallback is limited to reading, tracing, saved code and deterministic non-execution learning surfaces until a browser-local provider passes security and reproducibility gates.

## Initialization
Large runtimes/packages must lazy-load and must not inflate normal subject startup when coding capability is unused.