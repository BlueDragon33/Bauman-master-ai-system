# Russian Engine — RE40 AI linguistic pre-review (advisory only)

Status: **AI_ADVISORY_ONLY · NOT_RU03_HUMAN_APPROVAL**

Source audited: `subjects/russian/engine/content/fixtures/real-life-scenes.v1.json` (`real-life-v1-r1`), cross-checked against `real-life-scenes.review-packets.v1.json` and `grounded-experience.js`.

Scope: all 15 scene IDs `rl-01-room` through `rl-15-university`.

**Important:** This document is an editorial/linguistic proposal prepared by an AI, **NOT** a decision from a HUMAN RU03 reviewer. No `APPROVE`, `RU03_APPROVED`, `VERIFIED`, publication, fixture rewrite, or modification to human review decisions is permitted based on this advisory alone. Source revisions and fingerprints remain unchanged.

## Overall findings

- Most surface utterances are **grammatically possible**, but that alone does not imply suitability for an adult learner in Russian society.
- `Дай ...` is a **ты** singular imperative, appropriate with a familiar peer if context allows. It is not the neutral polite form to teach as a first default for staff/strangers; contrast `Дайте, пожалуйста, ...` and suitable `Можно ...?` requests.
- The app currently asks many `Где ...?` location questions but grades a `select-object` icon. That principally measures noun association, not where the object/place is situated. For a real location task, expose a map/room/shelf/door position and let the learner indicate that place. For a pure image-noun task, choose `Покажи ...` / `Найди ...` instead of `Где ...?`.
- On success, the grounded browser renderer displays the chosen icon inside the requester box for **all** scenes; that is plausible for `Дай ...`, but semantically wrong or at best misleading for `Где ...?`. Use a highlight/point/route marker as a location consequence, not transfer-to-requester.
- In `rl-11-dorm`, `комната` (room) is answered by `door` (дверь): a significant lexical/semantic mismatch.
- `карта` in metro setting can mean a map, an access/transit card or a payment card; the expected picture `🗺️` must be clarified as `схема метро` for a route map.
- Grammar/text alone cannot certify pronunciation, stress placement, connected speech, speaker naturalness or TTS audio quality. Audio recording and qualified speaker review are separate requirements.

## Individual assessment

| Scene | Current Russian | AI assessment | Recommended teacher-facing decision for human consideration | Suggested surface/context change |
|---|---|---|---|---|
| rl-01-room | `Дай мяч.` | Grammatically correct; blunt or neutral among close peers depending on tone | KEEP_WITH_CONTEXT | Friendly peer in shared room: `Дай, пожалуйста, мяч.` Optional direct imperative retained at earliest action-learning level. Explicit recipient handover. |
| rl-02-room | `Дай книгу.` | Grammatically correct; familiar-peer only | KEEP_WITH_CONTEXT | `Дай мне, пожалуйста, книгу.` if modelling an ordinary peer request. Explicit book handover. |
| rl-03-room | `Где чашка?` | Correct, natural if someone is seeking a cup; current icon-click does not assess location | CHANGE_INTERACTION | Keep `Где чашка?` with cup on a shelf/table and require pointing to its *location*; alternatively use `Покажи чашку.` for icon identification. |
| rl-04-shop | `Где хлеб?` | Understandable natural shorthand, but too bare as a default customer-to-clerk model | REVISE_CONTEXT | For asking staff: `Подскажите, пожалуйста, где хлеб?` Keep short `Где хлеб?` for self-directed in-store search; make learner identify correct shelf/aisle. |
| rl-05-shop | `Дай воду.` | Grammatically correct but socially inappropriate as a first default for unfamiliar shop staff | REVISE_SURFACE_HIGH | `Дайте, пожалуйста, бутылку воды.` (request an actual bottle) or `Можно бутылку воды, пожалуйста?` In a friendly room the original can be kept with another context. Replace abstract `💧` with a water bottle if selling a bottle. |
| rl-06-shop | `Где молоко?` | Grammatically correct, commonly understood; context-dependent politeness | REVISE_CONTEXT | `Подскажите, пожалуйста, где молоко?` to staff; learner points to the fridge/shelf containing milk. |
| rl-07-metro | `Где билет?` | Natural when searching for one's particular missing ticket, not when asking where tickets are sold | REVISE_INTENT | Lost ticket: `Где мой билет?` + locate actual ticket. Buying: `Где купить билет?` + find ticket machine/counter, not ticket icon. |
| rl-08-metro | `Где карта?` | Correct in some contexts; ambiguous between map and transit/payment card | REVISE_SURFACE_HIGH | For `🗺️`: `Где схема метро?` or `Покажи схему метро.` For transport card, specify `Где карта «Тройка»?` with card image. |
| rl-09-metro | `Где метро?` | Conversationally plausible outside station, odd *inside* a metro setting; icon-click only recognizes symbol | REVISE_SETTING | Set scene `street-near-metro`; `Подскажите, пожалуйста, где ближайшая станция метро?` (or `Где вход в метро?`). Destination/entrance marker required. |
| rl-10-dorm | `Где ключ?` | Correct and natural when a particular key is missing | KEEP_WITH_CONTEXT | `Где ключ от комнаты?` for dorm context; place physical key at a recoverable location. |
| rl-11-dorm | `Где комната?` | Surface grammatical, but vague; expected answer `door` is *incorrect* semantic equivalence | REVISE_HIGH | `Где моя комната?` / `Где комната номер 12?` and show the room or a correctly identified room entrance with room number; don't mark generic `door` as `комната`. If targeting a door noun use `Где дверь?` in a different legitimate context. |
| rl-12-dorm | `Где душ?` | Grammatically fine; colloquial; for shared facilities the room noun is more precise | REVISE_CONTEXT | `Где душевая?` / `Подскажите, пожалуйста, где душевая?`, point to a shower room location, not a shower gadget alone. |
| rl-13-university | `Где аудитория?` | Correct but vague if there are many lecture rooms | REVISE_CONTEXT | `Подскажите, пожалуйста, где аудитория номер 12?` or a specified number matching a labelled room marker. Generic `🏫` suggests a whole school, not a lecture room. |
| rl-14-university | `Где библиотека?` | Correct, natural, context-complete enough | KEEP_WITH_CONTEXT | Can retain. To train polite interaction: `Подскажите, пожалуйста, где библиотека?` with map or corridor location selection. |
| rl-15-university | `Дай тетрадь.` | Grammatically correct between close peers; can sound demanding to strangers | KEEP_WITH_CONTEXT_OR_REVISE | Friendly classmate: `Передай, пожалуйста, тетрадь.` or `Дай мне, пожалуйста, тетрадь.` Staff/shop: `Можно тетрадь, пожалуйста?` Explicit transfer/handover. |

## Recommended lesson architecture

Distinguish three tasks that must not be scored interchangeably:

1. **Find an object by hearing its name**: `Покажи чашку.` → `select-object(cup)` → visual identification only.
2. **Give an object after hearing a request**: `Дай, пожалуйста, мяч.` → `transfer-object(ball, requester)` → visible transfer and reaction.
3. **Find a location**: `Где чашка?` → `point-to-location(shelf-2)` → visual cue/route highlight; optionally a follow-up `Чашка на столе.`

Keep the original Russian-first/translation-last teaching strategy, but teach a `ты`/ `вы` register contrast as soon as scenes involve store clerks, dorm administrators, lecturers or strangers.

Example meaningful mini-dialogue in the shop:

- `Здравствуйте. Подскажите, пожалуйста, где молоко?`
- `В холодильнике справа.`
- learner points to **the correct fridge, on the right**;
- `Спасибо!` — `Пожалуйста!`

Example dorm repair skill:

- `Извините, где душевая?`
- `В конце коридора, направо.`
- learner selects **end of corridor → right**, not a shower emoji;
- if misunderstood: `Повторите, пожалуйста.`

### Pronunciation/stress hints (editorial; not canonical audio)

`кни́гу`, `ча́шка`, `во́ду`, `молоко́`, `биле́т`, `ка́рта`, `метро́`, `ко́мната`, `аудито́рия`, `библиоте́ка`, `тетра́дь`, `душева́я`.

Stress-marked editorial annotations must remain separate from learner-facing TTS/source audio. Verify sound, reduction, intonation, accepted lexical variants and recording provenance before canonical promotion.

## Human RU03 gate — unchanged

- Original fixture revision: `real-life-v1-r1`.
- Review packets: 15.
- AI recommendation: **do not blanket-approve**; make scene-specific edits or document accepted register/context before human decisions.
- Actual `RU03 HUMAN APPROVE` decisions: **0**.
- Human reviewer must inspect revised revision/fingerprint and choose `APPROVE`, `CHANGES_REQUESTED` or `REJECT`.
- No canonical compiler output or publication is authorized by this file.
- Revision change to surface/world/action requires regenerating fingerprints/review packets; stale decisions remain invalid.

## Language usage references (editorial)

- Gramota.ru: imperative forms `дай/дайте` — https://gramota.ru/spravka/vopros/280599
- Gramota.ru: modern polite Russian requests — https://gramota.ru/journal/stati/zhizn-yazyka/mozhno-pozhaluysta-prisest
- Gramota.ru: `душевая` denotes a room where showers are located — https://gramota.ru/poisk?query=%D0%B4%D1%83%D1%88%D0%B5%D0%B2%D0%B0%D1%8F+%D0%BA%D0%B0%D0%B1%D0%B8%D0%BD%D0%BA%D0%B0&simple=0
