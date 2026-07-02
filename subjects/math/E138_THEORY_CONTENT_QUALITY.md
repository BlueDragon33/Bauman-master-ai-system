# E138 · Theory Content Quality Pass

Status: applied after E137 stabilized the Math boot and locked the clean Theory learner chrome.

## Goal

Improve the actual learner-facing Theory content without touching the boot/runtime layer.

## Scope

Patched:

- `subjects/math/data/theory_lecture_content.json`

No runtime files were changed.

## What changed

The C01 lesson `§1.1 · Vector như dữ liệu kỹ thuật` was rewritten into a cleaner learner-facing record:

- removed seed/debug notes from the content package;
- kept the E129 source of truth: `theory_lecture_content.json`;
- removed note-like labels such as seed/gợi ý/câu hỏi dẫn đường;
- made slides more direct and academic;
- kept formulas as formula/code/text blocks compatible with the current renderer;
- kept engineering applications: server state, network state, robot state, vector metrics, Python/C++ implementation.

## Slide role policy

The role list below is a teaching skeleton, not a fixed-count requirement:

- problem_framing
- deep_essence
- counter_intuition
- real_bridge
- notation
- core_formula
- assumption_gate
- mini_case
- interpretation
- simulation
- common_mistakes
- application
- practice
- professor_qa
- bridge
- takeaway

A lesson may skip, merge, split or reorder these roles when the content requires it.

## Slide count policy

Future theory lessons should use flexible slide length:

- short focused lesson: about 8–10 slides;
- standard lesson: about 10–14 slides;
- deep foundational lesson: about 14–18 slides;
- longer only when the topic truly requires it.

Do not add filler slides just to hit a number.
Do not remove necessary content just to fit a number.

## Content rule going forward

Future theory lessons should follow the E138 style:

- no debug notes in learner-facing JSON;
- no UI instructions inside content;
- no filler or motivational padding;
- each slide should teach one clear concept;
- formulas stay in `formula` blocks;
- code/tool instructions stay in `code` blocks;
- practice and professor_qa must check actual understanding, not merely repeat text.

## Do not do

- Do not move Theory content to `lessons.json`.
- Do not restore E126/E128/E134.
- Do not add a new reader UI layer just to display content.
- Do not change boot runtime for content-only work.

End of E138 content quality pass.
