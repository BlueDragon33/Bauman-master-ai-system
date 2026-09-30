# Russian P6 Speaking Browser Matrix

| Case | Expected |
|---|---|
| ASR supported | transcript signal returned; no auto-pass |
| ASR unsupported | explicit fallback, route usable |
| ASR permission blocked | explicit state/fallback |
| Mic allowed | local recording starts/stops |
| Mic denied | no dead route; no learner-state corruption |
| No MediaRecorder | recording unavailable; speaking still usable |
| Repeated start | single active recognition/recorder owner |
| Route interrupted | recognition/recording cancelled |
| Pagehide | interaction cleaned up |
| Offline shell | interaction JS available; non-network fallbacks usable |
| Desktop keyboard | existing semantic controls remain operable |
| Mobile touch | speaking coach responsive controls remain usable |
| Transcript reveal | policy remains explicit |
| ASR result | labeled transcript similarity, not pronunciation score |
