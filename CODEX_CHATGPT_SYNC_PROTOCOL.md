# CODEX_CHATGPT_SYNC_PROTOCOL

## 1. Single source of continuation

`CODEX_STATE.md` is the first file both ChatGPT and Codex must read.

The top block of `CODEX_STATE.md` must always describe the latest completed task or active task.

Do not rely on memory, chat history, branch names, or guessed file paths alone.

## 2. Mandatory top block format in CODEX_STATE.md

Every task must update the top of `CODEX_STATE.md` using this structure:

```md
Current task: <episode/task name>

Status: PASS | FAIL | IN_PROGRESS | BLOCKED

Branch: <current branch>
Base branch: <base branch>
Main sync status: in_main | branch_only | stacked_branch | needs_fast_forward | needs_merge

Files changed:
- <path>

What changed:
- <short exact summary>

Verification:
- <check>: PASS/FAIL

Main sync / pull instruction:
- <exactly where the files currently are>
- <what branch local user must pull>
- <whether main already contains this task>

Next recommended task:
- <exact next step>

Next actor:
- ChatGPT | Codex | User

Codex required:
- yes/no
- Reason: <local script, JSON merge, runtime verify, UI test, branch merge, etc.>

ChatGPT can do:
- <safe GitHub API/content-only/staged authoring tasks>

Codex prompt file:
- <path if created>
```

## 3. Main sync rule for user pull

User's preferred workflow is to pull from `main` locally whenever possible.

Therefore, after a task reaches a real PASS state, Codex must either:

1. Put the verified result into `main`, then update `CODEX_STATE.md` with `Main sync status: in_main`; or
2. Clearly state `Main sync status: branch_only` / `needs_merge` / `needs_fast_forward`, and give the exact branch the user must pull.

Do not tell the user to pull `main` unless `main` actually contains the completed files.

Do not leave completed work only on a feature branch without reporting the pull target.

For risky tasks, especially runtime/UI/browser tasks, do not merge to `main` until the required verification passes.

For the current Math Theory repair stack:

- Do not merge known-bad E149.
- Treat branch `codex/e150-c01-l01-clean-replacement` as the active clean repair branch unless `CODEX_STATE.md` says otherwise.
- If browser/runtime smoke fails, do not push that failure as a PASS baseline to `main`.
- If browser/runtime smoke passes, Codex may prepare a controlled merge/fast-forward plan to put the verified branch into `main`.

## 4. Branch stack rule

If a branch is based on another feature branch instead of `main`, `CODEX_STATE.md` must say so clearly:

```md
Branch stack:
1. main
2. codex/e146-merge-c03-l04-l06
3. codex/e147-c04-staged-content

Safe merge order:
1. Merge/fast-forward codex/e146-merge-c03-l04-l06 into main.
2. Then merge codex/e147-c04-staged-content into main.
```

Never let ChatGPT infer branch order from memory.

## 5. Actor boundary

ChatGPT can handle:

- creating staged content JSON files;
- creating handoff markdown files;
- creating Codex prompt files;
- updating `CODEX_STATE.md` with staged-only status;
- small documentation-only changes;
- reading targeted files from GitHub.

Codex is required for:

- local JSON append/merge into large runtime content files;
- verification scripts over large JSON files;
- runtime/UI testing;
- branch merge/rebase/fast-forward when stacked branches exist;
- putting verified branch results into `main` safely;
- any change that needs local repo diff checks;
- any patch that could affect boot/runtime/UI.

User is required for:

- approving risky merge decisions;
- providing screenshots/console errors for browser-only bugs;
- deciding content direction when multiple roadmap options exist.

## 6. File naming standard

For every episode:

- Staged content: `subjects/math/data/<source>_<episode>_staged.json`
- Staged report: `subjects/math/<episode>_STAGED_CONTENT.md`
- Merge report: `subjects/math/<episode>*MERGE*<scope>.md`
- Codex prompt: `subjects/math/<episode>*CODEX*<task>_PROMPT.md`

Example:

- `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`
- `subjects/math/E147_C04_L01_L03_STAGED_CONTENT.md`
- `subjects/math/E147_MERGE_C04_L01_L03_STAGED.md`
- `subjects/math/E147_CODEX_MERGE_PROMPT.md`

## 7. End-of-task requirement

Every Codex task must end by updating `CODEX_STATE.md` and must include:

- branch name;
- base branch;
- whether result is in main or branch only;
- exact branch the user should pull;
- exact files changed;
- exact verification results;
- next actor;
- whether Codex is required next;
- ready-to-copy prompt path for the next Codex step if needed.
