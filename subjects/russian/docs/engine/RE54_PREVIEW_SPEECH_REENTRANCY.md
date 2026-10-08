# RE54 — Preview speech reentrancy and asynchronous error handling

Owners: RU05, RU08, C3/C4. Read: RE44 experience renderers + legacy speech adapter + SW. Write: Russian Engine integration and tests, scoped Russian SW as authorized integration boundary.

## Observed defect
The previous preview UIs immediately inspected `speechProvider.playStimulus(...).started`. If an implementation returned a Promise, they reported false failure and could allow unhandled asynchronous errors. Rapid repeated taps could enqueue overlapping speech requests.

## Fix
Add one tiny shared preview speech gate. It accepts synchronous and asynchronous provider results, catches rejection, serializes pending calls, suppresses identical rapid taps (350ms), and ignores completion after scene changes/unmount. Both RE43 and RE44 consume the same gate. No new dependencies, telemetry, mastery persistence, translation UI or new backend.

## Acceptance
- Rapid double clicks result in exactly one provider invocation.
- Promise resolution, rejection and unavailable provider give truthful feedback.
- Changing scene or unmounting invalidates stale feedback.
- Existing RE43/RE44 source and packaged browser flows remain intact.
- Offline SW caches the new module with a bumped shell cache key.
- Never interpret TTS playback as phonetic quality or HUMAN_RU03 certification.

Run all exact HEAD gates and leave production/default promotion untouched.
