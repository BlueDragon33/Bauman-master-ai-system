# PYTHON04 RUNTIME ENVIRONMENT POLICY
Status: BOUND VALIDATION PROFILE — provider acceptance pending.

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

## Bound validation profile

The baseline discovery found no learner interpreter. The additive disabled
provider now pins CPython 3.14.8 amd64, runtimeProfileId
`cpython-3.14.8-stdlib-v1`, packageProfileId `python04-cf-curated-stdlib-v1`,
with packageInstall=false. Base digest and actual deployed imageId are recorded
in structured results. Dockerfile and provider npm lockfile pin build inputs.
Native local-dev mutable tags are refused. Only the deployed image digest can
satisfy the provider gate. PYTHON02 language truth remains unchanged.

Each run is fresh, with declared text inputs and PYTHONHASHSEED=0; random/time
and external datasets are not declared deterministic. NumPy/Pandas, arbitrary
package installation and official reproducibility claims remain unavailable.
