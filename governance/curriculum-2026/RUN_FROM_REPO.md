# Curriculum Prompt System Bootstrap

Prompt package is stored in this repository at:

`governance/curriculum-2026/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1.zip`

## Codex Cloud
From repository root:

```bash
rm -rf .codex-curriculum-prompts
mkdir -p .codex-curriculum-prompts
unzip -q governance/curriculum-2026/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1.zip -d .codex-curriculum-prompts
cd .codex-curriculum-prompts/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1
cat README.md
cat RUN_THIS_FIRST.txt
```

Then execute the package exactly as documented:

- read README.md;
- read 00_SYSTEM/00_MASTER_ORCHESTRATOR.md;
- read shared Constitution guardrails and state/handoff protocol;
- run P01 through P17 in PROMPT_SEQUENCE.json;
- validate, test, root-cause fix, retest, regression, and record evidence after every prompt;
- do not merge/publish before P16;
- run P17 post-release audit after P16;
- do not run P18 during the shell-building phase;
- stop only for a real authority/credential/user-decision blocker.

The package is intentionally kept as a ZIP in Git so Cloud tasks do not depend on chat attachments.
