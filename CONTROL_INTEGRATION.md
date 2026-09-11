# Bauman Master AI ↔ Application Management

## Vai trò và ranh giới

`BlueDragon33/Bauman-master-ai-system` là **client cấp 1** (Bauman Hub). `BlueDragon33/Application-Management` là **control-plane canonical**. Trung tâm không sở hữu dữ liệu học tập, registry thiết bị, command ledger, session hay audit của Bauman và không được triển khai một bản Bauman admin thứ hai.

Bauman Hub vẫn quản lý các sub-client/module: `Math_Bauman`, Lập trình, AI, Tín hiệu, Hệ thống, Nền tảng, Nghiên cứu và Tiếng Nga. Sub-client chỉ trở thành client cấp 1 khi có runtime, repo và admin contract độc lập.

## Device-control v4

Control service triển khai backend thiết bị riêng của Bauman với namespace `BM-`:

- `bm_devices`: registry thiết bị do Bauman sở hữu;
- `bm_device_challenges`: challenge P-256 dùng một lần, TTL 120 giây;
- `bm_device_sessions`: phiên thiết bị có thể thu hồi, TTL 24 giờ;
- `bm_control_commands`: command ledger bền vững;
- `bm_audit_log`: audit của Bauman;
- device id là SHA-256 của canonical public JWK ECDSA P-256; private key chỉ nằm trên endpoint;
- challenge ký theo chuỗi `bauman-device:v1:<deviceId>:<challengeId>:<challenge>`;
- `approve` và `block` chỉ chạy qua command envelope có `commandId` + `expectedStatus`;
- cùng `commandId` chỉ replay khi payload giống hệt và lệnh trước đã `completed`;
- `block` giữ registry, tắt quyền sửa, thu hồi device session và ghi audit; không xóa thiết bị.

Mutation thiết bị Bauman yêu cầu vai trò `owner`.

## Learning Runtime Device Gate

Bauman learning runtime hiện đã gắn Device Gate v4 tại `assets/js/platform/device-access-gate.js` và được kiểm tra bằng E2E local trong workflow `runtime-device-gate-ci.yml`.

Luồng chuẩn: tạo private key P-256 non-extractable trên thiết bị → đăng ký public JWK → nhận challenge → ký đúng `signingInput` → control service verify → thiết bị `approved` mới nhận session `bm1.*` → heartbeat định kỳ. Khi bị block/revoke/pending, UI bị khóa. Offline grace chỉ dùng last-known approved state trong thời gian hữu hạn; thiết bị chưa từng verify không được mở khóa bằng offline mode.

Core control service vẫn báo capability thận trọng khi chưa có D1/app origin. Cloudflare preview wrapper chỉ quảng bá `learningAccessGate: true` sau khi **D1 schema sẵn sàng và BAUMAN_APP_ORIGIN đã cấu hình**, vì Application Management chỉ được tin live capability, không được suy diễn từ CI.

## API contract

### Device gateway — Bauman sở hữu

- `POST /api/device/register`
- `POST /api/device/challenge`
- `POST /api/device/verify`
- `POST /api/device/heartbeat` — `Authorization: Bearer bm1.<session>`
- `GET /api/device/status?deviceId=...`

Gateway chỉ nhận browser từ `BAUMAN_APP_ORIGIN` đã cấu hình. Nếu chưa cấu hình origin hoặc chưa gắn D1, endpoint fail-closed.

### Remote admin — Application Management gọi

- `GET /api/control/status`
- `GET /api/control/subclients`
- `GET /api/control/devices`
- `POST /api/control/device-commands`
- `GET /api/control/audit`

Vé quản trị giữ issuer `application-management`, audience `bauman-control`, app `bauman-master-ai`, actor, role, central control-device id và expiry ngắn hạn. Service-to-service dùng `BAUMAN_CONTROL_SERVICE_SECRET` riêng của Bauman.

## Local / offline

`control-service/wrangler.local.jsonc` dùng D1 local riêng `bauman-control-local` với UUID giả chỉ cho local Wrangler. Không dùng config này với `--remote`.

Topology local chuẩn:

```text
Application Management :3000
        |
        +--> Bauman Control :3003  (D1 local riêng)
                    |
                    +--> Bauman Learning Runtime :3005
```

Learning runtime tự trỏ `http://127.0.0.1:3003` khi chạy loopback. Local D1 hoàn toàn tách production D1.

## Cloudflare preview — giai đoạn migration

Preview dùng hai Worker tách biệt trong cùng repo:

```text
Application Management preview
        |
        +--> bauman-control-preview
                |-- D1: bauman-control-preview-db
                |
                +--> bauman-master-ai-preview
                     (static Learning Runtime + Device Gate v4)
```

Workflow `.github/workflows/deploy-bauman-preview.yml` là **manual-only** và yêu cầu nhập `DEPLOY_PREVIEW`. Workflow không được auto-deploy production và không được dùng D1 local/production cho preview.

Các biến/secret cần đặt trong GitHub Environment `bauman-preview`:

```text
Secrets:
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID
BAUMAN_CONTROL_SERVICE_SECRET
BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID   # khuyến nghị để guard chống tái sử dụng production DB

Variables:
APPLICATION_MANAGEMENT_PREVIEW_ORIGIN
BAUMAN_CONTROL_PREVIEW_ORIGIN
BAUMAN_RUNTIME_PREVIEW_ORIGIN
```

Ba origin phải là HTTPS exact origins và không được là `*.chatgpt.site`. `scripts/prepare-cloudflare-preview.mjs` tạo `runtime-dist`, `control-service/wrangler.preview.jsonc` và `wrangler.runtime.preview.jsonc`; các file sinh ra không commit.

Preview smoke bắt buộc xác minh: D1 schema thật đã sẵn sàng, control identity đúng, device capabilities thật, CORS device gateway chỉ nhận learning runtime preview, runtime Worker inject đúng `bauman-control-origin`, revision/channel đúng và learning runtime có Device Gate script.

## Production sau preview

Repo hiện chưa tự động promote preview sang production. Chỉ tạo production path sau khi preview pass và Application Management kết nối thử thành công. Production cần D1 Bauman riêng, secret riêng, exact origin của Application Management và exact origin của Bauman Learning Runtime. Không thay URL cũ hoặc tắt rollback path trước khi read-back production pass.

## Quy tắc an toàn

- Không dùng registry `QT-`, `BE-`, `SK-` hoặc `HN-` cho Bauman.
- Không dùng database Bơi ếch, Health_Care hoặc RU_LIFE.
- Không xóa registry khi block.
- Không mutation trong bootstrap/sync/read-back.
- Không bật nút quản trị nếu live `/api/control/status` chưa quảng bá capability tương ứng.
- Không coi P-256 public key đơn thuần là proof; quyền truy cập cần challenge + chữ ký + session.
- Không coi GitHub CI xanh là production đã deploy.
- Không hard-code ChatGPT Sites làm fallback mới.

Nguồn machine-readable: `control/application-management.contract.json`.
