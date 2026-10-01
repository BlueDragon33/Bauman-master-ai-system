#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import json
import shutil
import tempfile
import tarfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVES = ROOT / "prompt-archives"
SUBJECTS = ROOT / "prompts" / "subjects"
BOOTSTRAP = ARCHIVES / "_remaining-subject-sources.zip"
BOOTSTRAP_TAR = ARCHIVES / "_remaining-subject-sources.tar.xz"
BOOTSTRAP_PART_GLOB = "_remaining-subject-sources.b64.part*"
BOOTSTRAP_TAR_PART_GLOB = "_remaining-subject-sources.tar.xz.b64.part*"

PACKAGES = {
    "russian-pack.zip": {"slug":"russian","normalize":False,"prefix":"RU","label":"Russian","sourceRoot":"RUSSIAN_PROMPT_SYSTEM"},
    "math.zip": {"slug":"math","normalize":False,"prefix":"MATH","label":"Mathematics","sourceRoot":"MATH_PROMPT_SYSTEM"},
    "python-pack.zip": {"slug":"python","normalize":False,"prefix":"PYTHON","label":"Python","sourceRoot":"PYTHON_PROMPT_SYSTEM"},
    "algorithms-pack.zip": {"slug":"algorithms","normalize":False,"prefix":"ALG","label":"Algorithms & Data Structures","sourceRoot":"ALGORITHMS_PROMPT_SYSTEM"},
    "database.zip": {"slug":"database","normalize":True,"prefix":"DB","label":"Database Systems & SQL","sourceRoot":"DATABASE_PROMPT_SYSTEM"},
    "ml-data-analysis.zip": {"slug":"ml-data-analysis","normalize":True,"prefix":"ML","label":"Multivariate Data Analysis & Machine Learning","sourceRoot":"ML_DATA_ANALYSIS_PROMPT_SYSTEM"},
    "analytical-models.zip": {"slug":"analytical-models","normalize":True,"prefix":"AM","label":"Analytical Models of ASOIU","sourceRoot":"ASOIU_ANALYTICAL_MODELS_PROMPT_SYSTEM"},
    "oop-software-engineering.zip": {"slug":"oop-software-engineering","normalize":True,"prefix":"OOPSE","label":"OOP Design & Software Engineering","sourceRoot":"OOP_SOFTWARE_ENGINEERING_PROMPT_SYSTEM"},
    "advanced-database.zip": {"slug":"advanced-database","normalize":True,"prefix":"ADB","label":"Advanced Database Systems","sourceRoot":"ADVANCED_DATABASE_PROMPT_SYSTEM"},
    "reliability-models.zip": {"slug":"reliability-models","normalize":True,"prefix":"REL","label":"Reliability Models of ASOIU","sourceRoot":"RELIABILITY_MODELS_PROMPT_SYSTEM"},
    "neural-networks.zip": {"slug":"neural-networks","normalize":True,"prefix":"NN","label":"Neural Network Systems","sourceRoot":"NEURAL_NETWORK_SYSTEMS_PROMPT_SYSTEM"},
    "time-series.zip": {"slug":"time-series","normalize":True,"prefix":"TS","label":"Time Series Analysis","sourceRoot":"TIME_SERIES_ANALYSIS_PROMPT_SYSTEM"},
    "research-methodology.zip": {"slug":"research-methodology","normalize":True,"prefix":"RSW","label":"Research Methodology & Scientific Work","sourceRoot":"RESEARCH_SCIENTIFIC_WORK_PROMPT_SYSTEM"},
    "ai-business-analytics.zip": {"slug":"ai-business-analytics","normalize":True,"prefix":"AIBA","label":"AI in Business Analytics","sourceRoot":"AI_BUSINESS_ANALYTICS_PROMPT_SYSTEM"},
    "mivar-logical-ai.zip": {"slug":"mivar-logical-ai","normalize":True,"prefix":"MIVAR","label":"Mivar / Logical AI","sourceRoot":"MIVAR_LOGICAL_AI_PROMPT_SYSTEM"},
    "ergonomics-hci.zip": {"slug":"ergonomics-hci","normalize":True,"prefix":"HCI","label":"Ergonomics / HCI","sourceRoot":"ERGONOMICS_HCI_PROMPT_SYSTEM"},
    "lifecycle-systems-engineering.zip": {"slug":"lifecycle-systems-engineering","normalize":True,"prefix":"LSE","label":"Lifecycle & Systems Engineering","sourceRoot":"LIFECYCLE_SYSTEMS_ENGINEERING_PROMPT_SYSTEM"},
    "information-security.zip": {"slug":"information-security","normalize":True,"prefix":"SEC","label":"Information Security for ASOIU","sourceRoot":"INFORMATION_SECURITY_PROMPT_SYSTEM"},
    "big-data-processing.zip": {"slug":"big-data-processing","normalize":True,"prefix":"BD","label":"Big Data Processing Technologies","sourceRoot":"BIG_DATA_PROCESSING_PROMPT_SYSTEM"},
    "project-design-management.zip": {"slug":"project-design-management","normalize":True,"prefix":"PDM","label":"Project Design Management","sourceRoot":"PROJECT_DESIGN_MANAGEMENT_PROMPT_SYSTEM"},
    "entrepreneurship.zip": {"slug":"entrepreneurship","normalize":True,"prefix":"ENT","label":"Entrepreneurship","sourceRoot":"ENTREPRENEURSHIP_PROMPT_SYSTEM"},
    "nir-vkr-integration.zip": {"slug":"nir-vkr-integration","normalize":True,"prefix":"NIRVKR","label":"Research Practice / NIR / VKR Integration","sourceRoot":"NIR_VKR_INTEGRATION_PROMPT_SYSTEM"},
}

REPLACEMENTS = {
    "GLOBAL_CONSTITUTIONS/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.txt":"../../constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md",
    "GLOBAL_CONSTITUTIONS/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md":"../../constitution/C1_EXTENSIBLE_PLATFORM_ARCHITECTURE.md",
    "GLOBAL_CONSTITUTIONS/C2_FUTURE_PROFESSIONAL_UI_UX.txt":"../../constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md",
    "GLOBAL_CONSTITUTIONS/C2_FUTURE_PROFESSIONAL_UI_UX.md":"../../constitution/C2_FUTURE_PROFESSIONAL_UI_UX.md",
    "GLOBAL_CONSTITUTIONS/C3_PROFESSIONAL_QA_AUTO_FIX.txt":"../../constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md",
    "GLOBAL_CONSTITUTIONS/C3_PROFESSIONAL_QA_AUTO_FIX.md":"../../constitution/C3_PROFESSIONAL_QA_AUTO_FIX.md",
    "GLOBAL_CONSTITUTIONS/C4_REAL_LEARNING_OUTCOME_SYSTEM.txt":"../../constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md",
    "GLOBAL_CONSTITUTIONS/C4_REAL_LEARNING_OUTCOME_SYSTEM.md":"../../constitution/C4_REAL_LEARNING_OUTCOME_SYSTEM.md",
    "GLOBAL_CONSTITUTIONS/C3_RELEASE_ANNEX_SHARED.md":"../../constitution/C3_RELEASE_ANNEX_SHARED.md",
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

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def normalize_text(text: str) -> str:
    for old,new in REPLACEMENTS.items():
        text=text.replace(old,new)
    text=text.replace("GLOBAL_CONSTITUTIONS/","../../constitution/")
    return text

def find_one(root: Path, pattern: str) -> str | None:
    hits=sorted(p.name for p in root.glob(pattern) if p.is_file())
    return hits[0] if hits else None

def normalize_source_dir(src: Path, archive_name: str, meta: dict) -> dict:
    slug=meta["slug"]; prefix=meta["prefix"]; dest=SUBJECTS/slug
    master=find_one(src,"*_MASTER_PROMPT.md")
    router=find_one(src,"*_CONSTITUTION_ROUTER.json")
    arch=find_one(src,"*_ARCHITECTURE_MAP.md")
    readme_src=src/"00_README.md"; status_src=src/"STATUS.md"
    if not readme_src.exists() or not status_src.exists() or not master or not router or not arch:
        raise RuntimeError(f"{src}: missing canonical prompt-system files")

    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    for p in sorted(src.iterdir()):
        if p.is_dir() or p.name in {"00_README.md","STATUS.md","MANIFEST.json"}:
            continue
        if p.suffix.lower() not in {".md",".json",".txt"}:
            continue
        (dest/p.name).write_text(normalize_text(p.read_text(encoding="utf-8")),encoding="utf-8")

    readme=normalize_text(readme_src.read_text(encoding="utf-8"))
    if "NORMAL CHAT / WORK / CODEX ENTRY" not in readme:
        readme=readme.rstrip()+"\n\n"+CHAT_ENTRY
    (dest/"README.md").write_text(readme,encoding="utf-8")
    (dest/"SOURCE_STATUS.md").write_text(normalize_text(status_src.read_text(encoding="utf-8")),encoding="utf-8")

    state={
      "schemaVersion":"1.0.0",
      "subject":slug,
      "constitution":"prompts/CONSTITUTION.md",
      "constitutionLibrary":"prompts/constitution/",
      "masterPrompt":f"prompts/subjects/{slug}/{master}",
      "router":f"prompts/subjects/{slug}/{router}",
      "sourceArchive":f"prompt-archives/{archive_name}",
      "promptArchitectureStatus":"COMPLETE",
      "repositoryExecutionStatus":"NOT_STARTED_OR_NEEDS_RECONCILIATION",
      "activeModule":f"{prefix}01",
      "lastCompletedModule":None,
      "validatedSha":None,
      "evidence":[],
      "blockers":[],
      "nextAction":f"Run {prefix}01 against current repository reality before canonical implementation work."
    }
    (dest/"PROJECT_STATE.json").write_text(json.dumps(state,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

    manifest_files=[]
    for p in sorted(dest.iterdir()):
        if p.is_file() and p.name!="SUBJECT_PROMPT_MANIFEST.json":
            data=p.read_bytes()
            manifest_files.append({"path":p.name,"sha256":digest(data),"bytes":len(data)})
    manifest={
      "schemaVersion":"1.0.0",
      "subject":slug,
      "canonicalRoot":f"prompts/subjects/{slug}/",
      "sharedConstitution":"prompts/constitution/",
      "archivePackage":f"prompt-archives/{archive_name}",
      "files":manifest_files
    }
    (dest/"SUBJECT_PROMPT_MANIFEST.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return {"slug":slug,"activeModule":f"{prefix}01","fileCount":len(list(dest.glob("*")))}

def extract_archive(archive: Path) -> Path:
    td=tempfile.TemporaryDirectory()
    tmp=Path(td.name)
    with zipfile.ZipFile(archive) as zf: zf.extractall(tmp)
    children=[p for p in tmp.iterdir() if p.name!="__MACOSX"]
    dirs=[p for p in children if p.is_dir()]
    files=[p for p in children if p.is_file()]
    src=dirs[0] if len(dirs)==1 and not files else tmp
    src._tempdir=td  # type: ignore[attr-defined]
    return src

def deterministic_zip(src_dir: Path, out: Path):
    out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
        for p in sorted(src_dir.rglob("*")):
            if not p.is_file(): continue
            rel=Path(src_dir.name)/p.relative_to(src_dir)
            info=zipfile.ZipInfo(str(rel).replace("\\","/"),date_time=(1980,1,1,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=0o100644<<16
            zf.writestr(info,p.read_bytes())

def bootstrap_import(results: dict):
    zip_parts=sorted(ARCHIVES.glob(BOOTSTRAP_PART_GLOB))
    tar_parts=sorted(ARCHIVES.glob(BOOTSTRAP_TAR_PART_GLOB))
    bootstrap_path=None
    archive_kind=None
    temp_bootstrap=None

    if BOOTSTRAP_TAR.exists():
        bootstrap_path=BOOTSTRAP_TAR
        archive_kind="tar.xz"
    elif BOOTSTRAP.exists():
        bootstrap_path=BOOTSTRAP
        archive_kind="zip"
    elif tar_parts:
        temp_bootstrap=Path(tempfile.mkstemp(suffix=".tar.xz")[1])
        payload="".join(p.read_text(encoding="ascii").strip() for p in tar_parts)
        temp_bootstrap.write_bytes(base64.b64decode(payload))
        bootstrap_path=temp_bootstrap
        archive_kind="tar.xz"
    elif zip_parts:
        temp_bootstrap=Path(tempfile.mkstemp(suffix=".zip")[1])
        payload="".join(p.read_text(encoding="ascii").strip() for p in zip_parts)
        temp_bootstrap.write_bytes(base64.b64decode(payload))
        bootstrap_path=temp_bootstrap
        archive_kind="zip"

    if bootstrap_path is None:
        return

    with tempfile.TemporaryDirectory() as td:
        tmp=Path(td)
        if archive_kind=="tar.xz":
            with tarfile.open(bootstrap_path,"r:xz") as tf:
                tf.extractall(tmp)
        else:
            with zipfile.ZipFile(bootstrap_path) as zf:
                zf.extractall(tmp)

        for archive_name,meta in PACKAGES.items():
            if not meta["normalize"]:
                continue
            src=tmp/meta["sourceRoot"]
            if not src.exists():
                raise RuntimeError(f"bootstrap missing {meta['sourceRoot']}")
            results[archive_name]=normalize_source_dir(src,archive_name,meta)
            deterministic_zip(SUBJECTS/meta["slug"],ARCHIVES/archive_name)

    for source in (BOOTSTRAP, BOOTSTRAP_TAR):
        if source.exists():
            source.unlink()
    for part in zip_parts + tar_parts:
        part.unlink()
    if temp_bootstrap and temp_bootstrap.exists():
        temp_bootstrap.unlink()

def normalize_individual_archives(results: dict):
    for archive_name,meta in PACKAGES.items():
        if not meta["normalize"]: continue
        archive=ARCHIVES/archive_name
        if not archive.exists(): continue
        with tempfile.TemporaryDirectory() as td:
            tmp=Path(td)
            with zipfile.ZipFile(archive) as zf: zf.extractall(tmp)
            dirs=[p for p in tmp.iterdir() if p.is_dir() and p.name!="__MACOSX"]
            files=[p for p in tmp.iterdir() if p.is_file()]
            src=dirs[0] if len(dirs)==1 and not files else tmp
            results[archive_name]=normalize_source_dir(src,archive_name,meta)

def write_indexes():
    rows=[]; subjects=[]
    for archive_name,meta in PACKAGES.items():
        p=ARCHIVES/archive_name
        if not p.exists(): continue
        canonical=SUBJECTS/meta["slug"]
        state="CANONICAL_EXTRACTED" if canonical.exists() else "ARCHIVE_ONLY"
        rows.append(f"- `{archive_name}` — {meta['label']} — SHA-256 `{digest(p.read_bytes())}` — `prompts/subjects/{meta['slug']}/` — {state}")
        subjects.append({"id":meta["slug"],"label":meta["label"],"archive":f"prompt-archives/{archive_name}","canonicalRoot":f"prompts/subjects/{meta['slug']}/","status":state})
    readme="""# Prompt ZIP Archives

This directory stores subject prompt ZIP packages for provenance and recovery.

Shared authority remains:

1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. canonical subject `README.md` + Master Prompt + `PROJECT_STATE.json`
4. ZIP archive as source snapshot / recovery package

## Execution rule

ZIP files are archives, not simultaneous execution units.

Execute one subject at a time:

`README → PROJECT_STATE / SOURCE_STATUS → active module → router → PASS gate → next module`

The normalization pipeline extracts/repackages subject systems into `prompts/subjects/<slug>/` and removes duplicated per-ZIP Constitution copies from canonical execution.

## Packages

"""+ "\n".join(rows) + """

## Constitution rule

Do not execute ZIP-embedded duplicate constitutions as a second authority.
The canonical shared Constitution is `prompts/CONSTITUTION.md` plus `prompts/constitution/`.

## Source preservation

Archive hashes above preserve provenance. Canonical readable prompt files live under `prompts/subjects/`.
"""
    (ARCHIVES/"README.md").write_text(readme,encoding="utf-8")
    (SUBJECTS/"SUBJECT_PROMPT_INDEX.json").write_text(json.dumps({"schemaVersion":"1.0.0","executionRule":"ONE_SUBJECT_AT_A_TIME","sharedConstitution":"prompts/constitution/","subjects":subjects},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main():
    SUBJECTS.mkdir(parents=True,exist_ok=True)
    results={}
    bootstrap_import(results)
    normalize_individual_archives(results)
    write_indexes()
    print(json.dumps({"normalized":results,"count":len(results)},ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
