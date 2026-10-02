#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("normalize_prompt_archives", ROOT / "scripts" / "normalize_prompt_archives.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(mod)

with tempfile.TemporaryDirectory() as td:
    temp = Path(td)
    source = temp / "SOURCE"
    source.mkdir()
    (source / "00_README.md").write_text("# Test subject\n", encoding="utf-8")
    (source / "TEST_MASTER_PROMPT.md").write_text("# Master\n", encoding="utf-8")
    (source / "STATUS.md").write_text("# Source package status\nNOT_EXECUTED\n", encoding="utf-8")

    mod.SUBJECTS = temp / "subjects"
    dest = mod.SUBJECTS / "test-subject"
    dest.mkdir(parents=True)
    durable_state = {
        "status": "PASS",
        "completedModules": ["TEST01", "TEST02"],
        "validatedSha": "abc123",
        "nextAction": "continue from evidence"
    }
    durable_source_status = "# Durable source status\nEXECUTED_AND_RELEASED\n"
    durable_status = "# Durable status\nPASS\n"
    (dest / "PROJECT_STATE.json").write_text(json.dumps(durable_state, indent=2) + "\n", encoding="utf-8")
    (dest / "SOURCE_STATUS.md").write_text(durable_source_status, encoding="utf-8")
    (dest / "STATUS.md").write_text(durable_status, encoding="utf-8")

    meta = {
        "slug": "test-subject",
        "prefix": "TEST",
        "label": "Test Subject",
        "sourceRoot": "SOURCE"
    }
    mod.normalize_source_dir(source, "test.zip", meta)

    after = json.loads((dest / "PROJECT_STATE.json").read_text(encoding="utf-8"))
    assert after == durable_state, (after, durable_state)
    assert (dest / "SOURCE_STATUS.md").read_text(encoding="utf-8") == durable_source_status
    assert (dest / "STATUS.md").read_text(encoding="utf-8") == durable_status

print("PROMPT_NORMALIZATION_STATE_PRESERVATION=PASS")
