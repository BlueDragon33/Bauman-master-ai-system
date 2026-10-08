# RE43 — A0 interactive spatial preview (strictly opt-in, noncanonical)

Status: **ENGINEERING_CANDIDATE · NOT_RU03_APPROVED · NOT_DEFAULT_ON**  
Depends on RE42 15-scene spatial proposal; does not modify source r1 Russian fixtures, r1 review packets or human decisions.

## Learner target

User understands **zero Russian**. The software must not ask them to edit Russian grammar or discover wrong Russian themselves.

- Start from clear Vietnamese context and a visible room/store/metro/dorm/university *spatial board*, not a soup of emoji nouns.
- Use separate, physically meaningful markers: room 12, auditorium 12, shower facility, metro system diagram, station entrance and ticket machine.
- Russian sample has opt-in TTS playback and 0.75× slower playback (not verified human-native audio); Cyrillic transcript hidden initially and revealed only on request. On-demand Vietnamese help is immediately available; do not force mistakes to unlock.
- For point-to-location: tap a physical node; a wrong node does not succeed. Success only means correct **candidate simulation**, never actual ability to navigate Moscow.
- For handover-object: select the storage/place first, then the person receiving the object. This is NOT the same as tapping a noun icon.
- For dialogue-intent: provide sample to hear and shadow, **do not pretend to score speech**; full real two-way conversations are RE44.
- Show explicit unverified content status; absolutely no RU03 or RU04 claims, no observation delivery, no parallel mastery storage. Every scenario is pending native review.

## Exact activation

Only via **double opt-in** query:
`subjects/russian/index.html?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate&ruSetting=metro`

The original `ruEngine=grounded-v1` without r2 flag keeps the RE41 existing slice and its 5 quarantines. Default route without either flag remains unchanged.

## Implementation footprint

- One isolated renderer `engine/integration/spatial-candidate-experience.js` selected through lazy import from existing grounded experience, no additional dashboard.
- Explicit `validateSpatialCandidate` structural preflight and candidate interpreter from RE42.
- Five small maps use normalized points, visual labels, connections and native keyboard-focusable DOM buttons, no external dependency or remote media.
- Existing service-worker cache version incremented and the candidate files included in offline precache.
- Tests `test-re43-spatial-browser-contract.mjs` and the source + packaged Playwright `browser-grounded-acceptance.mjs` validate help/audio, a wrong then correct map decision, room vs generic door, no persistent RU04 competence evidence.

## Limits and next phase

No verified Russian translation, pronunciation, actual speech recognition/scoring or two-way conversation yet. Human RU03 review of exact revised Russian content and authentic audio remains compulsory for canonical use. This opt-in demo may be used for engineering acceptance only; enabling by default is forbidden.

RE44 should implement respectful staff/stranger conversation branches and repair phrases (repeat, slower, thank-you), verified bilingual A0 support; RE45 should use qualified human native review with new immutable fingerprints. Production content promotion **blocked** until these checks succeed.
