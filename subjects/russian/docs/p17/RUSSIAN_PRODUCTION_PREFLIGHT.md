# Russian Production Preflight

Status for the 2026-10-01 deployment audit: **DEPLOYED / CLOSURE REVALIDATION REQUIRED**.

Known production map:
- runtime: `https://bauman-master-ai.boiech-ai.workers.dev`
- control: `https://bauman-control.boiech-ai.workers.dev`
- Application Management: `https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site`
- access mode: `managed`

The deploy workflow verified required Cloudflare credentials/bindings and exact preview revision before mutation. What was missing was the full post-deploy closure. The corrective closure workflow now treats missing exact SHA, rollback SHA, production origin, or observation evidence as blocking.
