# PYTHON05 AUTHORING BLOCK SCHEMA
Status: ACTIVE

Ordinary Python coding tasks are data-driven.

Canonical author record `PYTHON_CODING_TASK_V1` fields:
- `id`, `title`, `competency`, `prompt`;
- `starterCode`;
- governed `runtimeProfileId`;
- `mode`;
- `resourceLimits.timeoutMs`;
- `hints[]`;
- `publicTests[]`;
- author-only `hiddenTests[]`;
- `lifecycle`.

A test record contains stable id, stdin and expected output. Public learner catalog may expose labels but MUST NOT expose hidden test input/expected/source.

Forbidden normal authoring fields:
- arbitrary shell command;
- arbitrary container image;
- privileged environment variable;
- raw install script;
- direct mastery mutation.

Current governed runtime picker exposes `cpython-3.14.8-stdlib-v1`.
