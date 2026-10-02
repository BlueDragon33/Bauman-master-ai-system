#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROMPT_ROOT = ROOT / "prompts" / "subjects" / "russian"
manifest_path = PROMPT_ROOT / "SUBJECT_PROMPT_MANIFEST.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

entries = {row["path"]: row for row in manifest.get("files", [])}
actual = {
    str(p.relative_to(PROMPT_ROOT)).replace("\\", "/"): p
    for p in PROMPT_ROOT.rglob("*")
    if p.is_file() and p.name != "SUBJECT_PROMPT_MANIFEST.json"
}

assert entries, "Russian prompt manifest has no files"
assert set(entries) == set(actual), {
    "missingFromManifest": sorted(set(actual) - set(entries)),
    "missingOnDisk": sorted(set(entries) - set(actual)),
}

for rel, path in actual.items():
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    row = entries[rel]
    assert row["sha256"] == digest, f"SHA-256 mismatch: {rel}"
    assert row["bytes"] == len(data), f"byte length mismatch: {rel}"

print(json.dumps({
    "ok": True,
    "subject": "russian",
    "files": len(actual),
    "rule": "canonical prompt package must match SUBJECT_PROMPT_MANIFEST exactly"
}))
