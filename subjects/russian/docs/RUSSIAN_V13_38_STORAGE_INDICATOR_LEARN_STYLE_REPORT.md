# V13.38 Storage Indicator Learn-Style Hotfix

## Mục tiêu
- Sửa indicator của nút Kho môn học trong tab Dữ liệu/Lưu trữ theo đúng kiểu tab Học tập.
- Nút giữ nguyên nhãn Kho môn học.
- Indicator là thẻ riêng bên cạnh nút, luôn hiển thị trạng thái nguồn dữ liệu hiện tại.

## Thay đổi
- Thay cấu trúc `storageGroupFilterTabs()`:
  - Bỏ indicator nằm trong summary/dòng dưới gây rỗng.
  - Tạo container `storage-source-control-v1338` gồm menu 3D và card trạng thái riêng.
- CSS mới:
  - Menu 3D màu xanh đậm, hiệu ứng nhấn.
  - Indicator neon giống `learn-structure-indicator` của tab Học tập.
  - Dropdown vẫn xổ dọc từ nút Kho môn học.

## Kiểm tra
- `node --check assets/core.js`: OK.
- JSON toàn bộ: OK.
