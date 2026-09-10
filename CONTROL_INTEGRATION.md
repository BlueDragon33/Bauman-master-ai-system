# Bauman Master AI ↔ Application Management

## Vai trò và ranh giới

`BlueDragon33/Bauman-master-ai-system` là **client cấp 1** (Bauman Hub). `BlueDragon33/Application-Management` là control-plane. Trung tâm không sở hữu dữ liệu học tập, registry thiết bị, command ledger hay audit của Bauman.

Bauman Hub vẫn quản lý các sub-client/module: `Math_Bauman`, Lập trình, AI, Tín hiệu, Hệ thống, Nền tảng, Nghiên cứu và Tiếng Nga. Sub-client chỉ trở thành client cấp 1 khi có runtime, repo và admin contract độc lập.

## Device-control v3

Control service đã triển khai backend thiết bị riêng của Bauman với namespace `BM-`:

- `bm_devices`: registry thiết bị do Bauman sở hữu;
- `bm_control_commands`: command ledger bền vững;
- `bm_audit_log`: audit của Bauman;
- danh tính thiết bị được suy ra server-side từ public JWK ECDSA P-256; private key không được gửi lên server;
- `approve` và `block` chỉ chạy qua command envelope có `commandId` + `expectedStatus`;
- cùng `commandId` chỉ replay được khi payload giống hệt và lệnh trước đã `completed`;
- lệnh đang `processing`, `failed` hoặc `uncertain` không được tự chạy lại mù;
- `block` giữ registry, tắt quyền sửa và ghi audit; không xóa thiết bị.

Mutation thiết bị Bauman hiện yêu cầu vai trò `owner`, đúng với policy của Application Management.

## API contract

### Device gateway — Bauman sở hữu

- `POST /api/device/register`
- `POST /api/device/heartbeat`
- `GET /api/device/status?deviceId=...`

Gateway chỉ nhận browser từ `BAUMAN_APP_ORIGIN` đã cấu hình. Nếu chưa cấu hình origin hoặc chưa gắn D1, endpoint fail-closed.

### Remote admin — Application Management gọi qua vé app-scoped

- `GET /api/control/status`
- `GET /api/control/subclients`
- `GET /api/control/devices`
- `POST /api/control/device-commands`
- `GET /api/control/audit`

Vé quản trị giữ issuer `application-management`, audience `bauman-control`, app `bauman-master-ai`, actor, role, central control-device id và expiry ngắn hạn. Control API cũng có thể dùng service secret riêng của Bauman cho service-to-service khi cần.

## D1 production bắt buộc

Source đã có migration `control-service/migrations/0001_device_control.sql`, nhưng repository **không chứa database id giả**. Trước khi bật production phải:

1. tạo/chọn D1 production thuộc Bauman;
2. bind D1 vào control service với tên binding chính xác `DB`;
3. áp dụng migration `0001_device_control.sql`;
4. cấu hình `BAUMAN_CONTROL_SERVICE_SECRET` riêng, tối thiểu 32 ký tự;
5. cấu hình `APPLICATION_MANAGEMENT_ORIGIN` đúng origin production của Trung tâm;
6. cấu hình `BAUMAN_APP_ORIGIN` đúng origin production của Bauman Hub;
7. deploy control service rồi kiểm tra `/api/control/status` trả capability thật từ DB trước khi Trung tâm bật mutation.

Nếu `DB` chưa bind hoặc schema chưa tồn tại, runtime status trả `configuration-required`; Application Management không được suy diễn trạng thái `connected` chỉ từ CI.

## Trạng thái access gate

Device registry/gateway/control mutation đã được triển khai ở backend, nhưng **learning runtime hiện chưa được tuyên bố là đã bảo vệ bởi device gate**. Static Bauman frontend còn luồng đăng nhập cục bộ cũ; không được coi đó là cơ chế xác thực production.

Cutover tiếp theo phải tạo challenge/session hoặc cơ chế chứng minh sở hữu private key P-256, nối static runtime vào gateway, rồi mới khóa truy cập học tập theo trạng thái `approved`. Chỉ sau E2E đó mới đổi capability `learningAccessGate` sang true.

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
- Không coi GitHub CI xanh là production đã deploy.

Nguồn machine-readable: `control/application-management.contract.json`.
