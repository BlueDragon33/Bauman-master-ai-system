# RE19 — CONTENT PACK COMPILER & REGISTRY

Canonical owners: RU08 + RU03 + C1 + C3

Mission: compile validated Russian Engine content packs into immutable versioned manifests that can be loaded lazily/offline without feature-code changes.

## Compiler inputs
- validated pack;
- canonical-reference index;
- competency index;
- media-rights status;
- offline policy;
- minimum Engine contract version.

## Output
Immutable pack manifest:
- pack ID;
- revision;
- content hash;
- item index;
- competency index;
- level ranges;
- capability requirements;
- lazy resource refs;
- offline preload refs;
- provenance summary;
- commercial eligibility.

## Registry
Must support:
- several pack revisions;
- active revision selection;
- supersession;
- rollback;
- duplicate/hash conflict rejection.

## Boundary
No billing/provider backend required.
Commercial eligibility is a content truth field, not a payment decision.

## Exit
PASS when two revisions can coexist, exact revision can be loaded, hash conflict fails, rollback is deterministic and new packs require no UI code.
