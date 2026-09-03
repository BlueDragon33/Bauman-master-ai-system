# BAUMAN MASTER AI · SUB WEB APP · MASTER EXECUTION PLAN

Ngày chốt: 2026-09-03  
Nguồn phát triển duy nhất: `migration/webapp-l1-audit-storage`  
Baseline GitHub được giữ nguyên: `main@e383912354673bdce7a0059d6b9a23799d74e689`  
Kênh phát hành cố định: **SUB WEB APP**

Release đã chốt: **SUB WEB APP v1 · 2026.09.03-v1 · PASS**  
URL production riêng tư: `https://bauman-sub-web-app.dinhnam3391.chatgpt.site`  
Site source commit: `3f024477521447944c09a65c1c89ef15fd0ad7f9`

## 1. Quy ước thống nhất

1. `main` là baseline lưu trữ, không còn là nguồn phát hành Web App.
2. Chỉ nhánh `migration/webapp-l1-audit-storage` được dùng để phát triển.
3. **SUB WEB APP** là bản người dùng mở và sử dụng; mỗi lần phát hành tạo một Site version bất biến.
4. Không tạo thêm branch/checkpoint GitHub cho từng bước. Checkpoint mới dùng Site version, commit và báo cáo gate.
5. Lỗi ở bước nào thì dừng tại bước đó, sửa và chạy lại gate; không đánh dấu PASS bằng mô tả.
6. Không xóa hay làm mất nội dung Russian, Math và các subject engine hiện có khi chuẩn hóa.
7. Không lưu mật khẩu/secret thật trong HTML, JavaScript, JSON, backup hoặc Git history mới.
8. Tính năng chưa có backend phải ghi đúng là local-only; không gắn nhãn cloud sync hoặc auth thật.
9. Offline chỉ cache shell và gói môn do người dùng chọn; không tự tải toàn bộ kho dữ liệu lớn.
10. Mọi release phải có source SHA, version, validation result và rollback target.

## 2. Tổng số lượt và bước

- Lộ trình lõi hiện có: **25 lượt · 235 bước**.
- Lượt phát hành cố định SUB WEB APP: **1 lượt · 12 bước**.
- Tổng kế hoạch thống nhất: **26 lượt · 247 bước**.
- Tiến độ học thuật hiện tại: L1–L7 PASS; L8-B1 PASS; bước kế tiếp sau khi đóng SUB WEB APP là **L8-B2 OOP + SOLID/Patterns**.

## 3. Lượt SWA · Fixed SUB WEB APP Release · 12/12 PASS

1. Đối chiếu repo, branch, source SHA, trạng thái CI và phạm vi nội dung.
2. Khóa quy ước ba lớp: `main` lưu trữ, một branch phát triển, SUB WEB APP phát hành.
3. Loại hard-coded email/password và cơ chế giả-auth khỏi bản Site.
4. Giữ Site owner-only; chỉ mở multi-user sau Backend/Auth thật.
5. Lọc file báo cáo, QA, backup và artifact không thuộc runtime khỏi gói triển khai.
6. Minify JSON lossless và chia file tĩnh vượt giới hạn mà vẫn giữ đủ record.
7. Gắn identity `SUB WEB APP`, release manifest, PWA manifest, icon và version marker.
8. Bật Service Worker có chủ đích cho kênh SUB WEB APP, giữ cache versioned và rollback-safe.
9. Kiểm tra JSON, JavaScript, HTML entry, tám subject routes, static paths và lazy assets.
10. Chạy lại các gate L5–L8 phù hợp với source và kiểm tra không còn credential trong release.
11. Lưu một Site version bất biến và triển khai bằng URL riêng.
12. Ghi audit, rollback, phần chưa có thật và điểm tiếp tục L8-B2.

Kết quả cố định: Site version `1`, deployment `succeeded`, owner-only; bản runtime có 462 file, không còn hard-coded credential, không có asset vượt 24 MiB và giữ đủ 4.164 Russian dialogue records sau khi chia phần.

## 4. Lộ trình lõi 25 lượt · 235 bước

| Lượt | Bước | Phạm vi | Trạng thái |
|---:|---:|---|---|
| 1 | 15 | Audit toàn hệ thống | PASS |
| 2 | 8 | Safety Platform Layer | PASS |
| 3 | 15 | Storage abstraction toàn hệ | PASS |
| 4 | 8 | Personal Learning State | PASS |
| 5 | 25 | Web App runtime, Roadmap V3, offline-first | PASS runtime; phát hành thật thuộc SWA |
| 6 | 11 | Universal Lesson Architecture & Subject Factory | PASS |
| 7 | 9 | Reference Subjects: Russian, Math, Foundation | PASS |
| 8 | 14 | Programming, Python, OOP, Algorithms, DB, Software Engineering | B1 PASS; B2 kế tiếp |
| 9 | 13 | AI, Data, ML, Neural, Time Series | Chưa bắt đầu |
| 10 | 11 | ASOIU, Reliability, Systems và bridge bổ trợ | Chưa bắt đầu |
| 11 | 9 | Research Methodology, НИР 1–4, ВКР | Chưa bắt đầu |
| 12 | 10 | Multilingual Immersion VI/RU/EN | Chưa bắt đầu |
| 13 | 8 | AI Core & Context Engine | Chưa bắt đầu |
| 14 | 8 | Adaptive Learning Engine | Chưa bắt đầu |
| 15 | 8 | AI Language Tutor | Chưa bắt đầu |
| 16 | 7 | AI Research Mentor | Chưa bắt đầu |
| 17 | 6 | Backend/API Shell | Chưa bắt đầu |
| 18 | 6 | Authentication & Authorization thật | Chưa bắt đầu |
| 19 | 7 | Database và Cloud Sync đa thiết bị | Chưa bắt đầu |
| 20 | 5 | Cloud integration cho progress/test/schedule/AI | Chưa bắt đầu |
| 21 | 8 | Content Operations & Curriculum Governance | Chưa bắt đầu |
| 22 | 5 | Security, Privacy, Performance Hardening | Chưa bắt đầu |
| 23 | 6 | PWA hardening, public staging, cross-device QA | Chưa bắt đầu; không còn là lần đầu có Site |
| 24 | 9 | Learning Quality, Accessibility, Acceptance | Chưa bắt đầu |
| 25 | 4 | Production, Backup, Rollback, Monitoring | Chưa bắt đầu; nâng cấp chính SUB WEB APP |

## 5. Các cụm xử lý còn lại

### Cụm A · Hoàn thiện học liệu và subject engines

L8–L12, tổng **57 bước**: Programming; AI/Data; Systems; Research; VI/RU/EN. Mỗi môn giữ source authority riêng, qua adapter/contract chung và chỉ đạt Master-ready khi có evidence.

### Cụm B · AI và thích nghi học tập

L13–L16, tổng **31 bước**: AI context có nguồn, adaptive engine, Language Tutor và Research Mentor. Không đưa secret vào client; offline vẫn học được khi AI không khả dụng.

### Cụm C · Backend, auth và đồng bộ

L17–L20, tổng **24 bước**: API tối thiểu, auth thật, database record-level và đồng bộ đa thiết bị. Đây là điều kiện trước khi bật tài khoản nhiều người và cloud progress.

### Cụm D · Quản trị nội dung, hardening và acceptance

L21–L25, tổng **32 bước**: provenance, review/publish, security/privacy, PWA public staging, accessibility/UAT và production monitoring.

## 6. Gate phát hành SUB WEB APP

Một version chỉ được phát hành khi tất cả điều kiện sau PASS:

- Không thiếu `index.html`, PWA manifest, Service Worker, release marker và tám subject entry.
- Tất cả JSON trong gói triển khai parse được; JavaScript quan trọng qua syntax check.
- Không có credential mặc định hoặc password hard-coded.
- Không asset đơn lẻ vượt ngân sách hosting; dữ liệu chia phần phải giữ nguyên tổng record.
- Route Main → subject và subject asset path cùng origin.
- Service Worker dùng version mới, cài đặt atomic và không precache dữ liệu nặng.
- Source SHA và `main` preservation SHA khớp release manifest.
- Site version được lưu bất biến; rollback quay về version trước, không sửa `main`.

## 7. Dọn branch GitHub

Audit ngày 2026-09-03 ghi nhận **41 branch**, trong khi trạng thái mong muốn chỉ có:

1. `main`
2. `migration/webapp-l1-audit-storage`

Ba mươi chín branch lịch sử phải được xóa sau khi lưu bảng SHA phục hồi. Không tạo branch `SUB WEB APP`; SUB WEB APP là kênh Site có version, tránh tái phát sinh branch rác.

## 8. Điểm tiếp tục

Sau khi Lượt SWA đủ 12/12 PASS và URL hoạt động, tiếp tục đúng **L8-B2**. Mọi checkpoint sau đó cập nhật SUB WEB APP bằng Site version mới; `main` không đổi trừ khi người dùng yêu cầu rõ ràng.
