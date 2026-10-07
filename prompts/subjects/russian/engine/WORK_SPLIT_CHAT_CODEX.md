# RUSSIAN ENGINE — CHAT / CODEX WORK SPLIT

Inherited default: Chat 90–95%, Codex 5–10%.

## Chat-first work
Use ordinary ChatGPT chat / repository connector for:
- prompt architecture;
- scope control;
- state inspection;
- targeted file reading;
- small/medium prompt/data edits;
- contract review;
- issue/PR planning;
- diff review;
- test/log interpretation;
- evidence synthesis;
- merge/release orchestration when authorized.

## Codex-only/deep work
Reserve Codex for narrowly scoped work where repository-scale execution materially helps:
- complex runtime refactor;
- migration touching many coordinated files;
- large typed schema conversion;
- hard-to-localize browser/runtime bug;
- test generation across a changed module;
- performance profiling/refactor;
- deep provider integration.

## Handoff packet
Every Codex handoff must include:
- RE work package;
- canonical RU owner;
- exact HEAD/base;
- exact writable paths;
- forbidden paths;
- problem reproduction;
- desired contract;
- tests to run;
- stop conditions;
- evidence output path.

Never send “improve Russian Engine” as an unbounded Codex task.
