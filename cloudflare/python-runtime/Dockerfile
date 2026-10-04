FROM python@sha256:d1e795fbdab8a4744432467f32f348c6baa99f07abc05ffde710913f65c8261d
COPY runner.py /runner.py
# Empty per-VM filesystem; only the unprivileged interpreter uses it.
RUN mkdir /workspace && chown 65534:65534 /workspace && chmod 755 /workspace
# No application credential or proxy variable survives either interpreter exec.
CMD ["/usr/bin/env","-i","PATH=/usr/local/bin:/usr/bin:/bin","/usr/local/bin/python","-s","-P","-c","import time; time.sleep(86400)"]
