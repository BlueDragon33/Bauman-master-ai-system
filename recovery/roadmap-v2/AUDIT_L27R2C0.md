# L27R2C0 — Toolchain / Data / Test Admission Audit

## Why R2C is split

Historical L27 contains far more than executable engines. It also contains generated inventories, registry/graph/mapping artifacts, seven hash-pinned manifests, old migration artifacts, reports, builders, validators and tests.

Copying all of them into the modern canonical tree at once would reintroduce the historical baseline `e383912...` and stale SHA-256/byte-count assumptions.

R2C is therefore split into controlled sub-rounds.

## Inventory result

Historical canonical `roadmap_v2/**` surface: **75 files**, fully classified:

- 23 already admitted static contracts/schemas from R2B;
- 7 engine candidates;
- 8 builder/validator candidates;
- 7 stale hash-pinned manifests;
- 24 baseline-bound/generated artifacts;
- 4 deferred registry/graph/migration schemas;
- 2 historical state/spec documents.

External historical Roadmap support adds:

- 1 validation wrapper;
- 7 test harnesses;
- 1 CI workflow.

## Admission policy

### May be reviewed next

Portable builders/validators can proceed to R2C1 only after checking for:

- hard-coded `e383912...` baseline;
- old filenames/paths;
- destructive output behavior;
- assumptions about the 300-slide theory overlay;
- assumptions that migration artifacts are already canonical.

### Must remain quarantined

- all seven historical manifests;
- baseline inventories;
- generated registry/graph/mapping data;
- diagnostic catalog;
- migration contract and mapping;
- historical acceptance reports as executable truth.

These artifacts must be regenerated or re-pinned in R3 against the modern baseline.

### Engines and tests

The seven engines and seven historical tests are not admitted yet. Their dependency chain terminates in manifests/generated sidecars whose hashes are stale. R2C2 will stage them only after R2C1 establishes safe toolchain behavior.

## Safety

R2C0 adds no new canonical Roadmap files and changes no runtime, UI, learner state, storage, offline behavior or packaging.
