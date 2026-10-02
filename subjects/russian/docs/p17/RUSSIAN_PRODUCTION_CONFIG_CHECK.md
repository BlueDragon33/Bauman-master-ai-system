# Russian Production Config Check

Audited non-secret production configuration from GitHub Actions logs:
- `BAUMAN_RUNTIME_PRODUCTION_ORIGIN=https://bauman-master-ai.boiech-ai.workers.dev`
- `BAUMAN_CONTROL_PRODUCTION_ORIGIN=https://bauman-control.boiech-ai.workers.dev`
- `APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN=https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site`
- `BAUMAN_ACCESS_MODE=managed`

Secret values are intentionally excluded. The deploy gate verifies required secret names/bindings are present. Closure rechecks the public origin map and hashes the non-secret config into release evidence.
