# L23-F3 — Make historical static-baseline gate forward-compatible

## Trigger

B89 legitimately upgrades only the Diagnostic contract/schema from the historical static admission snapshot.

The old static gate pinned all 23 files byte-for-byte and also required the current canonical tree to equal exactly those 23 files. That would incorrectly reject every valid later round.

## Fix

The static-baseline gate now:

- keeps 21 unchanged historical files byte-exact;
- requires the two Diagnostic files to be current Contract V2 and remain production-disconnected;
- requires all 23 historical baseline paths to remain present;
- allows later current-track canonical JSON artifacts, which must be owned by their own current-round gates;
- continues to forbid executable/UI files in canonical `roadmap_v2/**`;
- keeps the historical migration contract quarantined.

This preserves the historical invariant without freezing the project at L22.
