# L27R2C1 — Toolchain Compatibility Review

## Result

**No historical executable tool is admitted to canonical Roadmap paths as-is.**

That is an intentional quality decision, not a failure.

## Builder / validator findings

Eight historical `roadmap_v2/tools/**` files were reviewed:

- 7 require refactor or replacement before the modern baseline can be regenerated;
- 1 (`validate-prerequisite-graph.mjs`) has no detected historical commit/hash literal, but is still blocked until modern registry/graph artifacts exist.

Key defects in the old toolchain:

- `math-main-e383912-inventory.json` is hard-coded into registry/migration flows;
- baseline validation pins historical commit `e383912...`;
- registry/graph builders pin the historical corrected syllabus SHA-256 directly;
- several tools write directly to canonical generated paths;
- the old orchestration chain writes historical L19 reports;
- a second validator under `scripts/` reads duplicate `docs/roadmap_v2/**` artifacts and is quarantined as obsolete.

## Engine findings

The seven L21–L27 engines are structurally promising:

- read-only/in-memory;
- no detected file/localStorage/network write operations;
- fail-closed;
- hash/manifest validation is present.

However they must **not** be admitted yet because their manifest chain pins historical SHA-256 and byte counts. Engines will be staged only after the toolchain can produce modern manifests.

## Test findings

Seven historical test harnesses are similarly retained as candidates. They directly import the historical engines, so they cannot become current acceptance truth until the dependency chain is modernized.

## Next

R2C2A will create a recovery-only, parameterized toolchain profile. It must write only to recovery/artifact output locations and must never overwrite canonical Roadmap data during validation.

R2C2B will then stage engines/tests against regenerated candidate manifests in disconnected mode.

Production/runtime activation remains forbidden.
