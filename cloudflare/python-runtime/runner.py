#!/usr/bin/env python3
import json
import math
import os
import resource
import signal
import subprocess
import sys
import tempfile
import time

MAX_CODE_BYTES = 32768
MAX_STDIN_BYTES = 65536
MAX_STREAM_BYTES = 65536
MAX_MEMORY_BYTES = 192 * 1024 * 1024
MAX_FILES = 32
SANDBOX_UID = 10001
SANDBOX_GID = 10001
WORKSPACE = "/workspace"

SAFE_ENV = {
    "HOME": WORKSPACE,
    "TMPDIR": WORKSPACE,
    "LANG": "C.UTF-8",
    "PATH": "/usr/local/bin:/usr/bin:/bin",
    "PYTHONDONTWRITEBYTECODE": "1",
    "PYTHONHASHSEED": "0",
    "PYTHONNOUSERSITE": "1",
}


def bounded_text(handle):
    handle.flush()
    handle.seek(0, os.SEEK_END)
    size = handle.tell()
    handle.seek(0)
    data = handle.read(MAX_STREAM_BYTES)
    return data.decode("utf-8", errors="replace"), size >= MAX_STREAM_BYTES


def child_limits(timeout_seconds):
    os.setsid()
    resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY_BYTES, MAX_MEMORY_BYTES))
    resource.setrlimit(resource.RLIMIT_FSIZE, (MAX_STREAM_BYTES, MAX_STREAM_BYTES))
    resource.setrlimit(resource.RLIMIT_NOFILE, (MAX_FILES, MAX_FILES))
    cpu_seconds = max(1, int(math.ceil(timeout_seconds)) + 1)
    resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds))
    os.setgid(SANDBOX_GID)
    os.setuid(SANDBOX_UID)


def kill_process_group(proc):
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass


def run(payload):
    code = payload.get("code")
    stdin_text = payload.get("stdin", "")
    timeout_ms = payload.get("timeoutMs", 3000)

    if not isinstance(code, str) or not code:
        return {"ok": False, "status": "policy_error", "code": "CODE_REQUIRED"}
    if len(code.encode("utf-8")) > MAX_CODE_BYTES:
        return {"ok": False, "status": "policy_error", "code": "CODE_TOO_LARGE"}
    if not isinstance(stdin_text, str) or len(stdin_text.encode("utf-8")) > MAX_STDIN_BYTES:
        return {"ok": False, "status": "policy_error", "code": "STDIN_TOO_LARGE"}
    if not isinstance(timeout_ms, int) or timeout_ms < 100 or timeout_ms > 5000:
        return {"ok": False, "status": "policy_error", "code": "TIMEOUT_OUT_OF_RANGE"}

    timeout_seconds = timeout_ms / 1000.0
    started = time.monotonic()

    with tempfile.TemporaryFile() as stdout_file, tempfile.TemporaryFile() as stderr_file:
        proc = subprocess.Popen(
            ["python3", "-I", "-c", code],
            cwd=WORKSPACE,
            env=SAFE_ENV,
            stdin=subprocess.PIPE,
            stdout=stdout_file,
            stderr=stderr_file,
            start_new_session=False,
            preexec_fn=lambda: child_limits(timeout_seconds),
        )

        timed_out = False
        try:
            proc.communicate(input=stdin_text.encode("utf-8"), timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            timed_out = True
            kill_process_group(proc)
            proc.wait(timeout=1)

        stdout, stdout_truncated = bounded_text(stdout_file)
        stderr, stderr_truncated = bounded_text(stderr_file)
        duration_ms = int((time.monotonic() - started) * 1000)

        output_limited = stdout_truncated or stderr_truncated or proc.returncode == -signal.SIGXFSZ
        resource_failure = (
            "MemoryError" in stderr
            or proc.returncode in (-signal.SIGKILL, -signal.SIGXCPU)
        ) and not timed_out

        if timed_out:
            status = "timeout"
        elif output_limited:
            status = "output_limit"
        elif resource_failure:
            status = "resource_failure"
        elif proc.returncode == 0:
            status = "complete"
        else:
            status = "runtime_error"

        return {
            "ok": status == "complete",
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "exitCode": proc.returncode,
            "durationMs": duration_ms,
            "truncated": {"stdout": stdout_truncated, "stderr": stderr_truncated},
            "policy": {
                "timeoutMs": timeout_ms,
                "memoryBytes": MAX_MEMORY_BYTES,
                "streamBytes": MAX_STREAM_BYTES,
                "network": "container-deny",
                "workspace": WORKSPACE,
                "uid": SANDBOX_UID,
            },
        }


def main():
    try:
        payload = json.load(sys.stdin)
        result = run(payload)
    except Exception as exc:
        result = {
            "ok": False,
            "status": "provider_error",
            "code": "RUNNER_FAILURE",
            "errorClass": type(exc).__name__,
        }
    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
