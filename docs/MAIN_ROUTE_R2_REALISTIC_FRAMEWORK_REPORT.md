# MAIN ROUTE R2 · Realistic framework

## Scope
- Rebuilt `assets/js/data.js` with a cleaner 3-stage route and 4 Bauman semesters.
- Separated self-preparation, preparatory core, preparatory support, official-candidate courses, НИР, ВКР, thesis modules, and support modules.
- Removed misleading broad `official` labels where a current учебный план was not available in the local project.
- Standardized course names and added `confidence`, `routeRole`, and `deliverable` fields.
- Added UI labels via `courseTypeLabel()` and `confidenceLabel()` so cards show whether an item is self-study, candidate, НИР, ВКР, or thesis support.

## Main principle
If a course cannot be verified from a current official study plan inside the project, it is marked as `official_candidate` or a support module instead of being presented as guaranteed official.

## Route skeleton
1. Vietnam: Russian-first self-preparation; math/programming/AI are support.
2. Preparatory year: Russian and foundation subjects are core; technical content is light support.
3. Bauman: candidates for formal coursework in HK1-HK2; НИР deepens in HK2-HK3; ВКР and practice dominate HK4.
