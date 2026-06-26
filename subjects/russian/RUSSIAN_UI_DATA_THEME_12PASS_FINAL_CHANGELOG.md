# Russian Bauman UI Data Theme 12-Pass FINAL

## Tóm tắt
Hoàn thành 12 lượt sửa theo yêu cầu: sửa thô trước, sửa tinh sau, tập trung vào Tab Học tập, Tab Dữ liệu, theme giao diện và Ôn tập/Kiểm tra không khuyết nội dung.

## Thay đổi chính
1. Tab Học tập: bỏ ký hiệu/mức độ trong bảng nhỏ bên trái ở Bài tập và Nghe/Nói.
2. Tab Dữ liệu: xây lại theo mô hình kho dữ liệu JSON, có nhóm kho, tab file, vùng chi tiết file, preview và thao tác.
3. Giao diện: thêm 5 màu: Bauman Navy, Deep Blue, Emerald Study, Amber Focus, Violet Lab.
4. Tương phản: active/hover/selected rõ hơn bằng viền, glow, nền và bóng.
5. Ôn tập/Kiểm tra: giữ flag trái, nội dung chính bên phải, thêm cuộn an toàn.
6. Chống tràn: áp dụng cho bài tập, ôn tập, kiểm tra, dữ liệu, nút, thẻ, câu hỏi và bản ghi JSON.

## Kiểm tra trong sandbox
- node --check assets/core.js: đạt.
- node --check assets/subject-adapter.js: đạt.
- node --check subject-manifest.js: đạt.
- Parse toàn bộ JSON trong data/: đạt.

## Chưa thể kiểm tra trong sandbox
Không chạy được Live Server GUI thật trong sandbox. Cần mở trên máy bằng Live Server để soi tương tác và bố cục cuối bằng mắt.
