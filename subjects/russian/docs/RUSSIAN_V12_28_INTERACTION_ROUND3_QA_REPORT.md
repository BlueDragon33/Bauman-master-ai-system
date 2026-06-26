# Russian Bauman V12.28 · Interaction Round 3 QA

## Mục tiêu
Chốt lượt 3 theo hướng QA gần-final: sửa các điểm thao tác dễ vấp, làm rõ phím tắt, tăng hiệu quả luyện nói theo vai và làm sạch nhãn phiên bản.

## Thay đổi chính
1. Speaking Lab có **thanh tiến độ theo vai** và checklist huấn luyện.
2. Thêm nút **Câu của tôi →** để nhảy thẳng tới lượt nói của vai A/B đang chọn.
3. Thêm phím tắt trong Đối thoại: `R/Enter` ghi âm, `L` nghe mẫu, `S` nghe chậm, `N` tới câu của vai mình, `V` ẩn/hiện nghĩa, `A/B/0` đổi vai.
4. Tab Luyện viết thêm phím tắt: `←/→` đổi mẫu, `↑/↓` đổi nét, `Backspace` hoàn tác nét vừa viết.
5. Khi đổi mẫu chữ, giấy luyện được dọn sạch để không bị nét cũ lẫn sang mẫu mới.
6. Bổ sung CSS responsive cho Speaking Lab, slide trình chiếu, flashcard và handwriting canvas.
7. Dọn nhãn phiên bản lên V12.28 đồng bộ ở manifest, index, adapter và README.

## Kiểm tra
- `core.js`: kiểm tra cú pháp bằng Node.
- `subject-adapter.js`: kiểm tra cú pháp bằng Node.
- `subject-manifest.json`: JSON hợp lệ.
- `handwriting.json`: JSON hợp lệ, giữ đủ 33 mẫu chữ cái Cyrillic có strokes.
