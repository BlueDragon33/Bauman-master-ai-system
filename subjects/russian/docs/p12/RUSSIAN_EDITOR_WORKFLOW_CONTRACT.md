# Russian P12 Schema-aware Editor Workflow

The P12 editor surface is a contract/CLI workflow, not a second database editor.

Input:
- responsibility;
- canonical ID;
- revision;
- proposed payload;
- source references;
- rollback note;
- diff summary.

Processing:
1. Resolve responsibility through P3 owner registry.
2. Refuse derived/unowned responsibilities as direct canonical targets.
3. Compute deterministic SHA-256 over the proposed payload.
4. Validate lifecycle/provenance requirements.
5. Emit a metadata-only Content Review request envelope.
6. After approval, create/review a normal repository diff against the canonical owner.
7. Run owner-phase validation and CI before merge.
8. Regenerate any derived indexes after canonical changes.

The editor must never persist candidate payload into the control-service database.
