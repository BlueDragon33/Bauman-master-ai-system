# Tiếng Nga Bauman · Russian Survival Master V12.73 Bonus Total QA Polish

Bản bonus kiểm tra tổng thể sau bản trước.

## Đã kiểm tra và sửa

1. Đồng bộ version ở index, manifest, core và subject-adapter để không còn hiển thị nhãn phiên bản cũ ở giao diện.
2. Chặn trạng thái cũ trong localStorage: nếu chu kỳ kiểm tra đã lưu vượt quá ngày học hiện tại, hệ thống tự đưa về “Tự động”.
3. Chặn mức kiểm tra đã lưu nhưng chưa mở: tự đưa về mức hợp lệ đầu tiên.
4. Giữ nguyên storageKey để không làm mất tiến độ học cũ.
5. Kiểm lại cú pháp JS, parse JSON, trùng hàm render/logic, đóng gói ZIP.

## Nguyên tắc giữ lại

- Ngày 7 mở kiểm tra 7 ngày và chỉ mở Dễ.
- Ngày 14 mở 14 ngày và mở Dễ + Trung bình.
- Ngày 21 mở thêm Khá.
- Ngày 28 mở 28 ngày và mở toàn bộ Dễ / Trung bình / Khá / Giỏi.
- Sau ngày 28, nếu chưa pass đủ mốc 28 ngày thì khóa Reset lộ trình, vẫn cho làm lại đề hiện tại.
