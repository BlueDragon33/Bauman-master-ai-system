# Bauman Master AI System

Hệ thống học tập và quản lý lộ trình thạc sĩ Bauman.

## Bắt đầu từ đâu

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — bản đồ kiến trúc trung tâm: tầng nào làm gì, phụ thuộc tầng nào, sửa ở đâu và gate nào phải chạy.
- **[CODEX_STATE.md](CODEX_STATE.md)** — trạng thái kỹ thuật hiện tại.
- **[CODEX_TASK.md](CODEX_TASK.md)** — quy tắc thực hiện công việc hiện tại.

## Quy tắc đặt tên kiến trúc

Kiến trúc được đặt tên theo **trách nhiệm**, không dùng V2/V3/New/Latest/Final làm tên chính.

Ví dụ:

- Foundation — Identity & Domain Model
- Foundation — Content, Asset & Provenance Registry
- Foundation — Learning Content Standard
- Hub Application Shell
- Shared Subject Platform
- Learning State & Academic Planning
- Packaging & Deployment
- Verification & Quality Gates

Version kỹ thuật như `_V1`, `.v1.json` vẫn được giữ khi cần tương thích schema, dữ liệu, storage hoặc API.
