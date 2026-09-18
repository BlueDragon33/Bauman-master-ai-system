# Bauman Foundation — Identity & Domain Model — Step 4 — Legacy Snapshot Extractor + End-to-End Dry Run

## Goal

Read the shape of current legacy runtime state and produce canonical mapping descriptors without mutating or persisting any legacy data.

## Extracted legacy structures

- Russian core route/state
- Learning State: `items`, `reviewQueue`, `resume`
- Learning Flow: `lessons`, per-lesson `steps`
- Vocabulary SRS: `cards`, `sentences`
- Academic Language: `grammar`, `reading`, `writing`
- Host Bridge: `subjectId`, `courseId`, `taskId`, `missionId`

## Identity rules

- Display labels/titles/activity text never become identity.
- Core route identity uses a fixed ordered field list so JavaScript object insertion order cannot change identity.
- Descriptor identity is the tuple `(systemId, scope, legacyId)`.
- Duplicate descriptors are removed deterministically.
- Descriptor sorting is deterministic.

## End-to-end dry run

Synthetic snapshots matching the current runtime shapes are processed through:

`legacy snapshot → descriptor extractor → canonical identity runtime → overlay planner → transactional overlay store`

The dry run verifies that all mappings persist and read back while legacy storage remains byte-for-byte unchanged.

## Safety invariants

1. Extractor is storage-neutral and UI-neutral.
2. Extractor clones inputs before inspection and does not mutate supplied snapshots.
3. Unknown legacy fields are ignored for identity and remain untouched in the original data.
4. Display names are never foreign keys.
5. Every emitted `(systemId, scope)` must exist in the registry.
6. Every descriptor must resolve to a valid canonical ID.
7. End-to-end persistence may write only the two overlay store keys.

## Non-goals

- No automatic browser extraction yet.
- No Russian runtime scripts are edited.
- No semantic aliases are inferred across modules.
- No legacy objects are converted to canonical storage.

## Gate

Step 4 passes only when `FOUNDATION_LEGACY_SNAPSHOT_EXTRACTOR_GATE=PASS` together with all previous L9 gates.
