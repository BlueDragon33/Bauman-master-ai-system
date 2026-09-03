# SUB WEB APP · Tổng kiểm tra 2026-09-03

## Kết luận ngắn

Source đã có Web App runtime và tám môn học, nhưng trước đợt xử lý này chưa có URL Site, PWA manifest hoặc bản phát hành mang tên cố định. Bản client còn hard-coded tài khoản/mật khẩu, Service Worker production đang OFF, một file dữ liệu tĩnh vượt 25 MiB và GitHub còn 41 branch lịch sử.

## Kết quả xử lý và phát hành

- `SUB WEB APP v1` đã deploy thành công ở chế độ owner-only: `https://bauman-sub-web-app.dinhnam3391.chatgpt.site`.
- Site version: `1`; source commit: `3f024477521447944c09a65c1c89ef15fd0ad7f9`.
- Gói runtime: 462 file, 104.944.457 byte trước nén; file nén 5.063.907 byte.
- Custom release validator: PASS; 8 subject entries; 0 HTML reference failure; 0 hard-coded credential; 0 asset vượt 24 MiB.
- Toàn bộ 308 JSON trong release parse được; JavaScript release qua syntax check.
- Russian dialogue được chia lossless thành hai phần, giữ đủ 4.164 record; deep-speaking JSON được minify lossless.
- PWA manifest, icon, release marker và Service Worker version `2026.09.03-sub-web-app-v1` đã được đưa vào release.
- `main` vẫn ở đúng SHA bảo toàn `e383912354673bdce7a0059d6b9a23799d74e689`.
- Phần chưa hoàn tất: backend/auth/cloud sync thật thuộc L17–L20; 39 branch lịch sử vẫn chờ xóa sau khi lập bảng SHA phục hồi.

## Số liệu kiểm kê

- Source phát triển: `migration/webapp-l1-audit-storage@998fad0d42b4c8a7ac7678f67e8d653ad24d6363`.
- Baseline giữ nguyên: `main@e383912354673bdce7a0059d6b9a23799d74e689`.
- Kho local: 1.170 file, khoảng 168 MiB trước lọc/minify deploy.
- Runtime entry: 1 Main + 8 subject entries.
- GitHub branches: 41; mục tiêu: 2; cần dọn: 39.
- Master plan cũ: 25 lượt, 235 bước; có một đoạn Merge/Progression Gate bị lặp.

## Phát hiện bắt buộc xử lý trước Site

1. `index.html` và `assets/js/main.js` chứa email/mật khẩu mặc định ở client.
2. Auth hiện tại chỉ là UI gate/localStorage, không phải authentication an toàn.
3. `serviceWorkerCache` đang `false`; offline/PWA mới chỉ được chứng minh trong gate có kích hoạt chủ đích.
4. Chưa có `manifest.webmanifest` và release marker cho bản cài đặt.
5. `dialogue-bauman-az.json` lớn hơn 25 MiB; cần chia lossless trước hosting.
6. Repo chứa report/QA/backup không thuộc runtime; không đưa vào gói deploy.
7. Backend, database, cloud sync và AI proxy chưa có; UI/release không được tuyên bố các tính năng này đã hoàn tất.
8. GitHub còn quá nhiều branch checkpoint trái với quy ước một chính + một tạm.

## Những phần đã đạt trước đợt SUB WEB APP

- L1–L7 đã PASS theo báo cáo/gate hiện có.
- L8-B1 đã PASS; L8-B2 là bước học thuật kế tiếp.
- Web App runtime, Roadmap V3, responsive, deferred large-data loading, Direct Local Reader và offline pack đã có CI evidence.
- Russian và Math giữ specialist engine; Universal Lesson dùng adapter/bridge, không rewrite phá nội dung.

## Phạm vi bản SUB WEB APP đầu tiên

- Có URL Site riêng và Site version bất biến.
- Hiển thị rõ identity SUB WEB APP.
- Owner-only, bỏ credential hard-coded và local password management.
- Giữ toàn bộ runtime môn học; dữ liệu lớn chia phần không mất record.
- PWA manifest và Service Worker bật có chủ đích.
- Progress, schedule, setting và backup là local-device ở phiên bản đầu.
- Backend/auth/cloud sync tiếp tục theo L17–L20.
