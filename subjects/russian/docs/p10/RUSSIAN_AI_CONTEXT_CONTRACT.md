# Russian P10 AI Context Contract

Canonical context is read-only and may include:
- active route/stage/lesson;
- resume pointer;
- due-review count/reason codes;
- lesson evidence summaries;
- vocabulary/speaking/academic context;
- canonical foundation identity/context;
- P8/P9 content identifiers when available.

Forbidden context behavior:
- direct setters into RussianLearningState;
- direct mastery writes;
- direct review queue mutation;
- hidden task completion;
- using transient model text as canonical content.

The runtime owner remains `assets/ai-mentor-guard.js`; P10 adds policy authority without introducing a duplicate runtime.
