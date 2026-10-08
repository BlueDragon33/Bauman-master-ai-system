# RE44 — Pre-A0 stranger dialogue repair candidate

Status: **AI_DRAFT_PENDING_RU03 · ENGINEERING_PREVIEW · NO_OFFICIAL_SCORING**

## Why this exists

The user is starting from **zero Russian**, and the application, not the student, is responsible for Russian linguistic QA. A conversation requires more than tapping an object icon. The student must practice greeting, polite asking, listening to a human's reply, handling a misunderstanding, finding the right location, and thanking the other speaker.

## Four bounded, noncanonical practice scenes

- Shop assistant: ask where milk is; point to the milk fridge, not cash register.
- Near the metro: ask a passerby where the **entrance** is; point to the entrance, not the map/ticket.
- Dorm manager: ask where the shared shower **room** is; point to it, not any door or showerhead.
- University staff: ask where classroom number 12 is; point to the **lecture room**, not the campus building.

The Russian sentences and TTS samples in `repair-dialogues.r1-ai-proposal.json` are **editorial drafts pending qualified HUMAN RU03 review**, NOT certified usage or native audio. The Vietnamese text in the candidate is situation guidance; do not certify it as final translation.

## Deterministic learner steps

`greet → request → listen → (repair → listen)* → locate → thank → done`

The student can choose `repair-repeat` or `repair-slower`; both require hearing/rehearsing the Russian draft repair phrase before returning to the other party's reply. `locate` only completes for the scene's actual target node. Self-report `shadow` is clearly labelled, never an ASR/phonetic assessment.

The pure state machine always returns:
- `previewOnly=true`
- `authoritative=false`
- `masteryMutation=false`
- `canonicalPublicationReady=false`

No Engine observation submission, no RU04 evidence, no separate learner data, no AI RU03 approvals.

## Entry gate / rollback

Requires **triple opt-in**, never enabled on default page:

`subjects/russian/index.html?ruEngine=grounded-v1&ruWorld=spatial-r2-candidate&ruDialog=repair-v1`

A small lazy-loaded view is inserted through RE43 spatial preview only under the explicit third flag. The service worker includes three tiny new resources with a cache-version bump. No external assets, external services, tracking or backend needed.

Rollback RE44 integration, module, pack, tests and cache entries; no r1 source/RU03 packets affected.

## Acceptance / future

Unit test checks speaker roles, 4 route targets, polite register structure, repair paths, invalid location/re-entrant stage rejections, no mastery and zero fake human approval.

Playwright source and packaged runs verify two repair choices, VN context and hidden script, wrong/right shop position, completion with zero RU04 writes, metro scene switch and default route unchanged.

**Stop before content promotion** until RU03 HUMAN approves each exact Russian line + accepted register/pragmatics, stress, pronunciation, bilingual equivalence and real audio. RE45 should generate the review packet and exact text fingerprint, arrange independent Russian-native editorial/audio review, and then publish only legitimately approved revisions. The user need not personally know Russian to audit these sentences.
