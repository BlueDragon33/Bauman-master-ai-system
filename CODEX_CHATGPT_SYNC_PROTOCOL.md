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

## 3. Branch stack rule

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

## 4. Actor boundary

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
- any change that needs local repo diff checks;
- any patch that could affect boot/runtime/UI.

User is required for:

- approving risky merge decisions;
- providing screenshots/console errors for browser-only bugs;
- deciding content direction when multiple roadmap options exist.

## 5. File naming standard

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

## 6. End-of-task requirement

Every Codex task must end by updating `CODEX_STATE.md` and must include:

- branch name;
- base branch;
- whether result is in main or branch only;
- exact files changed;
- exact verification results;
- next actor;
- whether Codex is required next;
- ready-to-copy prompt path for the next Codex step if needed.

Every ChatGPT task that creates staged content must also create a Codex prompt when the next step needs local execution.

## 7. Forbidden behavior

- Do not scan the whole repo unless explicitly required.
- Do not silently switch branches.
- Do not update main while a stacked branch is waiting unless branch order is documented.
- Do not merge staged content into `theory_lecture_content.json` manually through GitHub API.
- Do not edit runtime/UI/boot files during content-only tasks.
- Do not rewrite locked C01/C02/C03 records unless the task explicitly targets them and verification is planned.

## 8. Current project-specific locked rules

- Keep only the old compact Theory header/table in the normal learner view.
- Do not restore E128 legacy importer runtime.
- Do not restore E134 learning-clean runtime.
- Do not restore E130 Program View learner injection.
- Do not restore E130 Program CSS into the learner boot path.
- Do not restore E126 legacy theory adapter.
- Do not restore empty core.js.
- Do not restore E132 reader polish into normal learner view.
- Do not add another UI overlay for the normal Theory learner view.
- Theory content stays in `subjects/math/data/theory_lecture_content.json`.
- Do not use `lessons.json` for new Theory content.
- Do not rewrite `subject-manifest.json` casually.
- Content-only work must not change boot runtime.
- Do not enforce one exact slide count per lesson or per chapter.
- Do enforce a quality floor: normal Math theory lessons should not be under 14 slides unless they are clearly secondary/review/micro lessons and the reason is documented.

## 9. Short handoff phrase for the user

When Codex finishes, the user can return to ChatGPT with:

```text
Codex finished <episode>. Continue from CODEX_STATE on branch <branch-name>.
```

ChatGPT must then read `CODEX_STATE.md` from that branch first.
