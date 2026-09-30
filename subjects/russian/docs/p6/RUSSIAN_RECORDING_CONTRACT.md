# Russian P6 Recording Contract

States: UNKNOWN / REQUESTING / GRANTED / DENIED / UNAVAILABLE / ERROR.

`RussianRecordingEngine` owns getUserMedia + MediaRecorder. It supports start, stop, cancel, max duration, route interruption cleanup, pagehide cleanup, quota-safe transient behavior and explicit fallback.

Privacy default: recordings remain local and transient. P6 performs no silent upload and no durable blob persistence. Starting/stopping recording creates no mastery. Route exit cancels an active transient recording to prevent hidden capture. The learner can hear and delete the most recent local recording.

Fallback after denial/failure: continue with model audio, self-assessment, ASR if independently available, typed response or retry.
