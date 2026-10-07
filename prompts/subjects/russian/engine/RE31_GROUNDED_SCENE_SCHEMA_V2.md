# RE31 — GROUNDED SCENE SCHEMA V2

Owners: RU02 + RU03 + RU05 + RU08

Mission: generalize grounded scenes so new real-life situations are content data, not feature code.

Required fields:
- sceneId, revision, status, setting;
- target competencies;
- semantic targets;
- Russian stimulus;
- entities/objects with visual metadata;
- expected action;
- consequence;
- support policy;
- transfer group;
- capability requirements.

Rules:
- renderer cannot branch on sceneId;
- Russian content authority stays RU03;
- translation hidden by default;
- invalid references fail closed.

PASS when one schema validates scenes from at least five distinct settings without new renderer logic.
