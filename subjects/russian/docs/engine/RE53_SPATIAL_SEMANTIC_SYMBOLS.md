# RE53 — Semantic, low-clutter preview map symbols

Status: **ENGINEERING PREVIEW, NOT VERIFIED PHOTOGRAPHIC CONTENT · NO HUMAN RU03 APPROVAL**

A targeted user-facing QA pass found misleading generic shapes in the opt-in room/metro/dorm/university preview map. In particular `🚿` could be read as a showerhead instead of a shower *room*, an isolated `12` did not say whether it represented a dorm room or lecture room, `▦` was not clear as a *metro route map*, and `↪` implied a turn rather than an entrance.

Implemented one tiny shared symbol owner `spatial-node-symbols.js` imported by BOTH the spatial lesson preview and social dialogue preview. Meaningful text symbols:
- metro route map `SƠ ĐỒ` vs entrance `Ⓜ`;
- dorm room `P.12` vs lecture room `A.12` vs a door `🚪`;
- shared shower room `P.TẮM` instead of showerhead `🚿`;
- ticket machine `VÉ` remains labeled beneath as `Máy bán vé`.

Symbols are presentation aids. The visible Vietnamese node labels remain the actual meanings and accessible button labels; they must not be treated as substitute realistic pictures, pronunciation evidence, or student skill scores. No extra dashboard cards and no scoring changes. Old fixture worlds, review candidate fingerprints and mastery owners remain untouched.

Both preview modules share ONE symbol owner and SW precaches that tiny file with a new shell cache revision, so offline previews do not 404. Regressions cover unit semantics and source+packaged click/navigation acceptance; no default or production feature enable.
