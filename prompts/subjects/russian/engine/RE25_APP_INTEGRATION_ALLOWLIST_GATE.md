# RE25 — APP INTEGRATION ALLOWLIST GATE

Owners: RU08 + C1 + C3 + C4

Mission: stop before cross-boundary writes and produce the minimum exact allowlist needed for Phase 4 activation.

The gate must distinguish:
- Engine-owned files that may change normally;
- browser-loaded Engine modules;
- existing Russian app owner files;
- service-worker/offline files.

No cross-boundary write occurs in RE25 itself.

PASS when:
- RE21-RE24 PASS;
- exact outside-Engine files and reason for each are documented;
- rollback path is known;
- default rollout remains OPT_IN_FLAG;
- user authorization is explicitly required before any allowlisted app write.
