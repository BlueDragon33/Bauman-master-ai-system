# E132 · Canva Theory Style Guide

Purpose: visual style guide for the Math Theory tab and slideshow. Canva is used as design reference; runtime implementation remains in repository CSS/JS.

## 1. Visual direction

Name: Bauman Academic Tech Deck.

Mood:

- dark engineering classroom;
- clean mathematical hierarchy;
- glass panels and quiet neon accents;
- readable graduate-level content;
- slide deck, not a long article wall.

Avoid:

- crowded dashboards;
- heavy decoration;
- cartoon icons;
- low contrast text;
- long paragraphs inside one slide;
- random gradients without semantic meaning.

## 2. Palette

Use these semantic colors:

| Role | Color idea | CSS token |
|---|---|---|
| Deep background | near-black navy | `--e132-bg-deep` |
| Panel background | transparent navy glass | `--e132-bg-panel` |
| Main text | warm white | `--e132-text-main` |
| Muted text | blue-gray | `--e132-text-muted` |
| Engineering/data | cyan | `--e132-accent-cyan` |
| Formula/structure | violet | `--e132-accent-violet` |
| Lab Work/application | emerald | `--e132-accent-emerald` |
| Assumption/checkpoint | amber | `--e132-accent-amber` |
| Mistake/danger | red/rose | `--e132-accent-red` |

## 3. Typography rules

Slide cover:

- title: very large;
- subtitle: one sentence;
- metadata: small pills.

Theory/body slides:

- one core idea per slide;
- body text should stay under 5 short lines when possible;
- use cards for secondary explanations;
- formulas/code should never sit inside long paragraphs.

Formula/code:

- use monospaced card;
- formula large and centered when possible;
- explanation below in plain Vietnamese;
- do not over-pack derivations.

## 4. Slide layout types

### 4.1 Cover/problem

For role:

- `problem_framing`

Layout:

- big title left;
- small metadata pills: chapterId, lessonId, programLectureId;
- right side has one question card.

### 4.2 Big idea

For roles:

- `deep_essence`
- `interpretation`

Layout:

- one large statement;
- 2-3 supporting cards;
- visual hierarchy over density.

### 4.3 Contrast/warning

For roles:

- `counter_intuition`
- `assumption_gate`
- `common_mistakes`

Layout:

- warning/contrast ribbon;
- left: misconception or condition;
- right: corrected view/checklist.

### 4.4 Formula hero

For roles:

- `notation`
- `core_formula`

Layout:

- formula card centered;
- meaning card below;
- engineering use case chip on the side.

### 4.5 Engineering bridge

For roles:

- `real_bridge`
- `mini_case`
- `bridge`

Layout:

- left: math concept;
- right: Bauman engineering application;
- bottom: why this matters for AI/control/signal/system.

### 4.6 Lab Work

For roles:

- `simulation`
- `application`
- `practice`

Layout:

- task panel;
- code card;
- expected output;
- validation checklist.

### 4.7 Professor Q&A / Takeaway

For roles:

- `professor_qa`
- `takeaway`

Layout:

- professor question block;
- short answer prompt;
- 3-line final takeaway;
- next lesson bridge.

## 5. Reader layout guidance

Non-slideshow reader should keep:

- left chapter tree;
- stage tabs;
- search;
- main reader;
- current chapter metadata.

Improve by adding:

- clearer current lesson card;
- slide preview grid;
- stronger `Trình chiếu` button;
- less repeated metadata;
- distinct treatment for formula/code/lab/QA.

## 6. Canva reference deck outline

Use this 6-slide reference deck when generating or designing in Canva:

1. Visual identity for Bauman Math Theory.
2. Lesson reader layout.
3. Slideshow cover and concept slides.
4. Formula and engineering bridge slide.
5. Lab Work slide.
6. QA and takeaway slide.

This deck is a design reference, not runtime data.

## 7. Runtime mapping

Canva reference -> repo implementation:

| Canva idea | Repo implementation |
|---|---|
| color palette | `theory-ui-tokens-E132.css` |
| slide type | role-based class in `theory-slideshow-E132.js` |
| formula card | `.e132-formula-card` |
| code card | `.e132-code-card` |
| deck layout | `.e132-deck`, `.e132-slide-stage` |
| presentation controls | E132 JS enhancer |
| content | `theory_lecture_content` records |

## 8. Design QA

Before accepting a slide UI:

- Can the title be read in 2 seconds?
- Is there only one main idea?
- Are formula/code blocks visually separated?
- Is Lab Work actionable?
- Does the user know where they are in the lesson?
- Can they exit presentation mode easily?
- Does it still work on laptop width?

End of guide.
