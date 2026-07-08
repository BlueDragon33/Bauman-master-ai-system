# E239 Theory Slide Count Contract

## Rule

- A complete Math theory lesson must contain **at least 16 slides**.
- Sixteen is a minimum baseline, not an exact count and not a maximum.
- Lessons with 17, 22, 30 or more slides are valid when each slide carries a necessary learning beat.
- Approved slides must not be merged or removed merely to silence a count warning.

## E129 compatibility

The first 16 positions may use the preferred E129 role sequence:

1. `problem_framing`
2. `deep_essence`
3. `counter_intuition`
4. `real_bridge`
5. `notation`
6. `core_formula`
7. `assumption_gate`
8. `mini_case`
9. `interpretation`
10. `simulation`
11. `common_mistakes`
12. `application`
13. `practice`
14. `professor_qa`
15. `bridge`
16. `takeaway`

Slides after position 16 may use explicit semantic roles appropriate to their content.

## Validation behavior

- 15 slides: below minimum, warning required.
- 16 slides: valid, no count warning.
- 22 slides: valid, no count warning.
- No maximum slide count is imposed.

## §1.4 accepted count

- Approved source slideshow: 22 slides.
- Runtime import package: 22 slides.
- Mapping: one runtime slide per approved source slide.
- Compression: prohibited for this accepted package.

## Runtime implementation

`assets/theory_skin/theory-min-slide-contract-E239.js` patches the current E129 compatibility behavior narrowly:

- exposes `minimumSlideCount = 16`;
- exposes `maximumSlideCount = null`;
- marks the preferred roles as a baseline;
- permits extended semantic roles;
- removes only the obsolete exact-count warning when count is 16 or greater;
- preserves the below-minimum warning.

This patch does not create a new slideshow engine and does not modify Reader Pro, E235, E236, E237 or E238.
