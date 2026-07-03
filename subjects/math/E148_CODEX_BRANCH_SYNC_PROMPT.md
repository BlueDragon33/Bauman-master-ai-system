# E148 Codex Branch Sync Prompt

Continue from `CODEX_STATE.md`.

Task: Safely sync the stacked Math content branches into `main`.

Read first:

- `CODEX_STATE.md`
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`
- `subjects/math/E148_SYNC_PROTOCOL_REPORT.md`

Current known branch stack:

1. `main`
2. `codex/e146-merge-c03-l04-l06`
3. `codex/e147-c04-staged-content`

Safe merge order:

1. Merge or fast-forward `codex/e146-merge-c03-l04-l06` into `main`.
2. Then merge `codex/e147-c04-staged-content` into `main`.

Do not:

- merge E147 before E146;
- edit runtime/UI/boot files;
- rewrite `subjects/math/data/theory_lecture_content.json` manually;
- change `lessons.json`;
- change `subject-manifest.json`;
- restore E126/E128/E130/E132/E134 runtime files.

Required verification after branch sync:

- `git status --short`
- confirm `main` contains E146 before E147;
- JSON parse `subjects/math/data/theory_lecture_content.json`;
- verify C01=6, C02=6, C03=6;
- verify no duplicate `lessonId`;
- verify runtime/UI/boot files unchanged except changes already present in the branches being merged;
- update `CODEX_STATE.md` top block with PASS/FAIL and next actor.
