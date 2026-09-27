# E18 · m_s01 / m_p09 · Thuật ngữ Toán tiếng Nga cho lớp dự bị kỹ thuật

## Mục tiêu

Hoàn thiện 8 bài bridge tiếng Nga của framework chapter `m_s01`, giữ nguyên các lesson ID `m_p09_t01..t08`. E18 không tạo physical chapter từ tên logical `m_p09`; nội dung runtime được neo vào các chapter dự bị có thật theo bản chất môn học.

## Kiến trúc

- Framework chapter: `m_s01`.
- Logical lesson group: `m_p09`.
- Stage: `prep`.
- Common program bridge: `MATH-PROG-L10-logic-set-theory-boolean`.
- Primary program anchor thay đổi theo bản chất từng bài.
- Physical runtime chapters dùng C07/C08/C09/C11/C12/C15; C16 là secondary source cho bài xác suất–thống kê.
- E129/E186 bridge của E17 được tái sử dụng: logical program route giữ nguyên trong navigation nhưng renderer nhận `chapterId` vật lý thật của lesson.

## 8 bài

1. Cấu trúc đề: дано / найти / доказать / вычислить.
2. Số, tập hợp, hàm số và biểu thức đại số.
3. Vector, ma trận và hệ phương trình.
4. Giới hạn, đạo hàm và tích phân.
5. Xác suất, thống kê và dữ liệu.
6. Đồ thị, hình học và biến đổi tọa độ.
7. Mẫu câu trình bày lời giải và chứng minh.
8. Vấn đáp dự bị: đọc, trả lời, sửa lỗi và bảo vệ lời giải.

## Chuẩn nội dung

Mỗi bài có đúng 20 slide: Nga–Việt–Anh, trọng âm/phát âm, đọc ký hiệu/công thức, mẫu câu, worked example, oral response 30–60 giây, bẫy dịch, micro-grammar, assumption gate, error repair, professor Q&A và self-check.

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

- `scripts/validate-math-mp09-e18.mjs`: source-map, physical spine truth, 8/160, Cyrillic + role coverage, sidecar distribution/link integrity.
- `scripts/validate-math-mp09-runtime-routing-e18.mjs`: E186 programLectureIds routing, E129 physical bridge, canonical stores.
- `tests/math-mp09-e18-browser.mjs`: L10 exposes 8 E18 lessons, T03 routes to physical PREP-C09, Activity Studio + Formula Library, no browser/network errors.
- `.github/workflows/math-mp09-e18-gate.yml`: static + Chromium browser acceptance.

## Trạng thái

**PASS · ACADEMIC + RUNTIME STATIC + CHROMIUM BROWSER + DEVELOPMENT FAST CI**

PR #145 đã đạt academic static, runtime static, Chromium browser và Development Fast CI. Checkpoint E18 được khóa PASS trước bước merge/publish.
