# Bauman Master AI ↔ Application Management

## Vai trò và ranh giới

`BlueDragon33/Bauman-master-ai-system` là **client cấp 1** (Bauman Hub). `BlueDragon33/Application-Management` là control-plane. Trung tâm không sở hữu dữ liệu học tập, registry thiết bị, command ledger, session hay audit của Bauman.

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
- cùng `commandId` chỉ replay được khi payload giống hệt và lệnh trước đã `completed`;
- lệnh đang `processing`, `failed` hoặc `uncertain` không được tự chạy lại mù;
- `block` giữ registry, tắt quyền sửa, thu hồi mọi device session đang hoạt động và ghi audit; không xóa thiết bị.

Mutation thiết bị Bauman yêu cầu vai trò `owner`.

## API contract

### Device gateway — Bauman sở hữu

- `POST /api/device/register`
- `POST /api/device/challenge`
- `POST /api/device/verify`
- `POST /api/device/heartbeat` — yêu cầu `Authorization: Bearer bm1.<session>`
- `GET /api/device/status?deviceId=...`

Gateway chỉ nhận browser từ `BAUMAN_APP_ORIGIN` đã cấu hình. Nếu chưa cấu hình origin hoặc chưa gắn D1, endpoint fail-closed. Challenge được tiêu thụ một lần trước khi kết quả proof được chấp nhận. Chỉ thiết bị `approved` sau proof hợp lệ mới nhận session. Thiết bị `pending` hoặc `blocked` không nhận session.

### Remote admin — Application Management gọi qua vé app-scoped

- `GET /api/control/status`
- `GET /api/control/subclients`
- `GET /api/control/devices`
- `POST /api/control/device-commands`
- `GET /api/control/audit`

Vé quản trị giữ issuer `application-management`, audience `bauman-control`, app `bauman-master-ai`, actor, role, central control-device id và expiry ngắn hạn. Control API cũng có thể dùng service secret riêng của Bauman cho service-to-service khi cần.

## Local / offline

`control-service/wrangler.local.jsonc` cung cấp D1 local riêng tên `bauman-control-local`, binding `DB`, dùng UUID giả chỉ cho local Wrangler. Không được dùng config này với `--remote`.

Khi chạy Local Control Plane, Bauman Control dùng port `3003`. Application Management phải chạy cùng máy/mạng được cấu hình và trỏ `BAUMAN_CONTROL_LOCAL_BASE_URL` vào runtime này. Local D1 hoàn toàn tách production D1.

## D1 production bắt buộc

Repository không chứa production database id hoặc production secret. Trước khi bật production phải:

1. tạo/chọn D1 production thuộc Bauman;
2. bind D1 vào control service với binding chính xác `DB`;
3. áp migration `control-service/migrations/0001_device_control.sql`;
4. cấu hình `BAUMAN_CONTROL_SERVICE_SECRET` riêng, tối thiểu 32 ký tự;
5. cấu hình `APPLICATION_MANAGEMENT_ORIGIN` đúng origin production của Trung tâm;
6. cấu hình `BAUMAN_APP_ORIGIN` đúng origin production của Bauman Hub;
7. deploy control service rồi kiểm tra `/api/control/status` trả capability thật từ DB trước khi Trung tâm bật mutation.

Nếu `DB` chưa bind hoặc schema chưa tồn tại, runtime status trả `configuration-required`; Application Management không được suy diễn trạng thái `connected` chỉ từ CI.

## Trạng thái learning access gate

Backend device identity, challenge/proof, session, block/revoke và audit đã được triển khai trong control service, nhưng **learning runtime chưa được tuyên bố là đã bảo vệ bởi device gate** cho tới khi frontend Bauman dùng đúng v4 gateway và E2E pass.

PR/runtime cũ dùng endpoint trung gian hoặc signing input khác không được merge nguyên trạng. Runtime mới phải:

1. tạo P-256 private key non-extractable trên endpoint;
2. đăng ký public JWK;
3. nhận challenge từ control service;
4. ký đúng `signingInput` server trả về;
5. verify để nhận `bm1.*` session khi thiết bị đã approved;
6. heartbeat bằng session;
7. khóa UI ngay khi heartbeat trả `DEVICE_BLOCKED`, `DEVICE_PENDING`, `DEVICE_SESSION_REVOKED` hoặc hết offline grace.

Chỉ sau E2E đó mới đổi capability `learningAccessGate` sang true.

## Biến môi trường

### Bauman control service

```env
BAUMAN_CONTROL_SERVICE_SECRET=<secret riêng của Bauman, tối thiểu 32 ký tự>
APPLICATION_MANAGEMENT_ORIGIN=<origin production của Application Management>
BAUMAN_APP_ORIGIN=<origin production của Bauman Hub>
```

Ngoài ra cần D1 binding tên `DB`. Không đưa secret vào static JS hoặc biến public.

### Application Management

```env
BAUMAN_BASE_URL=<origin production của Bauman control service>
BAUMAN_CONTROL_SERVICE_SECRET=<cùng secret với control service>
```

## Quy tắc an toàn

- Không dùng registry `QT-`, `BE-`, `SK-` hoặc `HN-` cho Bauman.
- Không dùng database Bơi ếch, Health_Care hoặc RU_LIFE.
- Không xóa registry khi block.
- Không mutation trong bootstrap/sync/read-back.
- Không bật nút quản trị nếu live `/api/control/status` chưa quảng bá capability tương ứng.
- Không coi P-256 public key đơn thuần là proof; quyền truy cập cần challenge + chữ ký + session.
- Không coi GitHub CI xanh là production đã deploy.

Nguồn machine-readable: `control/application-management.contract.json`.
