# Russian V13.08 · Assessment Readability + Mixed Exam Papers

## Sửa chính
- Ôn tập/Kiểm tra bỏ cơ chế khung cố định gây cắt nội dung; nội dung câu hỏi và đáp án đi theo luồng dọc, đọc được hết bằng cuộn trang.
- Bảng flag giữ đúng 20 câu/trang, 4 cột × 5 hàng, không kéo ngang.
- Kiểm tra có 4 dạng: Phổ thông 20 câu, Tăng cường 40 câu, Nâng cao 60 câu, Chuyên sâu 100 câu.
- Mỗi dạng đề phối câu theo tỷ lệ: 30% dễ, 30% trung bình, 20% khá, 20% giỏi.
- Dạng 40/60/100 dùng phân trang flag theo từng cụm 20 câu để vẫn giữ 4×5 trong một khung nhìn.
- Bổ sung fallback dữ liệu: nếu giai đoạn hiện tại thiếu số câu theo tỷ lệ, hệ thống ưu tiên giai đoạn đang học rồi bù từ kho toàn hệ thống.

## Kiểm tra
- `node --check assets/core.js`: pass.
- Parse toàn bộ JSON: pass.
- CSS braces: pass.
- Kiểm tra tĩnh cấu hình 4 dạng đề và tỷ lệ câu: pass.
