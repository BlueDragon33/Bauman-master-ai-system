# PYTHON SANDBOX SECURITY REPORT
Provider: `cloudflare-container-durable-object-v1` · CPython 3.14.8.

P6 reuses and extends the real Worker + Docker Container evidence: infinite loop containment, address-space containment, output bounding, path traversal denial, secret/environment absence, outbound Internet denial, non-root subprocess confinement, unsafe deserialization confined to sandbox, hidden-test separation and fresh run identities.

P6 additionally requires client-known governed run IDs so in-flight cancellation targets the correct sandbox and stale results are quarantined by the learner UI. Production smoke uses only a non-destructive environment-isolation probe.
