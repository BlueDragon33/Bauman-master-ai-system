# Math Learning Application Rebuild — LƯỢT 11 Example + Application Gate

## Goal
Keep examples and applications inside the lesson flow and enable active-learning behavior only when source structure supports it.

## Content coverage
Current theory content audit:
- theory lessons: 18
- lessons without an Example semantic step: 0
- lessons without an Application semantic step: 0
- example slides: 21
- application/engineering-link slides: 38

## Semantic DOM
E129 previously flattened slide blocks into generic headings/paragraphs without retaining role/block identity in the DOM.

The renderer now preserves:
- `data-e129-slide-role`
- `data-e129-block-index`
- `data-e129-block-type`
- block title/body part metadata

This does not change academic content. It lets learner UX respond to source structure safely.

## Progressive reveal for examples
For Example slides with two or more blocks:
1. show the first source block;
2. allow the learner to open one additional block;
3. allow full reveal;
4. allow returning to the first-block view.

The system does not claim that an arbitrary block is a “hint” or “solution”. Controls use neutral reveal language because current source blocks do not carry explicit hint/solution semantics.

For single-block examples no fake reveal controls are created.

Current coverage:
- multi-block examples eligible for progressive reveal: 9
- single-block examples left unchanged: 12

## Applications
Application remains a normal lesson step. It navigates to the mapped application/engineering slide within the same lesson context rather than a peer application library.

Historical specialized roles such as `linear_interface` and `deployment_preprocessing` are normalized into the Application learner step without rewriting the academic role labels.

## Gate
- Lesson Player JS syntax: PASS
- E129 renderer JS syntax: PASS
- 18/18 lessons contain example mapping: PASS
- 18/18 lessons contain application mapping: PASS
- E129 semantic slide/block metadata: PASS
- progressive reveal only on structured multi-block examples: PASS
- single-block examples not fabricated: PASS
- Lesson Player CSS `!important`: 0

## Result
**PASS**

Next: LƯỢT 12 audits simulations. A simulation may be contextual only when it maps to the current lesson and teaches a specific concept; a generic lab must not masquerade as a lesson simulation.
