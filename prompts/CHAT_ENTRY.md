# CHATGPT NORMAL CHAT ENTRY — BAUMAN

## If the task is about BAUMAN HUB
Use the dedicated Hub normal-chat plane:

1. `prompts/CONSTITUTION.md`
2. `prompts/hub/chat/CHAT_START.md`
3. `prompts/hub/chat/HUB_CHAT_MASTER_PROMPT.md`
4. `prompts/hub/HUB_SHARED_STATE.json`
5. current Hub work packet/result if relevant

For Hub work, **do not load `prompts/subjects/**`**.
Subject apps are external bounded systems and Hub communicates with them only via versioned API/contracts.

## If the task is about a SUBJECT APP ITSELF
That is a separate workflow. Use the corresponding `prompts/subjects/<subject>/...` system.

Do not mix the two scopes in one execution stream.

## Codex
Codex has its own Hub execution plane at:
`prompts/hub/codex/CODEX_START.md`

The normal-chat and Codex planes connect only through the Hub shared state and bridge packet/result files.
