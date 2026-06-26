# DATA_TAB_SCROLLCARDS_HOTFIX

## Mục tiêu
Sửa lỗi UX/UI trong tab Dữ liệu bị ẩn/khuyết nội dung và nút thao tác.

## Thay đổi chính
- Đổi tab Dữ liệu sang dạng **thẻ nguồn dữ liệu có cuộn riêng**.
- Bỏ bố cục `aside` cây bên trái trong `renderStorage()` vì dễ bị khuyết khi nội dung dài.
- Mọi nguồn dữ liệu hiển thị bằng card rõ ràng: nhãn, file path, mô tả, trạng thái, số lượng dự kiến/đã tải.
- Các nguồn lazy-load vẫn hiện trong danh sách dù chưa tải: `dialogue-bauman-az`, `deep-speaking-bauman`, `speaking-link-index`.
- Panel chi tiết nguồn nằm dưới, có preview cuộn riêng để tránh tràn và mất nút.

## Kiểm tra
- `node --check assets/core.js`: đạt.
- Parse toàn bộ JSON trong `data/`: đạt.
- Render mô phỏng `renderStorage()`: đạt.
- Kiểm tra HTML không còn `<aside>` trong tab Dữ liệu: đạt.
- Kiểm tra có đủ nguồn lazy trong HTML render: đạt.

## Giới hạn
Chưa thể xác nhận bằng Live Server GUI thực tế trong sandbox. Cần mở `subjects/russian/index.html` bằng Live Server trên máy thật để quan sát layout.
