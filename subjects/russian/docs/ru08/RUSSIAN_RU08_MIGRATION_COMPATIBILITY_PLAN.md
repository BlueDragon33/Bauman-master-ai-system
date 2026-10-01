# RU08 Migration & Compatibility Plan

Strategy: **strangler / incremental**.

For every legacy Russian subsystem:

`legacy owner → active RU owner/capability → compatibility bridge → migration → targeted regression → retirement only after proof`.

Protected compatibility:
- R01–R26 stable macro IDs;
- existing learner state is not silently reset;
- P4/P5-era stores remain readable through active RU04 ownership;
- separated speaking/dialogue/deep-speaking datasets remain separate;
- large dialogue/deep-speaking payloads stay lazy;
- Russian Future UI/shared Bauman shell remain platform-owned;
- Device Gate/offline/package behavior remains fail-closed.

Legacy P0–P17 documents remain evidence/history, not active execution topology. PR #180 is superseded by RU08 implementation and must not be merged after RU08.
