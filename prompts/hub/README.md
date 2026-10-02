# BAUMAN HUB PROMPT SYSTEM

This directory is the canonical **Bauman Hub-only** operating system.

It has exactly two execution planes:

1. **Normal Chat plane** — product/architecture/UX/acceptance controller for ordinary ChatGPT chat.
2. **Codex plane** — repository implementation/testing executor.

They are connected by shared state + explicit handoff files, not by hidden chat memory.

## Scope

Allowed Hub work:
- Hub shell/navigation/layout;
- Overview/dashboard;
- official curriculum projections;
- subject catalog/cards/launch surfaces;
- Roadmap;
- Schedule/Calendar;
- cross-app status/progress aggregation;
- Hub-level Research/Thesis summaries/workspaces;
- Documents/Notes/Search;
- Hub AI context that uses only registered summaries/contracts;
- settings, accessibility, responsive behavior, PWA/offline;
- Hub-side auth/device/control surfaces already owned by this repository;
- QA, migrations, release and production audit for Bauman Hub.

Subject applications are **external bounded systems** from the Hub perspective.

Hub may interact with a subject app only through a registered, versioned API/contract:
- read approved metadata/status/progress/resume/health;
- send approved Hub context/navigation/preferences/sync requests;
- launch/deep-link through an approved launch descriptor.

Hub must not:
- edit lesson content inside a subject app;
- redesign subject pedagogy;
- edit subject quizzes, mastery algorithms, grading engines or subject databases;
- import subject runtime modules into Hub;
- inspect or patch subject private implementation just to make Hub integration work;
- load `prompts/subjects/<subject>/...` while doing Hub work.

If a subject integration is missing, fix or define the **Hub-side contract/adapter** and report the missing external capability. Do not cross the boundary.

## Two-plane connection

`Chat → CURRENT_WORK_PACKET.json → Codex → CURRENT_EXECUTION_RESULT.json → Chat review`

Both planes share:
- `HUB_SHARED_STATE.json`
- `HUB_SCOPE_BOUNDARY.md`
- `api/HUB_SUBAPP_API_BOUNDARY.md`
- `bridge/HANDOFF_PROTOCOL.md`

No subject Master Prompt is part of the Hub load path.
