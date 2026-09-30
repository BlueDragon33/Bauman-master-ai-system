# Russian P6 Audio Offline Policy

Classify media as REQUIRED_OFFLINE / OPTIONAL_OFFLINE / ONLINE_ONLY_WITH_FALLBACK.

The P6 interaction engine is part of the offline shell cache. Large audio/dialogue datasets are not preloaded wholesale. Browser TTS is a fallback only when available and is classified as TTS, not authentic recorded speech.

If source audio, TTS or network media is unavailable, the route must show/use a meaningful text/transcript/self-production fallback instead of spinning or dead-ending. P14 will harden global cache/version/quota behavior.
