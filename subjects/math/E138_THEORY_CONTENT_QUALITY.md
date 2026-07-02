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
- kept exactly 16 slide roles;
- removed note-like labels such as seed/gợi ý/câu hỏi dẫn đường;
- made slides more direct and academic;
- kept formulas as formula/code/text blocks compatible with the current renderer;
- kept engineering applications: server state, network state, robot state, vector metrics, Python/C++ implementation.

## Current lesson roles

1. problem_framing
2. deep_essence
3. counter_intuition
4. real_bridge
5. notation
6. core_formula
7. assumption_gate
8. mini_case
9. interpretation
10. simulation
11. common_mistakes
12. application
13. practice
14. professor_qa
15. bridge
16. takeaway

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
