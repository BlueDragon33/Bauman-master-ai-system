# Russian Handwriting Listen+Write — Current State

- Track: **RHW1 → RHW7**
- Current round: **RHW7 · TERMINAL COMPLETE**
- Current step: **RHW TRACK TERMINAL CLOSEOUT · COMPLETE**
- Status: **RHW1_COMPLETE · RHW2_COMPLETE · RHW3_COMPLETE · RHW4_COMPLETE · RHW5_COMPLETE · RHW6_COMPLETE · RHW7_COMPLETE · S01_S38_COMPLETE · RHW7-F1_PASS · RHW7-F2_PASS · RHW7-H1_PASS · TERMINAL_MARKER_PASS · RHW_TRACK_COMPLETE**
- Roadmap V2 L35 remains complete and is not renumbered by this feature track.
- Runtime handwriting audio wiring: **RHW2 implementation active**
- Expansion factory: **RHW6 complete; RHW7 real-lesson expansion complete**

## Current scope

RHW1 establishes the reusable learning/data contract for listen+write. It does not yet change the visible handwriting runtime.

Next after S05 gate PASS: open RHW2/S06 reusable pronunciation service and bind it to the 33 alphabet items.

## RHW1-F1 — development-branch CI coverage

The new listen+write validator was initially wired into the Russian gate, but the gate only ran on `main` pushes or PR events. The stabilization branch now explicitly runs Russian Reference UI, Whole System Integration, Windows checkout, Cloudflare Preview and Foundation gates on push. S05 requires the first complete green head after this repair.

## RHW1 accepted gate evidence

Accepted head: `7ef419f90ea2d5460a92c1204890d4524017c2b4`

- Russian Reference UI Gate — run `35549808200` — PASS
- Windows checkout safety — run `35549808281` — PASS
- Roadmap V2 Current Gate — run `35549808287` — PASS
- Bauman Cloudflare Preview CI — run `35549808294` — PASS
- Foundation Domain Model Gate — run `35549808195` — PASS
- Whole System Integration Gate — run `35549808241` — PASS

RHW1 is closed. RHW2 may wire the accepted contract into the handwriting runtime.

## RHW2 implementation summary

- S06: reusable `speakHandwriting()` service over the existing Russian `SpeechSynthesisUtterance` path.
- S07: handwriting card now exposes letter-name and contextual example playback.
- S08: normal/slow playback plus active-button state and rapid-play cancellation.
- S09: speech-unavailable fallback leaves trace/free writing fully usable.
- S10: dataset/runtime validator is wired into Russian Reference UI Gate.

The 33-letter dataset is separate from `handwriting.json`, so existing handwriting samples remain unchanged.

## RHW2-F1 — legacy RHW1 validator signature drift

First RHW2 revalidation failed in Russian Reference UI Gate run `35550058470` at the RHW1 contract validator. The validator matched the exact legacy function signature `speak(text,rate=.85)`; RHW2 legitimately extends it with optional callbacks to track playback state. F1 makes that assertion forward-compatible while retaining the required SpeechSynthesis primitive, Russian locale fallback and the rule that schema/contract files themselves are not directly wired into runtime.

## RHW2 accepted gate evidence

Accepted head: `1912452c13997823f9bff5d0d9681ebfe436e580`

- Russian Reference UI Gate — run `35550125885` — PASS
- Windows checkout safety — run `35550125926` — PASS
- Roadmap V2 Current Gate — run `35550125932` — PASS
- Bauman Cloudflare Preview CI — run `35550125882` — PASS
- Foundation Domain Model Gate — run `35550125887` — PASS
- Whole System Integration Gate — run `35550125890` — PASS

RHW2 is closed. RHW3 opens the interactive listen+write exercise engine.

## RHW3 implementation summary

- S11: nghe tên chữ → chọn đúng mặt chữ, 33/33 chữ có 3 lựa chọn xác định.
- S12: nghe → tô/viết trên canvas; đáp án chỉ mở sau khi người học xác nhận đã viết.
- S13: nghe âm tiết → viết/gõ để đối chiếu.
- S14: nghe chính tả từ → viết/gõ, vẫn có thể viết tay trên canvas.
- S15: 13 drill trọng âm + 10 drill phân biệt âm/chính tả, gồm các trường hợp khó như Ё/Е, Ы/И, Ъ/Ь.
- S16: kiểm tra đáp án Unicode xác định, giữ phân biệt Ё/Е; không dùng OCR/AI để chấm nét tay.

## RHW3-F1 — choice interaction wiring

Pre-gate self-audit found rendered hear-select choice buttons were missing their click-state binding. The `data-hand-choice` handler was added before RHW3 acceptance testing.

## RHW3-F2 — validator scope repair

The first RHW3 gate failed because the validator searched all of `core.js` for an unrelated legacy `ё→е` normalization and expected separate literal assignments for correct/wrong. F2 scopes the orthography assertion to `normalizeHandwritingAnswer()` and validates the actual deterministic ternary comparison used by the RHW3 engine. Runtime behavior is unchanged.

## RHW3 accepted gate evidence

Accepted head: `fc62e1a4b72470a399f0e10052bbad892ed042b3`

- Russian Reference UI Gate — run `35550524271` — PASS
- Windows checkout safety — run `35550524318` — PASS
- Roadmap V2 Current Gate — run `35550524336` — PASS
- Bauman Cloudflare Preview CI — run `35550524266` — PASS
- Foundation Domain Model Gate — run `35550524267` — PASS
- Whole System Integration Gate — run `35550524291` — PASS

RHW3 is closed. RHW4 may persist learner-owned listen/write practice state in the existing local subject state store.

## RHW4 implementation summary

- S17: tiến độ nghe-viết lưu theo từng chữ và từng loại drill; chỉ ghi nhận sau hành động kiểm tra/đối chiếu.
- S18: hàng đợi thích ứng xếp chữ sai nhiều/vừa sai lên trước, sau đó mới đến chữ chưa luyện.
- S19: 4 chế độ Học / Luyện / Chính tả / Ôn lỗi với bộ drill riêng.
- S20: giữ nguyên bố cục handwriting-first, audio/progress nằm trong bảng trái và bài nghe-viết nằm ngay trên canvas.
- S21: trạng thái lưu bằng local subject state hiện hữu, có resume sau reload; validator cấm tiến độ ngẫu nhiên/giả lập.

## RHW4 accepted gate evidence

Accepted head: `cf1f9f61cfdd13b25672b6fc53bf632ecca018e7`

- Russian Reference UI Gate — run `35550703743` — PASS
- Windows checkout safety — run `35550703754` — PASS
- Roadmap V2 Current Gate — run `35550703707` — PASS
- Bauman Cloudflare Preview CI — run `35550703691` — PASS
- Foundation Domain Model Gate — run `35550703709` — PASS
- Whole System Integration Gate — run `35550703696` — PASS

RHW4 is closed. RHW5 begins pilot hardening and closeout.

## RHW5-F1 — offline core coverage

Whole System run `35551006682` exposed that the new listen-write dataset was not part of `RussianRuntimeOptimizer` CORE_DATA/LIGHT_DATA, so offline readiness could be incomplete for handwriting listen-write. F1 adds `handwriting-listen-write` to both lists, updates offline acceptance to execute `prepareOfflineCore()` before disconnecting, and requires the data cache to contain `handwriting-listen-write.json`.

RHW5 browser acceptance now covers rapid audio cancel/replay, normal/slow rates, speech-unavailable fallback, canvas interaction during audio, answer locking, deterministic grading, keyboard behavior, mobile layout, source runtime and packaged runtime.

## RHW5 functional gate evidence

Accepted functional head: `1d0b95cad4a1715d2610d92c2a6a4a37f6f08606`

- Russian Reference UI Gate — run `35555061497` — PASS
- Windows checkout safety — run `35555061465` — PASS
- Roadmap V2 Current Gate — run `35555061482` — PASS
- Bauman Cloudflare Preview CI — run `35555061478` — PASS
- Foundation Domain Model Gate — run `35555061489` — PASS
- Whole System Integration Gate — run `35555061524` — PASS

S27 final-state marker is revalidating. RHW6 remains blocked until S27 passes 6/6.

## RHW5 final marker gate evidence

Accepted final marker head: `ccce7afe176911ed57c61f92d585e239435943e4`

- Russian Reference UI Gate — run `35555348806` — PASS
- Windows checkout safety — run `35555348885` — PASS
- Roadmap V2 Current Gate — run `35555348784` — PASS
- Bauman Cloudflare Preview CI — run `35555348865` — PASS
- Foundation Domain Model Gate — run `35555348830` — PASS
- Whole System Integration Gate — run `35555348819` — PASS

RHW5 is frozen as the accepted alphabet reference implementation. RHW6 may generalize behavior but must not fork or regress the pilot.

## RHW6 implementation summary

- S28: generic `RUSSIAN_LISTEN_WRITE_LESSON_V1` schema independent from alphabet ids/files.
- S29: content types `letter / syllable / word / phrase / sentence / dictation` with the accepted drill kinds.
- S30: reusable `RussianListenWriteFactory` provides validation, playback request/player adapter, Unicode-preserving scorer, immutable exercise model and generic renderer.
- S31: fail-closed authoring validation rejects missing handwriting sample/audio/answer/stress, unsupported content/drill types, duplicate/invalid choices and unsupported fields.
- S32: acceptance fixtures cover one word lesson and one sentence lesson using the same factory. The frozen alphabet core does not call the factory yet; RHW7 owns real lesson binding.

## RHW6 accepted gate evidence

Accepted head: `2517942d001866a99febdcc125cac424f7118a12`

- Russian Reference UI Gate — run `35555669589` — PASS
- Windows checkout safety — run `35555669536` — PASS
- Roadmap V2 Current Gate — run `35555669621` — PASS
- Bauman Cloudflare Preview CI — run `35555669505` — PASS
- Foundation Domain Model Gate — run `35555669472` — PASS
- Whole System Integration Gate — run `35555669512` — PASS

RHW6 is closed. RHW7 may bind the generic factory to real lessons through data only; the alphabet reference path remains separate and frozen.

## RHW7 implementation summary

- S33: dữ liệu listen-write thật cho R01–R10, gồm word/phrase/syllable-oriented material where appropriate.
- S34: câu và chính tả theo từng bài, dùng handwritingSample/audioText/answer rõ ràng.
- S35: `core.js` bind chính xác theo `lessonId`; không có binding thì panel ẩn, không suy đoán.
- S36: luật A0/A1/A2 quyết định content types và session mode mặc định; future prep mở rộng bằng dữ liệu, không cần sửa JavaScript.
- S37: validator kiểm tra cross-lesson binding, level rules, factory reuse, offline datasets và cấm chèn nghĩa tiếng Việt vào dữ liệu ListenWrite.

## RHW7-F1 — RHW6 validator forward-compatibility

RHW7/S35 intentionally binds the accepted RHW6 generic factory into real lessons. The legacy RHW6 validator still prohibited any `RussianListenWriteFactory` reference in `core.js`, so the first RHW7 gate failed before the RHW7 validator could run. F1 now permits binding only through the accepted factory API and still forbids duplicated normalizer/validator logic or alphabet-id hard-coding.

## RHW7-F2 — factory/core action-boundary validator repair

S37 validator originally searched `core.js` for the factory-rendered HTML attribute `data-lw-act`. In the accepted architecture, RHW6 Factory owns those rendered action attributes while `core.js` owns the `dataset.lwAct` adapter. F2 validates each responsibility at its correct boundary without changing runtime behavior.

## RHW7 S37 accepted gate evidence

Accepted functional head: `0d4592b4bbcac60660a4b9f9c335adae08f00c4a`

- Russian Reference UI Gate — run `35562149861` — PASS
- Windows checkout safety — run `35562149862` — PASS
- Roadmap V2 Current Gate — run `35562149828` — PASS
- Bauman Cloudflare Preview CI — run `35562149825` — PASS
- Foundation Domain Model Gate — run `35562149841` — PASS
- Whole System Integration Gate — run `35562149835` — PASS

S37 is closed. S38 final marker is active.

## RHW7 completion boundary

R01-R10 are explicitly bound by lessonId. The generic factory is reused for rendering, playback and scoring. A0/A1/A2 rules are data-driven. Missing bindings hide the panel instead of guessing. Future lesson expansion is documented as data-only and must not require runtime JavaScript changes.

## RHW7 S38 final marker gate evidence

Accepted final marker head: `398eb38411d6b25da129add99970c7ae198a0c9b`

- Russian Reference UI Gate — run `35562242501` — PASS
- Windows checkout safety — run `35562242508` — PASS
- Roadmap V2 Current Gate — run `35562242510` — PASS
- Bauman Cloudflare Preview CI — run `35562242507` — PASS
- Foundation Domain Model Gate — run `35562242529` — PASS
- Whole System Integration Gate — run `35562242528` — PASS

S38 is green.

## RHW7-H1 — canonical data-only authoring guide

Post-S38 audit found that the factory and validators already support data-only future expansion, but S38's documentation requirement was not satisfied by a dedicated authoring guide. H1 adds `RUSSIAN_LISTEN_WRITE_AUTHORING_GUIDE.md` and extends the RHW7 validator so CI requires the documented data-only workflow, exact lessonId binding, fail-closed behavior, Russian orthography rules and the rule that ordinary new lessons must not modify runtime JavaScript.

## RHW7-H1 gate evidence

Accepted H1 head: `34849c5c0c72ee93a2cce72055ba4f4611cd05aa`

- Russian Reference UI Gate — run `35564570106` — PASS
- Windows checkout safety — run `35564570131` — PASS
- Roadmap V2 Current Gate — run `35564570110` — PASS
- Bauman Cloudflare Preview CI — run `35564570120` — PASS
- Foundation Domain Model Gate — run `35564570150` — PASS
- Whole System Integration Gate — run `35564570130` — PASS

RHW7-H1 is closed.

## Post-RHW7 architecture audit

**Result: COMPLETE — no RHW8 required by the current requirement.**

Evidence:

1. The accepted alphabet path provides pronunciation, normal/slow playback, trace/write practice, dictation, stress and sound-spelling discrimination.
2. RHW6 extracted a generic schema/factory with renderer, playback and scorer instead of duplicating alphabet runtime logic.
3. RHW7 binds real lessons explicitly by lessonId and hides the panel when no binding exists.
4. Level/session behavior is data-driven through A0/A1/A2 rules.
5. Future ordinary lesson expansion is documented and validated as edits to data files only.
6. A runtime change is reserved for a genuinely new capability that the current schema/factory cannot represent; such work must open a future RHWx-Hy architecture step rather than silently hard-code a lesson.

The requested Listen+Write feature and its future-lesson expansion architecture are therefore complete. The terminal marker itself must pass the complete six-gate set before this feature branch becomes a merge candidate.

## RHW terminal marker gate evidence

Accepted terminal head: `63c2feee44918fad767ceb7027c8380b7439f510`

- Russian Reference UI Gate — run `35564639099` — PASS
- Windows checkout safety — run `35564638989` — PASS
- Roadmap V2 Current Gate — run `35564639033` — PASS
- Bauman Cloudflare Preview CI — run `35564639001` — PASS
- Foundation Domain Model Gate — run `35564638942` — PASS
- Whole System Integration Gate — run `35564638969` — PASS, including both static integration and browser-system acceptance.

The terminal marker is accepted. RHW1–RHW7 and S01–S38 are complete. The post-RHW7 audit found no required RHW8: future ordinary lessons extend Listen+Write through validated data bindings and the frozen RHW6 factory; a new RHWx-Hy opens only if a genuinely new capability cannot be represented by the current schema/factory.
