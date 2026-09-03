# SUB WEB APP · Kiến trúc Hub + Subject Sites

Ngày chốt: 2026-09-04  
Trạng thái: `SWA-M1_PASS_L8-B2_READY`  
Contract: `BAUMAN_SITE_BRIDGE_V1`

## 1. Mô hình chính thức

- `SUB WEB APP Hub` quản lý lộ trình, lịch, nhiệm vụ, tiến độ tổng và НИР/ВКР.
- Mỗi môn là một Site/Web App riêng, sở hữu code, dữ liệu, editor, PWA, Service Worker và version history.
- Hub không nhúng iframe, không chứa bản sao runtime môn và không được sửa trực tiếp đường dẫn Site từ local state.
- Một môn có thể nâng cấp/phục hồi độc lập mà không cần phát hành lại Hub hoặc bảy môn còn lại.

## 2. Contract giao tiếp tối thiểu

Hub → môn:

- `subjectId`, `taskId`, `courseId`
- tên nhiệm vụ, giai đoạn, ngày học, thời lượng
- số câu và điểm mục tiêu

Môn → Hub:

- ready/online/status
- `taskId`, tổng câu, số đúng, phần trăm
- completed và số phút học

Không truyền credential, token, source code, file người dùng hoặc kho JSON môn học qua bridge.

## 3. Transport

1. Query string mang context tối thiểu khi Hub mở Site.
2. `window.postMessage` chỉ chấp nhận exact origin đã đăng ký.
3. Mỗi môn công bố `/api/subject.json`, `/api/status.json`, `/api/contract.json` dạng read-only.
4. Khi mở trực tiếp không qua Hub, môn chạy local fallback.

## 4. Registry chính thức

| ID | Subject Site |
|---|---|
| `russian` | https://bauman-subject-russian.dinhnam3391.chatgpt.site |
| `math` | https://bauman-subject-math.dinhnam3391.chatgpt.site |
| `programming` | https://bauman-subject-programming.dinhnam3391.chatgpt.site |
| `ai` | https://bauman-subject-ai.dinhnam3391.chatgpt.site |
| `systems` | https://bauman-subject-systems.dinhnam3391.chatgpt.site |
| `signal` | https://bauman-subject-signal.dinhnam3391.chatgpt.site |
| `research` | https://bauman-subject-research.dinhnam3391.chatgpt.site |
| `foundation` | https://bauman-subject-foundation.dinhnam3391.chatgpt.site |

Hub: https://bauman-sub-web-app.dinhnam3391.chatgpt.site

## 5. Version và rollback

- Hub hiện hành: Site version `2`.
- Tám Subject Site hiện hành: Site version `1`.
- Hub v1 vẫn là rollback target trước khi tách.
- Từng môn có rollback boundary riêng; lỗi môn nào không tác động release của môn khác.

## 6. Giới hạn hiện tại

- Progress và setting vẫn lưu trên thiết bị.
- JSON endpoint hiện read-only.
- Backend API, application auth và cloud sync đa thiết bị thuộc L17–L20.
- Toàn bộ Site đang owner-only.
