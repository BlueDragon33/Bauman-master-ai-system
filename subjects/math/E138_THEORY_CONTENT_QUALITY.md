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

A lesson may merge, split or reorder these roles when the content requires it, but should not drop core academic coverage.

## Slide count and depth policy

Future Math theory lessons should be flexible, but not thin:

- normal theory lesson: 14–18 slides;
- deep foundational lesson: 16–22 slides when the topic requires depth;
- below 14 slides only for a clearly secondary/review/micro lesson, and the reason must be documented.

Do not add filler slides just to hit a number.
Do not remove necessary content just to fit a number.
The governing rule is: enough, accurate, necessary.

## Required learner-facing coverage

A theory lesson should normally cover:

- problem framing;
- core concept and intuition;
- notation;
- core formulas;
- assumptions and conditions;
- technical interpretation;
- engineering or AI application;
- common mistakes;
- practice task;
- professor-style checking question;
- bridge to the next concept.

These can be merged or split, but the intellectual coverage must remain complete.

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
