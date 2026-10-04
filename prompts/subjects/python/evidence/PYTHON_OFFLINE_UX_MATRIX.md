# PYTHON05 OFFLINE UX MATRIX
Status: ACTIVE

| Capability | Offline behavior |
|---|---|
| packaged lesson/task catalog | available when shell/assets are cached by global packaging |
| learner code draft | local autosave remains available |
| Python execution | unavailable; server/container runtime is not falsely advertised as local |
| Run tests / Submit | unavailable |
| notebook execution | unsupported in current runtime profile |
| hints already packaged | available |
| runtime identity | shown unavailable until reconnected |
| reconnect | controls re-enable and runtime identity is rechecked |

No queue of official submissions is silently created offline. Stale runtime memory is never restored as if it were source state.
