"""Trusted bootstrap. No learner code runs until OS confinement is installed."""
import ast
import collections
import csv
import ctypes
import datetime
import functools
import io
import itertools
import json
import math
import os
import pathlib
import platform
import random
import re
import resource
import statistics
import struct
import sys
import time
import traceback


def confine():
    if platform.machine() != 'x86_64':
        raise RuntimeError('Unsupported syscall architecture')
    # Refuse execution when a daemon/kernel accepted flags without enforcing
    # them. Only the tested unified cgroup v2 platform is supported.
    cgroup = pathlib.Path('/sys/fs/cgroup')
    if not 0 < int((cgroup / 'memory.max').read_text()) <= 134217728:
        raise RuntimeError('memory boundary unavailable')
    if int((cgroup / 'memory.swap.max').read_text()) != 0:
        raise RuntimeError('swap boundary unavailable')
    if int((cgroup / 'pids.max').read_text()) != 1:
        raise RuntimeError('process boundary unavailable')
    quota, period = (cgroup / 'cpu.max').read_text().split()
    if quota == 'max' or not 0 < int(quota) / int(period) <= .5:
        raise RuntimeError('CPU boundary unavailable')
    libc = ctypes.CDLL(None, use_errno=True)
    os.chroot('/workspace')
    os.chdir('/')
    os.setgroups([])
    os.setgid(65534)
    os.setuid(65534)
    os.closerange(3, 1024)
    os.environ.clear()
    resource.setrlimit(resource.RLIMIT_AS, (96 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_CPU, (2, 3))
    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
    resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))

    class Filter(ctypes.Structure):
        _fields_ = [('code', ctypes.c_ushort), ('jt', ctypes.c_ubyte),
                    ('jf', ctypes.c_ubyte), ('k', ctypes.c_uint)]

    class Program(ctypes.Structure):
        _fields_ = [('length', ctypes.c_ushort), ('filter', ctypes.POINTER(Filter))]

    # x86_64 only; verify audit architecture before matching syscall numbers.
    # This is an OS boundary, independent of imports or Python introspection.
    instructions = [(0x20, 0, 0, 4), (0x15, 1, 0, 0xc000003e),
                    (0x06, 0, 0, 0x80000000), (0x20, 0, 0, 0)]
    # Read/write files inside chroot; memory, clocks, signals and normal exit.
    # No sockets, exec, clone/fork, ptrace, mount, namespaces, credentials, BPF.
    allowed = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15,
               16, 17, 18, 19, 20, 24, 25, 28, 35, 39, 60, 63, 72,
               74, 75, 76, 77, 78, 79, 80, 82, 83, 84, 85, 87, 89,
               95, 96, 97, 98, 102, 104, 107, 108, 158, 186, 202,
               204, 218, 228, 230, 231, 257, 262, 263, 264, 267,
               273, 292, 302, 318, 332]
    for syscall in allowed:
        instructions += [(0x15, 0, 1, syscall), (0x06, 0, 0, 0x7fff0000)]
    instructions += [(0x06, 0, 0, 0x00050001)]  # EPERM, fail closed.
    filters = (Filter * len(instructions))(*(Filter(*i) for i in instructions))
    prog = Program(len(instructions), filters)
    if libc.prctl(38, 1, 0, 0, 0) != 0:
        raise RuntimeError('no-new-privileges unavailable')
    if libc.prctl(22, 2, ctypes.byref(prog), 0, 0) != 0:
        raise RuntimeError('seccomp unavailable')


class OutputLimit(BaseException):
    pass


class Capture(io.TextIOBase):
    def __init__(self, budget):
        self.parts = []
        self.budget = budget
        self.truncated = False

    def write(self, text):
        raw = str(text).encode('utf-8', errors='replace')
        room = max(0, 16384 - self.budget[0])
        chunk = raw[:room]
        self.parts.append(chunk.decode('utf-8', errors='replace'))
        self.budget[0] += len(chunk)
        if len(raw) > room:
            self.truncated = True
            raise OutputLimit()
        return len(text)

    def flush(self):
        pass


def main():
    request = json.loads(sys.stdin.buffer.read(65537))
    transport = sys.stdout
    confine()
    # No trusted task source or expected answers are placed in this process.
    files = request.get('files', {})
    for name, text in files.items():
        p = pathlib.Path(name)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding='utf-8')
    budget = [0]
    out, err = Capture(budget), Capture(budget)
    sys.stdout, sys.stderr = out, err
    sys.stdin = io.StringIO(request.get('stdin', ''))
    cells = request.get('cells') or [request['code']]
    namespace = {'__name__': '__main__'}
    result = {'status': 'completed', 'exception': None, 'cells': [], 'trace': []}
    started = time.monotonic()

    def trace(frame, event, _arg):
        if event == 'line' and frame.f_code.co_filename.startswith('cell-'):
            if len(result['trace']) < 100:
                result['trace'].append({'file': frame.f_code.co_filename,
                                        'line': frame.f_lineno})
        return trace

    try:
        if request.get('mode') == 'trace':
            sys.settrace(trace)
        for index, code in enumerate(cells):
            filename = 'cell-%d.py' % (index + 1)
            pathlib.Path(filename).write_text(code, encoding='utf-8')
            exec(compile(code, filename, 'exec'), namespace)
            result['cells'].append({'index': index, 'status': 'completed'})
        if request.get('mode') == 'test':
            result['values'] = [namespace['solve'](value) for value in request['publicInputs']]
    except OutputLimit:
        result['status'] = 'output_limit'
    except MemoryError:
        result['status'] = 'memory_limit'
    except BaseException as error:
        result['status'] = 'runtime_error'
        frames = traceback.extract_tb(error.__traceback__)
        result['exception'] = {'type': type(error).__name__,
                               'message': str(error)[:1000],
                               'frames': [{'file': f.filename, 'line': f.lineno}
                                          for f in frames if f.filename.startswith('cell-')]}
        if isinstance(error, SyntaxError):
            result['exception']['frames'] = [{'file': error.filename,
                                               'line': error.lineno}]
            result['exception']['offset'] = error.offset
    finally:
        sys.settrace(None)
        result.update(stdout=''.join(out.parts), stderr=''.join(err.parts),
                      truncated=out.truncated or err.truncated,
                      durationMs=round((time.monotonic() - started) * 1000))
        transport.write(json.dumps(result, ensure_ascii=True))
        transport.flush()


if __name__ == '__main__':
    main()
