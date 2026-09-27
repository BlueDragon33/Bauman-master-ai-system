# E17 · m_p08 · Chuỗi thời gian nhập môn

## Mục tiêu

Hoàn thiện module logic `m_p08` trong GĐ1 Việt Nam mà không tạo chapter vật lý giả. Module giữ 8 bài đúng theo `theory-framework.json` và được neo học thuật vào `MATH-PROG-L14-stochastic-processes-time-series`.

## Kiến trúc

- `m_p08` là logical module.
- Học liệu runtime nằm trong các physical chapter hiện có:
  - C04: nền xác suất cho autocorrelation.
  - C05: thống kê mô tả, rolling statistics, variance, stationarity.
  - C06: time-index, feature engineering, split/evaluation bằng Python.
- Cầu nối học thuật về sau: HK1-C22 và HK3-C31.
- Không tạo `MATH-VN-C08`.

## 8 bài đã tác giả hóa

1. Time index, sampling frequency, missing timestamp.
2. Trend, seasonality, cycle, noise.
3. Rolling mean và smoothing.
4. Changing variance và dấu hiệu không ổn định.
5. Autocorrelation và lag.
6. Lag features cho forecasting.
7. Stationarity trực giác.
8. Temporal train/test split và future leakage.

## Khối lượng học liệu

| Thành phần | Số lượng |
|---|---:|
| Bài lý thuyết | 8 |
| Slide | 82 |
| Công thức | 24 |
| Bài tập | 64 |
| Ứng dụng | 16 |
| Mô phỏng | 16 |
| Vấn đáp | 8 |
| Câu kiểm tra | 48 |
| Gói ôn tập | 8 |

Mỗi bài có assumption gate, bẫy/counterexample, liên hệ telemetry/AI/Bauman và kiểm soát causal time ordering.

## Sửa lỗi kiến trúc phát hiện trong E17

E186 hiển thị hierarchy 21 program lectures nhưng trước đây `lessonOptions()` lại ưu tiên chapter vật lý cùng số. Điều này có thể làm nhãn chương và nội dung lệch nhau.

E17 nâng E186 lên `E197_PROGRAM_ANCHOR_ROUTING_MP08`:

- ưu tiên tìm lesson theo `programLectureId/programLectureIds`;
- E129 giữ `lessonId` đã chọn và truy ngược `chapterId` vật lý thật trước khi render, tránh router cũ ghi đè;
- L14 có thể gom học liệu m_p08 từ C04/C05/C06;
- khi chọn lesson, renderer nhận lại `chapterId` vật lý thật của chính lesson;
- fallback chapter-number cũ vẫn giữ để tương thích nội dung chưa có program anchor.

## Gate

- `scripts/validate-math-mp08-e17.mjs`: source-map, 8/82, sidecar distribution, orphan links, simulation classes, cấm physical C08.
- `scripts/validate-math-mp08-runtime-routing-e17.mjs`: program-anchor routing + canonical runtime stores.
- `tests/math-mp08-e17-browser.mjs`: L14 exposes 8 lessons, logical→physical route bridge, Activity Studio, Formula Library, request/page errors.
- `.github/workflows/math-mp08-e17-gate.yml`: static + Chromium browser acceptance.

## Trạng thái

**PASS · ACADEMIC + RUNTIME STATIC + CHROMIUM BROWSER + DEVELOPMENT FAST CI**

Không merge/publish cho tới khi dedicated E17 CI và các gate hiện hữu cùng xanh.


## Kết quả PR #144

- Academic gate: PASS.
- Runtime static gate: PASS.
- Chromium browser acceptance: PASS.
- Development Fast CI: PASS.
- Hai lỗi phát hiện trong gate (validator tự bắt policy text và E129 ghi đè physical chapter) đã được sửa trước checkpoint.
