# Russian Survival Master V12.23 · Review Feedback Layout

## Đã sửa

1. Thu hẹp bảng flag Ôn tập/Kiểm tra xuống cột gọn hơn để vùng nội dung câu hỏi rộng ra.
2. Flag vẫn chỉ là nút số, giữ trạng thái màu hiện có.
3. Trong Ôn tập, nút **Kiểm thử** hiển thị phản hồi rõ:
   - Đúng: hộp xanh, có giải thích vì sao đúng.
   - Sai: hộp đỏ, yêu cầu làm lại, chỉ rõ chương/chủ điểm cần ôn thêm.
4. Câu sai vẫn được lưu vào `reviewProgress.wrong` để thống kê và gom ôn tập lại.
5. Đáp án đúng/sai sau Kiểm thử được tô màu trong chính câu ôn tập, không ảnh hưởng điểm Kiểm tra chính thức.

## Kiểm tra kỹ thuật

- `core.js`: không lỗi cú pháp.
- `subject-manifest.js`: không lỗi cú pháp.
- JSON dữ liệu: hợp lệ.
- ZIP integrity: OK.
