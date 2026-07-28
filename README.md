# Whisper Worker

Cloudflare Worker that transcribes Burmese audio using
@cf/openai/whisper-large-v3-turbo and returns word-level timestamps.

## Endpoint
POST /transcribe
Body: raw audio bytes
Returns: { text, words: [{ word, start, end }] }
