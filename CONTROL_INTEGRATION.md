# Bauman Master AI ↔ Application Management

## Vai trò

`BlueDragon33/Bauman-master-ai-system` là **client cấp 1** (Bauman Hub). `BlueDragon33/Application-Management` là control-plane. Trung tâm không được mở thẳng runtime học tập thay cho khu quản trị và không được sở hữu dữ liệu môn học của Bauman.

## Cấu trúc client

Bauman Hub hiện quản lý các sub-client/module:

- `Math_Bauman` — repo môn học độc lập;
- `subjects/programming`;
- `subjects/ai`;
- `subjects/signal`;
- `subjects/systems`;
- `subjects/foundation`;
- `subjects/research`;
- `subjects/russian`.

Sub-client chỉ trở thành client cấp 1 khi có runtime, repo và admin contract độc lập. Application Management không tự ý kéo từng môn học ra khỏi Bauman Hub.

## Contract quản trị bắt buộc trước khi bật thao tác

Bauman cần triển khai backend thật cho các nhóm sau:

1. **Device registry** riêng với namespace `BM-...`.
2. **P-256 device gate**; private key chỉ nằm trên endpoint.
3. **Phân loại thiết bị** `desktop / tablet / phone` từ nhiều tín hiệu.
4. **Access permission** và **edit permission** là hai lớp độc lập.
5. **Admin API** có xác thực app-scoped dành cho Application Management.
6. **Audit API** của riêng Bauman.
7. **Content review API** cho các thay đổi được Bauman chủ động gửi lên.
8. **Sub-client inventory API** để báo trạng thái môn học/site con.

Cho tới khi các API trên tồn tại, Application Management chỉ được hiển thị cấu trúc, readiness và policy; không dựng nút `approve`, `publish`, `open site` hoặc `edit` giả.

## Ranh giới dữ liệu

- Không dùng DB/registry `QT-`, `BE-`, `SK-` hoặc `HN-` làm registry Bauman.
- Không dùng hàng đợi Bơi ếch.
- Không kéo dữ liệu học tập chi tiết về control-plane nếu không cần cho quản trị.
- Math_Bauman giữ dữ liệu/runtime riêng khi đã tách site.

## Machine-readable contract

Nguồn chuẩn hiện tại: [`control/application-management.contract.json`](control/application-management.contract.json).

Trường `readiness` phản ánh đúng trạng thái hiện tại. Chỉ đổi một capability sang `available` khi backend tương ứng đã tồn tại và có gate/test chứng minh.
