# Russian Production Deployment Record

Audited deployment:
- run: `36882164198`
- exact source: `7697a3f05362c111fb481ebd6043738c12dbcb8c`
- control Worker version: `a27846b3-64c8-455f-980a-92b013bb10f2`
- learning Worker version: `6d625ff2-4b74-4da5-bd24-8893cd38e84e`
- exact production revision eventually observed by the deploy smoke gate.

This proves **artifact deployment**, not complete P17 stability. New releases require the separate closure workflow on the same SHA.
