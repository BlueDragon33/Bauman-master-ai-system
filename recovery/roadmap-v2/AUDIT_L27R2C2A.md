# L27R2C2A — Parameterized recovery toolchain

## Purpose

Replace the unsafe historical “copy old builders and run them” approach with a recovery-only modern source scanner.

This round deliberately does **not** regenerate canonical Roadmap registry/graph/mapping data yet. It establishes the safe tool boundary needed before R3.

## Tool profile

`toolchain-profile-r2c2a.v1.json` declares the only five source inputs accepted by this scanner:

1. legacy lesson content;
2. current durable theory overlay;
3. theory framework;
4. chapter spine;
5. archived logical Roadmap specification.

The profile pins the source Git blobs accepted by the R1 drift audit. These are current reconciliation anchors, not instructions to revert files.

## Modern baseline facts locked by the profile

- legacy lessons: 347;
- legacy slides: 5,552;
- theory overlay: 18 records / **306 slides**;
- theory framework: 21 chapters / 172 sub-lessons;
- chapter spine: 56 records.

The historical 300-slide overlay assumption is explicitly rejected.

## Write safety

The scanner:

- requires an explicit output path;
- accepts only relative paths;
- rejects parent traversal;
- rejects all output outside `recovery/roadmap-v2/artifacts/r2c2a/**`;
- rejects canonical `roadmap_v2/**` writes;
- never modifies source files;
- uses deterministic key ordering and no timestamps.

## Exit criterion

R2C2A passes only when repeated scans produce byte-identical reports, source fingerprints/counts match the reconciled runtime, invalid output paths fail closed, and all system gates remain green.
