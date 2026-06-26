# V13.00 Flag Left Restored Hotfix

## Đã sửa

- Khôi phục danh sách câu dạng flag về **tab nhỏ bên trái** cho Ôn tập.
- Khôi phục danh sách câu dạng flag về **tab nhỏ bên trái** cho Kiểm tra.
- Bên phải giữ làm **khung nội dung chính**.
- Không dùng flag dạng thẻ cuộn ngang trong luồng render chính của Ôn tập/Kiểm tra nữa.
- Thêm CSS chống ẩn/khuyết cho rail trái:
  - rail có chiều cao tối đa;
  - rail tự cuộn;
  - nội dung chính không bị ép vỡ;
  - màn hình nhỏ tự xếp rail lên trên.

## Kiểm tra

- `core.js`: đạt cú pháp.
- `subject-adapter.js`: đạt cú pháp.
- `subject-manifest.js`: đạt cú pháp.
- Toàn bộ JSON trong `data/`: parse đạt.
- Render chính của Ôn tập/Kiểm tra đã dùng `v1300-flag-left`.

## Ghi chú

Lần trước khôi phục sai thành flag cuộn ngang trong khung chính. Bản này đã trả lại đúng yêu cầu: **flag là tab nhỏ bên trái, nội dung chính bên phải**.
