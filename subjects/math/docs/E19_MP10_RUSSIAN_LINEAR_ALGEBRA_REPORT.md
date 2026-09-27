# E19 · m_s02 / m_p10 · Đại số tuyến tính bằng tiếng Nga

## Mục tiêu
Hoàn thiện 8 bài `m_p10_t01..t08` của framework chapter `m_s02` ở giai đoạn dự bị. Học viên phải vừa làm đúng đại số tuyến tính vừa đọc, giải thích điều kiện và bảo vệ lời giải bằng tiếng Nga kỹ thuật.

## Kiến trúc
- Framework chapter: `m_s02`.
- Logical lesson group: `m_p10`.
- Physical runtime:
  - PREP-C09: vector, matrix, determinant/rank, Gaussian elimination, linear maps.
  - PREP-C10: eigen/diagonalization, orthogonal projection/least squares, seminar tổng hợp.
- Program bridges: L01 + L02; L16/L17 bổ sung khi phù hợp.
- Không tạo physical chapter mới từ `m_p10`.

## 8 bài
1. Vector, tọa độ và cơ sở.
2. Ma trận, hàng, cột và phép toán.
3. Định thức, hạng và khả nghịch.
4. Hệ tuyến tính và phương pháp Gauss.
5. Ánh xạ tuyến tính, kernel và image.
6. Trị riêng, vector riêng và chéo hóa.
7. Trực giao, projection và least squares.
8. Seminar Nga: đọc đề, giải, kiểm và bảo vệ lời giải.

## Chuẩn nội dung
Mỗi bài đúng 20 slide, bắt buộc có Nga–Việt–Anh, trọng âm, formula/notation, condition gate, dimension/logic gate, worked example, algorithm, oral response, bẫy logic, assumption gate, error repair, Q&A và summary.

## Khối lượng
| Thành phần | Số lượng |
|---|---:|
| Bài lý thuyết | 8 |
| Slide | 160 |
| Công thức | 24 |
| Bài tập | 64 |
| Ứng dụng | 16 |
| Mô phỏng | 16 |
| Vấn đáp | 8 |
| Câu kiểm tra | 48 |
| Gói ôn tập | 8 |

## Gate
- Academic static: source-map, C09/C10 integrity, 8/160, Cyrillic + role coverage, sidecar/link distribution.
- Runtime static: E186 program-anchor aggregation + E129 physical lesson bridge + canonical stores.
- Chromium: L01 exposes 8 E19 lessons; chọn eigen lesson vẫn giữ logical L01 nhưng renderer route về PREP-C10; Activity Studio + Formula Library; không có page/network error.
- Regression: thay đổi `subjects/math/**` cũng kích hoạt gate E18/E17 hiện hữu.

## Trạng thái
**PASS · E19 + E18/E17 REGRESSION + FAST CI + CONSTITUTION**

PR #148 đã đạt E19 academic/runtime/browser, E18/E17 regression, Development Fast CI và Universal Constitution. Checkpoint E19 được khóa PASS trước merge/publish.
