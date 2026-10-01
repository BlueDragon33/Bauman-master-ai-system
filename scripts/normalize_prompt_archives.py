#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import shutil
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVES = ROOT / "prompt-archives"
SUBJECTS = ROOT / "prompts" / "subjects"

PACKAGES = {
    "russian-pack.zip": {"slug": "russian", "normalize": False, "prefix": "RU", "label": "Russian"},
    "math.zip": {"slug": "math", "normalize": False, "prefix": "MATH", "label": "Mathematics"},
    "python-pack.zip": {"slug": "python", "normalize": False, "prefix": "PYTHON", "label": "Python"},
    "algorithms-pack.zip": {"slug": "algorithms", "normalize": False, "prefix": "ALG", "label": "Algorithms & Data Structures"},
    "database.zip": {"slug": "database", "normalize": True, "prefix": "DB", "label": "Database Systems & SQL"},
    "ml-data-analysis.zip": {"slug": "ml-data-analysis", "normalize": True, "prefix": "ML", "label": "Multivariate Data Analysis & Machine Learning"},
    "analytical-models.zip": {"slug": "analytical-models", "normalize": True, "prefix": "AM", "label": "Analytical Models of ASOIU"},
    "oop-software-engineering.zip": {"slug": "oop-software-engineering", "normalize": True, "prefix": "OOPSE", "label": "OOP Design & Software Engineering"},
    "advanced-database.zip": {"slug": "advanced-database", "normalize": True, "prefix": "ADB", "label": "Advanced Database Systems"},
    "reliability-models.zip": {"slug": "reliability-models", "normalize": True, "prefix": "REL", "label": "Reliability Models of ASOIU"},
    "neural-networks.zip": {"slug": "neural-networks", "normalize": True, "prefix": "NN", "label": "Neural Network Systems"},
    "time-series.zip": {"slug": "time-series", "normalize": True, "prefix": "TS", "label": "Time Series Analysis"},
    "research-methodology.zip": {"slug": "research-methodology", "normalize": True, "prefix": "RSW", "label": "Research Methodology & Scientific Work"},
    "ai-business-analytics.zip": {"slug": "ai-business-analytics", "normalize": True, "prefix": "AIBA", "label": "AI in Business Analytics"},
    "mivar-logical-ai.zip": {"slug": "mivar-logical-ai", "normalize": True, "prefix": "MIVAR", "label": "Mivar / Logical AI"},
    "ergonomics-hci.zip": {"slug": "ergonomics-hci", "normalize": True, "prefix": "HCI", "label": "Ergonomics / HCI"},
    "lifecycle-systems-engineering.zip": {"slug": "lifecycle-systems-engineering", "normalize": True, "prefix": "LSE", "label": "Lifecycle & Systems Engineering"},
    "information-security.zip": {"slug": "information-security", "normalize": True, "prefix": "SEC", "label": "Information Security for ASOIU"},
    "big-data-processing.zip": {"slug": "big-data-processing", "normalize": True, "prefix": "BD", "label": "Big Data Processing Technologies"},
    "project-design-management.zip": {"slug": "project-design-management", "normalize": True, "prefix": "PDM", "label": "Project Design Management"},
    "entrepreneurship.zip": {"slug": "entrepreneurship", "normalize": True, "prefix": "ENT", "label": "Entrepreneurship"},
    "nir-vkr-integration.zip": {"slug": "nir-vkr-integration", "normalize": True, "prefix": "NIRVKR", "label": "Research Practice / NIR / VKR Integration"},
}

CONSTITUTION_REPLACEMENTS = {
    "GLOBAL_CONSTITUTIONS/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.txt": "../../constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md",
    "GLOBAL_CONSTITUTIONS/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md": "../../constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md",
    "GLOBAL_CONSTITUTIONS/C2_FUTURE_PROFESSIONAL_UI_UX.txt": "../../constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md",
    "GLOBAL_CONSTITUTIONS/C2_FUTURE_PROFESSIONAL_UI_UX.md": "../../constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md",
    "GLOBAL_CONSTITUTIONS/C3_PROFESSIONAL_QA_AUTO_FIX.txt": "../../constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md",
    "GLOBAL_CONSTITUTIONS/C3_PROFESSIONAL_QA_AUTO_FIX.md": "../../constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md",
    "GLOBAL_CONSTITUTIONS/C4_REAL_LEARNING_OUTCOME_SYSTEM.txt": "../../constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md",
    "GLOBAL_CONSTITUTIONS/C4_REAL_LEARNING_OUTCOME_SYSTEM.md": "../../constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md",
    "GLOBAL_CONSTITUTIONS/C3_RELEASE_ANNEX_SHARED.md": "../../constitution/C3_RELEASE_ANNEX_SHARED.md",
}

CHAT_ENTRY = """
---

# NORMAL CHAT / WORK / CODEX ENTRY

This prompt system is channel-neutral. It may be used from an ordinary ChatGPT chat, ChatGPT Work, or Codex.

For a new ordinary chat, read only:

1. `prompts/CONSTITUTION.md`;
2. exact C1–C4 clauses routed by this subject's Constitution Router;
3. this `README.md`;
4. the subject Master Prompt;
5. `PROJECT_STATE.json`;
6. the active module prompt;
7. current repository diff/evidence only when repository work is requested.

Chat history is context, not project authority. Repository state is the durable handoff.

If the task is discussion/planning only, do not pretend repository changes were executed. If repository modification is explicitly requested and GitHub access is available, use the same state/evidence rules.
""".lstrip()

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def normalize_text(text: str) -> str:
    for old, new in CONSTITUTION_REPLACEMENTS.items():
        text = text.replace(old, new)
    text = text.replace("GLOBAL_CONSTITUTIONS/", "../../constitution/")
    return text

def find_payload_root(tmp: Path) -> Path:
    children = [p for p in tmp.iterdir() if p.name != "__MACOSX"]
    dirs = [p for p in children if p.is_dir()]
    files = [p for p in children if p.is_file()]
    if len(dirs) == 1 and not files:
        return dirs[0]
    return tmp

def find_one(root: Path, pattern: str) -> str | None:
    hits = sorted(p.name for p in root.glob(pattern) if p.is_file())
    return hits[0] if hits else None

def normalize_subject(archive: Path, meta: dict) -> dict:
    slug = meta["slug"]
    prefix = meta["prefix"]
    dest = SUBJECTS / slug

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        with zipfile.ZipFile(archive) as zf:
            zf.extractall(tmp)
        src = find_payload_root(tmp)

        master = find_one(src, "*_MASTER_PROMPT.md")
        router = find_one(src, "*_CONSTITUTION_ROUTER.json")
        arch_map = find_one(src, "*_ARCHITECTURE_MAP.md")
        readme_src = src / "00_README.md"
        status_src = src / "STATUS.md"

        required = [master, router, arch_map]
        if not readme_src.exists() or not status_src.exists() or any(x is None for x in required):
            raise RuntimeError(f"{archive.name}: missing canonical prompt-system files")

        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)

        copied = []
        for p in sorted(src.iterdir()):
            if p.is_dir():
                continue
            if p.name in {"00_README.md", "STATUS.md", "MANIFEST.json"}:
                continue
            if p.suffix.lower() not in {".md", ".json", ".txt"}:
                continue
            text = normalize_text(p.read_text(encoding="utf-8"))
            (dest / p.name).write_text(text, encoding="utf-8")
            copied.append(p.name)

        readme = normalize_text(readme_src.read_text(encoding="utf-8"))
        if "NORMAL CHAT / WORK / CODEX ENTRY" not in readme:
            readme = readme.rstrip() + "\n\n" + CHAT_ENTRY
        (dest / "README.md").write_text(readme, encoding="utf-8")

        source_status = normalize_text(status_src.read_text(encoding="utf-8"))
        (dest / "SOURCE_STATUS.md").write_text(source_status, encoding="utf-8")

        project_state = {
            "schemaVersion": "1.0.0",
            "subject": slug,
            "constitution": "prompts/CONSTITUTION.md",
            "constitutionLibrary": "prompts/constitution/",
            "masterPrompt": f"prompts/subjects/{slug}/{master}",
            "router": f"prompts/subjects/{slug}/{router}",
            "sourceArchive": f"prompt-archives/{archive.name}",
            "promptArchitectureStatus": "COMPLETE",
            "repositoryExecutionStatus": "NOT_STARTED_OR_NEEDS_RECONCILIATION",
            "activeModule": f"{prefix}01",
            "lastCompletedModule": None,
            "validatedSha": None,
            "evidence": [],
            "blockers": [],
            "nextAction": f"Run {prefix}01 against current repository reality before canonical implementation work."
        }
        (dest / "PROJECT_STATE.json").write_text(
            json.dumps(project_state, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )

        manifest_files = []
        for p in sorted(dest.iterdir()):
            if not p.is_file() or p.name == "SUBJECT_PROMPT_MANIFEST.json":
                continue
            data = p.read_bytes()
            manifest_files.append({
                "path": p.name,
                "sha256": sha256_bytes(data),
                "bytes": len(data),
            })

        manifest = {
            "schemaVersion": "1.0.0",
            "subject": slug,
            "canonicalRoot": f"prompts/subjects/{slug}/",
            "sharedConstitution": "prompts/constitution/",
            "archivePackage": f"prompt-archives/{archive.name}",
            "files": manifest_files,
        }
        (dest / "SUBJECT_PROMPT_MANIFEST.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )

        return {
            "slug": slug,
            "masterPrompt": master,
            "router": router,
            "architectureMap": arch_map,
            "activeModule": f"{prefix}01",
            "fileCount": len(list(dest.glob("*"))),
        }

def write_indexes(results: dict):
    rows = []
    index_subjects = []
    for archive_name, meta in PACKAGES.items():
        p = ARCHIVES / archive_name
        if not p.exists():
            continue
        digest = sha256_bytes(p.read_bytes())
        extracted = SUBJECTS / meta["slug"]
        state = "CANONICAL_EXTRACTED" if extracted.exists() else "ARCHIVE_ONLY"
        rows.append(
            f"- `{archive_name}` — {meta['label']} — SHA-256 `{digest}` — "
            f"`prompts/subjects/{meta['slug']}/` — {state}"
        )
        index_subjects.append({
            "id": meta["slug"],
            "label": meta["label"],
            "archive": f"prompt-archives/{archive_name}",
            "canonicalRoot": f"prompts/subjects/{meta['slug']}/",
            "status": state,
        })

    readme = """# Prompt ZIP Archives

This directory stores subject prompt ZIP packages for provenance and recovery.

Shared authority remains:

1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. canonical subject `README.md` + Master Prompt + `PROJECT_STATE.json`
4. ZIP archive as immutable-ish source snapshot / recovery input

## Execution rule

ZIP files are archives, not simultaneous execution units.

Execute one subject at a time:

`README → PROJECT_STATE / SOURCE_STATUS → active module → router → PASS gate → next module`

The normalization job extracts subject prompt systems into `prompts/subjects/<slug>/` and removes duplicated per-ZIP Constitution copies from canonical execution.

## Packages

""" + "\n".join(rows) + """

## Constitution rule

Do not execute ZIP-embedded duplicate constitutions as a second authority.
The canonical shared Constitution is `prompts/CONSTITUTION.md` plus `prompts/constitution/`.

## Source preservation

Archive hashes above preserve provenance. Canonical readable prompt files live under `prompts/subjects/`.
"""
    (ARCHIVES / "README.md").write_text(readme, encoding="utf-8")

    index = {
        "schemaVersion": "1.0.0",
        "executionRule": "ONE_SUBJECT_AT_A_TIME",
        "sharedConstitution": "prompts/constitution/",
        "subjects": index_subjects,
    }
    (SUBJECTS / "SUBJECT_PROMPT_INDEX.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

def main():
    SUBJECTS.mkdir(parents=True, exist_ok=True)
    results = {}
    for archive_name, meta in PACKAGES.items():
        archive = ARCHIVES / archive_name
        if not archive.exists() or not meta["normalize"]:
            continue
        results[archive_name] = normalize_subject(archive, meta)
    write_indexes(results)
    print(json.dumps({"normalized": results, "count": len(results)}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
