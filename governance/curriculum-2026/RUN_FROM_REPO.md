# Curriculum Prompt System Bootstrap

The canonical prompt root is now `prompts/`.

Shared Constitution:
`prompts/CONSTITUTION.md`

Curriculum package:
`prompts/curriculum-2026/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1.zip`

Compatibility copy:
`governance/curriculum-2026/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1.zip`

## Codex Cloud

From repository root:

```bash
cat prompts/CONSTITUTION.md
cat prompts/README.md
rm -rf .codex-curriculum-prompts
mkdir -p .codex-curriculum-prompts
unzip -q prompts/curriculum-2026/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1.zip -d .codex-curriculum-prompts
cd .codex-curriculum-prompts/BAUMAN_MASTER_CURRICULUM_PROMPT_SYSTEM_V1
cat README.md
cat RUN_THIS_FIRST.txt
```

Then execute the package as documented, with `prompts/CONSTITUTION.md` taking precedence over legacy internal Constitution numbering.

Run P01 through P17; validate/test/root-cause-fix/retest/regress/evidence after every prompt; do not run P18 during shell-building; do not publish outside the explicit release gate.
