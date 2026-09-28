# E20 · m_s03 · Xác suất - thống kê bằng tiếng Nga

## Hiến pháp áp dụng
- policy: `blueprint-os:universal-century-grade` v1.1.0
- blueprint level: B4
- evidence authority: canonical quality gates
- production authority: separate explicit release gate
- không được disable/waive trụ cột.

## Kiến trúc
Framework `m_s03` có legacy alias `MATH-PREP-PS-C11`, nhưng physical spine hiện hành không có chapter này. E20 không materialize alias đó:
- PREP-C15: probability / random variables / moments / distributions.
- PREP-C16: sample statistics / confidence / hypothesis testing.
- program bridge: L12 + L13 cho cả 8 bài. L14 không được dùng làm runtime anchor để giữ vùng chuỗi thời gian E17 độc lập.

## Khối lượng
8 bài · 160 slide · 24 công thức · 64 bài tập · 16 ứng dụng · 16 mô phỏng · 8 Q&A · 48 câu kiểm tra · 8 review pack.

## Chất lượng bắt buộc
Nga–Việt–Anh, trọng âm, formula safety, assumption gate, statistical logic gate, uncertainty gate, worked example, oral response, inference trap, error repair và liên hệ AI/sensor/reliability.

## Gate
Academic static + runtime static + Chromium + E19/E18/E17 regression + Fast CI + Universal Constitution.

## Trạng thái
**PASS · E20 + E19/E18/E17 REGRESSION + FAST CI + CONSTITUTION**

Canonical evidence đã PASS trên PR #149. Regression incident L14 đã được sửa và khóa bằng gate; production/release tiếp tục tuân thủ separate explicit release gate.
