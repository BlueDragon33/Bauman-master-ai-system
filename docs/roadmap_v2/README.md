# Roadmap V2 compact handoff snapshot

The JSON files in this directory are retained as an archived compact compatibility
snapshot from the first Lượt 19 handoff. They are not canonical runtime or loader
inputs.

Canonical, source-reconciled artifacts are:

- registry: `roadmap_v2/registry/roadmap-v2.registry.json`;
- prerequisite graph: `roadmap_v2/graph/prerequisite-graph.json`;
- legacy mapping: `roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json`;
- migration contract: `roadmap_v2/migration/migration-contract.json`;
- validation reports: `roadmap_v2/reports`.

The canonical toolchain lives in `roadmap_v2/tools`. The Lượt 21 sidecar builder copies
only those canonical files and records their SHA-256 hashes in `roadmap_v2/manifest.json`.
