# RE15 — AUTHORING & CONTENT QA

Canonical owners: RU03 + RU08 + C3

Mission: make large-scale Russian content creation safe enough for a commercial product without hardcoding lessons or allowing generated text to become canonical silently.

## Authoring contract
Every pack/item declares:
- stable ID;
- revision;
- competencies;
- level ranges;
- semantic targets;
- media refs;
- linguistic refs;
- evidence policy;
- support policy;
- provenance/licensing;
- offline policy.

## Validation
Detect:
- missing refs;
- duplicate IDs;
- impossible scenario path;
- orphan graph nodes;
- unknown linguistic authority;
- translation leakage;
- missing accessibility fallback;
- missing commercial media rights;
- unsupported capability;
- content revision drift.

## AI content
Generated content starts noncanonical/unverified.
Promotion requires provenance + review according to RU03.

## Commercial safety
No media/content with unknown commercial rights in sellable packs.

## Exit
PASS when a content pack can be validated, rejected with actionable errors, versioned, and loaded by Engine without feature-code changes.
