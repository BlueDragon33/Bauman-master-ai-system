# Lượt 30 — Đối chiếu chương trình và khóa Roadmap V2.1

## Phạm vi B117–B120

Lượt 30 thay thế mốc persistence cũ theo yêu cầu mở rộng ngày 2026-08-13. Persistence không bị bỏ; nó được dời có truy vết sang L34/B133. Lượt này chỉ tạo lớp dữ liệu/kiểm định read-only để trả lời ba câu hỏi trước khi sửa giao diện:

1. `main` đang có gì về mặt vật lý?
2. Nền HUTECH nào được xem là đã học nhưng vẫn phải Diagnostic trước khi cấp prerequisite?
3. Roadmap V2.1 phải giữ, tách, xây mới hoặc chờ syllabus Bauman thật ở đâu?

## Bốn tầng bằng chứng

| Tầng | Được phép kết luận | Không được phép kết luận |
|---|---|---|
| `physical_repository_baseline` | File/module thực sự tồn tại tại baseline và có Git blob SHA | Tên module đồng nghĩa nội dung đã đủ hoặc đúng học thuật |
| `prior_curriculum_reconciliation` | Nhóm năng lực người học đã học và nên đưa vào Diagnostic/ôn có điều kiện | Tương đương tín chỉ Bauman hoặc tự động đạt prerequisite |
| `diagnostic_evidence` | Đủ để xác nhận Existing Competency/prerequisite hoặc mở Gap/Cần ôn | Đủ để cấp `Master-ready` |
| `verified_bauman_syllabus_import` | Được tạo môn/bài động ở Kho 09 theo syllabus thật | Suy đoán trước tên môn, bài hoặc chuẩn đầu ra |

## Kết quả đối chiếu `main`

Baseline có đúng 8 module vật lý: `russian`, `math`, `programming`, `ai`, `research`, `foundation`, `signal`, `systems`. Không module nào bị xóa hay đổi ID.

- Giữ và thích nghi trực tiếp: Russian, Math, AI, Research.
- Tách làm nguồn hỗ trợ: Programming cho Python/ADS/DB/Linux; Foundation cho Nga/Toán/Linux/Bauman; Signal và Systems cho Toán/OR/ML/Bauman/NIR.
- Việc một module cũ “hỗ trợ” kho mới không có nghĩa nội dung cũ đã đạt chuẩn bài học của kho đó.

## Kết quả đối chiếu nền HUTECH

Tám nhóm được giữ ở trạng thái `declared_existing_not_yet_diagnostic_verified`: Control, Digital Control, điện–điện tử, đo lường/cảm biến, MCU/hệ nhúng, PLC/SCADA, tự động hóa công nghiệp, toán kỹ thuật và tín hiệu–hệ thống. Chúng chỉ đi theo tuyến `diagnostic_review_only`.

Sáu cụm phải xây mới/đào sâu có hệ thống: Python & OOP; Algorithms & Data Structures; Database/SQL/Information Systems; Linux/OS/Networks; Probability & Statistics; Operations Research/Optimization/Markov/Queueing/Simulation.

Không dùng điểm đầu vào để kết luận chương trình HUTECH nhẹ hơn; ma trận chỉ dùng nội dung/năng lực và bằng chứng Diagnostic.

## Roadmap V2.1 đã khóa

| Chiến lược | Kho |
|---|---|
| Thích nghi và mở rộng | 01 Tiếng Nga; 02 Toán AI & Data |
| Dùng shell cũ, xây lại nội dung | 03 Python & OOP; 08 ML & Research; 10 NIR/Thesis |
| Xây mới có tái dùng hạ tầng | 04 ADS; 05 Database & IS; 06 Linux/OS/Networks; 07 OR & System Modeling |
| Chỉ nhập động từ nguồn xác minh | 09 Current Bauman Subjects |

Tổng không đổi: 10 kho, 85 chương, 304 bài đánh số và 8 chương động. Kho 09 vẫn có 0 bài đánh số; mọi kích hoạt bị chặn cho đến khi có syllabus Bauman xác minh.

## Biên an toàn

- Runtime/UI/persistence/calendar/notification write: 0.
- Xóa module/đổi legacy ID: 0.
- Mọi Existing Competency vẫn cần Diagnostic trước prerequisite.
- Diagnostic không cấp `Master-ready`.
- Dữ liệu/mapping chưa xác minh tiếp tục quarantine.
