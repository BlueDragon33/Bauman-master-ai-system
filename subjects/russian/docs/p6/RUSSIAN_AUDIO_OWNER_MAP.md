# Russian P6 Audio Owner Map

| Responsibility | Canonical owner | Persistence |
|---|---|---|
| TTS/browser speech playback | `RussianAudioEngine` | none |
| Source audio playback wrapper | `RussianAudioEngine` | none |
| SpeechRecognition browser API | `RussianSpeechRecognitionAdapter` | none |
| Recognition transcript signal | dialogue runtime via adapter | existing core speech result state |
| Microphone permission | `RussianRecordingEngine` | session only |
| MediaRecorder lifecycle | `RussianRecordingEngine` | session only |
| Local recording blob | `RussianRecordingEngine` | transient memory/object URL |
| Speaking practice state | `speaking-coach.js` | speaking-coach state |
| Dialogue state | `core.js` canonical route/dialogue state | core learner state |
| Deep Speaking state | `core.js` | core learner state |
| Official mastery | P4 assessment/mastery owner | P4 only |
| Adaptive next step | P5 planner | P5 only |

No UI component may directly instantiate SpeechRecognition or MediaRecorder.
