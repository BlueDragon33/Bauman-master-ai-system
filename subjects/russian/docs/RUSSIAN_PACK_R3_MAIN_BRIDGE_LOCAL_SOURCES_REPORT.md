# RUSSIAN PACK R3 · MAIN BRIDGE LOCAL SOURCES REPORT

## Mục tiêu
Chuẩn hóa gói `subjects/russian/` để Main mở môn Tiếng Nga bằng một gói tự chứa, có manifest rõ, bridge rõ và tab Dữ liệu nhận diện đúng nguồn local.

## Đã sửa

### 1. Manifest cho Main
- Cập nhật `subject-manifest.json` và `subject-manifest.js` sang `V12.74 RussianPack R3 Main Bridge Local Sources`.
- Thêm `package`, `paths`, `dataFiles`, `externalDataFiles`, `capabilities`, `routeMapping`.
- Giữ `entry = subjects/russian/index.html` và `editor = subjects/russian/editor.html` để Main không cần đổi đường dẫn.

### 2. Adapter và bridge
- Cập nhật `assets/subject-adapter.js` với `packageRoot`, `dataRoot`, `externalDataRoot`, `dataSourceMeta`, `integration`, `exportSubjectStatus()`.
- Cập nhật `assets/core.js` để dùng `DATA_ROOT`, `EXTERNAL_DATA_ROOT`, `PACKAGE_ROOT` thay vì hard-code.
- Bridge gửi `BAUMAN_SUBJECT_READY`, `BAUMAN_SUBJECT_MANIFEST`, `BAUMAN_SUBJECT_DATA_SOURCES_READY`, `BAUMAN_SUBJECT_REQUEST_TODAY`.
- Bridge nhận thêm `BAUMAN_REQUEST_SUBJECT_MANIFEST` và `BAUMAN_PING` để Main có thể kiểm tra gói môn.

### 3. Tab Dữ liệu
- Hiển thị rõ nguồn local `data/<file>.json`.
- Hero tab Lưu trữ ghi rõ dữ liệu lõi nằm trong `subjects/russian/data/`, dữ liệu mở rộng nằm trong `subjects/russian/external-data/`.
- Khôi phục nguồn dùng `DATA_ROOT` thay vì chuỗi `data/` hard-code.

## Chưa gửi file
Đây là lượt 3, chỉ tạo bản nội bộ. ZIP cuối sẽ gửi ở lượt cuối sau QA kết nối.
