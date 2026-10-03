# BAUMAN HUB SCOPE BOUNDARY

## Primary learner routes
The Hub owns exactly five primary learner routes: Home, Roadmap, Subjects, Schedule, Research / НИР & Luận văn. Do not create a sixth primary route without an explicit architecture change.

## Ownership rule
Every concern must have one owner and one source of truth. Presentation/decorator layers may project owned data but may not silently become data authorities.

## Data truth states
Every learner-facing value whose freshness or availability matters must be representable as one of:
- CURRENT — current authoritative value is available;
- STALE — previously known value exists but freshness is not guaranteed;
- UNAVAILABLE — the capability/value is not available;
- LOCAL_HUB — user-created/local Hub state owned by the Hub.

Hard prohibitions:
- unknown must not be converted to 0;
- stale must not be presented as current;
- sample/mock/reference content must not become learner truth;
- activity/click/checklist completion must not be called mastery;
- progress must not be called assessment evidence unless an explicit contract says so.

Missing data must be shown honestly, for example 'Chưa có dữ liệu', 'Chưa đồng bộ', or an equivalent unavailable/stale state. A decorative numeric fallback is not allowed.

## Audit dimensions
For every primary page inspect Data, Logic, UX, Architecture and Regression impact. Verify source, freshness, mock/stale fallbacks, duplicate calculations, hierarchy/actions, owner/decorator authority, and direct impact on auth/schedule/search/PWA/responsive behavior.