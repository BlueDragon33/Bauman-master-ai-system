# Russian P1 Accessibility Baseline

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Confirmed static strengths
- Search input has combobox/listbox ARIA wiring.
- Main modal declares `role="dialog"`, `aria-modal="true"`, has a labelled close button and a focusable modal card.
- `core.js` implements Escape close, Tab focus trapping, focus restoration and several focus handoffs.
- Dynamic assessment/question controls contain multiple `aria-label` attributes.
- Future UI mobile navigation maintains `aria-expanded`, Escape close and focus restoration.
- SVG handwriting path output has role/label semantics.

## Unproven / pending runtime evidence
- Full keyboard-only journey: open app → navigate → lesson → audio → answer → modal close.
- Actual focus order on every route.
- Screen-reader output quality.
- Contrast of computed foreground/background pairs.
- Font scaling and 200% zoom.
- Touch-target dimensions across all required viewports.
- Transcript accessibility under assessment reveal constraints.
- Reduced-motion behavior: no explicit JavaScript-level reduced-motion policy was found in the scanned runtime; CSS/runtime browser evidence is still required.

## Status
`VALIDATING` until P1 Playwright artifacts and route-level keyboard checks are inspected.
