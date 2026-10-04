# PYTHON SANDBOX SECURITY REPORT

Provider: Cloudflare Container Durable Object.

Mandatory properties retained from P4 and revalidated by P6:
- fresh container per run;
- Internet disabled;
- isolated workspace;
- platform secrets absent;
- bounded output and timeout behavior;
- hidden-test material remains server-side;
- no browser/Worker eval fallback;
- provider failure fails closed.

P6 additionally checks the hidden-boundary route and preserves the P4 golden-fixture suite as a required CI dependency.
