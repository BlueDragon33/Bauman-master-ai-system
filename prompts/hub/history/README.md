# HUB PACKET HISTORY

This directory stores immutable summaries of completed Hub packets so a future session can distinguish historical evidence from the single active `CURRENT_WORK_PACKET.json`.

Rules:
- only `CURRENT_WORK_PACKET.json` may be active;
- an accepted/merged historical packet must never be re-executed implicitly;
- full historical diffs remain available from Git/PR history;
- summaries here preserve packet/execution identity, tested head, merge SHA and stop state.
