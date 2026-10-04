# PYTHON04 RUNTIME ENVIRONMENT POLICY
Status: PROVIDER-BOUND — CPython 3.14.8 standard-library profile proven.

## Runtime profile

Official Python execution begins with:

- `runtimeProfileId`: `cpython-3.14.8-stdlib-v1`
- implementation: CPython
- version: 3.14.8
- provider: `cloudflare-container-durable-object-v1`
- base image: `python:3.14.8-slim@sha256:89fb7d3da20043c370643435258bdd7ab755d326d359001d02988ed15ae5219e`
- container instance: `lite`
- outbound Internet: disabled
- learner uid/gid: 10001/10001

Changing interpreter minor version, image identity or resource semantics is a PYTHON04 runtime change and triggers the selective revalidation defined by PYTHON00.

## Environment identity

Official evidence records runtime profile, interpreter version, provider identity and package/data profile revisions when behavior can differ.

The provider verifies the actual interpreter identity from inside the running Container; declared metadata alone is not sufficient evidence.

## Packages

The initial profile is standard-library-only. Uncontrolled learner `pip install` is not a supported capability. Internet is disabled, and no package-install command is exposed by the Worker facade.

Future NumPy/Pandas environments require separate pinned profile IDs and acceptance evidence. Their semantics do not become Python language truth.

## Resource policy

The current runner bounds:

- source: 32 KiB;
- stdin: 64 KiB;
- stdout and stderr: 64 KiB each;
- learner address space: 192 MiB;
- open file descriptors: 32;
- requested wall-clock timeout: 100–5000 ms;
- process cleanup: process-group kill plus Container destroy.

These values are profile semantics and must be versioned if materially changed.

## Determinism

Official tasks declare input, seed/randomness policy and dataset revisions where relevant. Each run begins in a clean Container so previous REPL/notebook/filesystem state cannot silently influence official evidence.

## Offline truth

No browser-local Python interpreter is proven. Offline fallback remains reading, tracing, saved code and deterministic non-execution learning surfaces. The product must display execution as unavailable while disconnected rather than pretend server execution is offline.

## Initialization

The Container image is loaded only when Python execution is requested. It is not part of the normal subject page startup path.
