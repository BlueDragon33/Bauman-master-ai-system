# CODEX_TASK

Task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Mode: `FROZEN_PROMOTION_CANDIDATE`

## Canonical plan

Use only:

`subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

for Russian rebuild turn status.

## Current work

All canonical Turns 1–24 are GREEN.

There is no active implementation turn and no justified Turn 25 at this point.

The rebuild is frozen on:

`work/russian-listen-speak-literacy-visual-semantics`

## Promotion boundary

Do not merge to `main` without an explicit promotion decision.

If future QA reveals a defect inside an already accepted responsibility, reopen the owning turn/substep, fix it, rerun its gate and then restore GREEN. Do not create a new turn merely to patch an existing responsibility.

Create Turn 25+ only if a genuinely new responsibility appears that cannot safely fit Turns 1–24.

## Frozen requirements

- Listening/speaking remain the recurring priority.
- Print and handwriting recognition remain distinct.
- Cursive uses 66 distinct OFL-derived vector outlines, not font-only rendering.
- Vocabulary meaning remains direct-semantic; Vietnamese/English translation is not learner semantic authority.
- Dialogue remains translation-free by default.
- AI remains Russian-first/direct-semantic and read-only.
- Skill-gate aggregation remains advisory.
- Weakness repair remains additive and evidence-gated.
- Offline ready remains cache-verified.
- Browser speech failure remains explicit.
- Storage, Review Queue, SRS, Foundation and bridge authority remain unchanged.
- User-facing module identity remains `Tiếng Nga Bauman` without legacy build/version labels.

## Post-freeze rule

Continue auditing the frozen candidate. If a defect belongs to an existing responsibility, reopen/add a numbered substep inside that owning turn, fix it, extend the relevant negative/promotion gate, and restore GREEN. Create Turn 25+ only for a genuinely new responsibility.

Current post-freeze additions accepted: Turn 8.1, Turn 11.1, Turn 11.2, Turn 13.1, Turn 13.2, Turn 18.1, Turn 21.7, Turn 22.7, Turn 22.8, Turn 23.8, Turn 23.9, Turn 23.10, Turn 24.7, Turn 24.8 and Turn 24.9.


## Post-freeze gate status

Turn 24.5/24.8 now include:

- 14 promotion-freeze negative cases;
- stale translation-shortcut rejection;
- dead translation-era helper rejection;
- CI execution of the promotion-freeze negative suite;
- full workflow proof at executable checkpoint `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`, run `35416011837`, with both architecture and existing-regression jobs successful;
- post-freeze gate-regression repairs remain assigned to their existing owning turns.
- CI maintenance is also owned by Turn 23: both workflow jobs now use Node-24-based `actions/checkout@v7` and `actions/setup-node@v7`; run `35416194155` is GREEN.
- Visual-semantics quality audit is owned by Turns 11/13/22: the old 8,000/8,000 “visual ready” result was decomposed into 0 concrete images and 8,000 symbolic `image_emoji` entries; verified Russian-semantic Commons enrichment plus online-only/offline fallback guards are GREEN, with final trusted-host proof at run `35416968142` / `a9a813bb788c23775ee0b55356a27931d8d950c4`.

No Turn 25 is justified by these fixes because none introduces a genuinely new responsibility.
