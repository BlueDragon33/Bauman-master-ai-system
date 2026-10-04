FROM python@sha256:593bd06efe90efa80dc4eee3948be7c0fde4134606dd40d8dd8dbcade98e669c
COPY sandbox.py /runner.py
# Docker may inject proxy defaults. The learner interpreter starts with a new,
# explicit environment; neither those values nor platform bindings survive exec.
# -s/-P exclude user site and script-directory imports without -I's implicit
# -E, which would silently ignore our explicit deterministic PYTHONHASHSEED.
ENTRYPOINT ["/usr/bin/env", "-i", "PATH=/usr/local/bin:/usr/bin:/bin", "PYTHONHASHSEED=0", "/usr/local/bin/python", "-s", "-P", "/runner.py"]
