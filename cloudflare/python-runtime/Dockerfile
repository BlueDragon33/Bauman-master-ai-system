FROM python:3.14.8-slim@sha256:89fb7d3da20043c370643435258bdd7ab755d326d359001d02988ed15ae5219e

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN groupadd --gid 10001 bauman \
    && useradd --uid 10001 --gid 10001 --create-home --shell /usr/sbin/nologin bauman \
    && mkdir -p /workspace /opt/bauman \
    && chown -R bauman:bauman /workspace

COPY runner.py /opt/bauman/runner.py
RUN chmod 0555 /opt/bauman/runner.py

WORKDIR /workspace
CMD ["sleep", "infinity"]
