# A2 Math Bauman Elearning · FINAL E105 SYSTEM QA PATCH

Runtime chính: `subjects/math/`.

Gói vẫn giữ `_common_new_russian_ui_math_template/` để tham chiếu UX/UI cho các môn sau. Thư mục này không tham gia runtime môn Toán.

## E84 fixes

- Thêm **Simulation Pack Mapping Importer** trong Kho môn học → Bài tập · Ứng dụng · Mô phỏng → simulations.json.
- Nhập `chapter_simulation_pack` không còn tự thêm mô phỏng mồ côi khi `lessonId` nguồn không khớp bài thật.
- Khi `lessonId` không khớp, hệ thống mở bảng map `lessonId nguồn → bài đích trong môn Toán`.
- Có gợi ý thông minh theo từ khóa học thuật: vector, ma trận, Gram-Schmidt, least squares, condition number, eigen, Hessian, SVD/PCA.
- Chỉ thay/ thêm mô phỏng nếu bài đích tồn tại trong `subjects/math/data/lessons.json`.
- Giữ unified simulation: `simulations/unified_lab.html`, không tách lý thuyết/ứng dụng.
- Thêm mẫu `chapter_04_external_mapping_sample.json` để kiểm thử importer với pack có ID nguồn không khớp hệ thống.

## FINAL E85 · Universal JSON Import Feedback

E85 sửa toàn bộ luồng Kho môn học:

- Mọi nguồn JSON đều có nút nhập bằng file, dán JSON, xuất nguồn hiện tại và xuất form mẫu JSON.
- Mọi thao tác nhập/dán/mapping đều hiện trạng thái rõ trong hộp `Trạng thái nạp JSON`.
- JSON mô phỏng chương vẫn dùng mapping importer chống mô phỏng mồ côi.
- Form mẫu JSON của từng slot dùng để làm giàu module riêng rồi nhập lại đúng nguồn trong Kho môn học.


## FINAL E87 · Smart Simulation Auto-map & Coverage

- Gom các nút Nhập/Dán/Xuất/Khôi phục/Form mẫu vào một cụm tác vụ gọn trong Kho môn học.
- Bỏ dãy nút rời rạc Nhập/Thay file, Thêm mục, Xuất nguồn, Khôi phục nguồn, Dán JSON mới khỏi vùng hiển thị chính.
- Giữ cơ chế thông báo nạp JSON và mapping mô phỏng trong cùng nguồn dữ liệu.


## E88 · Department sequential chapter numbering

- UI và JSON tác giả dùng số chương nội bộ theo từng Khoa/Bộ môn: Chương 1..n.
- ID kỹ thuật như `MATH-...-C07` vẫn giữ nguyên để không phá liên kết dữ liệu.
- Số chương toàn hệ cũ được lưu ở `globalChapterNo` và `globalChapterTitle`.
- Báo cáo ánh xạ nằm tại `subjects/math/templates/simulation_json/department_chapter_numbering_report_E88.json`.


## E89 · Zero-click Simulation Import

- Nhập JSON mô phỏng chương tự động map vào bài thật theo nội dung học thuật, không bắt người dùng chọn từng dòng nếu hệ thống đã đủ chắc.
- Tự bổ sung các trường thiếu có thể sửa an toàn như `runProtocol`, `decisionRule`, `scenarios`, `reportTemplate`.
- Chỉ mở bảng map khi trùng bài đích hoặc không tìm được bài đích hợp lệ.
- Không tạo mô phỏng mồ côi; tất cả mô phỏng sau import vẫn trỏ `simulations/unified_lab.html`.


## E90 · SIM IMPORT RUNTIME SCOPE FIX
- Sửa lỗi các lớp E87/E89 bị đặt ngoài runtime scope nên auto-map/import JSON mô phỏng không chạy đúng.
- Thêm mẫu import sẵn `templates/simulation_json/Simulation_E90_IMPORT_READY.json`.
- Khi nhập pack mô phỏng hợp lệ, hệ thống tự bổ sung trường thiếu và tự map nếu chắc.


## E92 · Grouped chapters and theory-locked simulations
- Chương hiển thị theo Khoa → Bộ môn → Chương nội bộ.
- Mỗi bộ môn đánh số chương từ 1 đến n.
- 260 mô phỏng được rebuild theo đúng `lessonId` của 260 bài lý thuyết.
- Không còn mô phỏng generic kiểu lý thuyết một đằng, lab một nẻo.


## E93 · Theory spine/content audit rebuild
- Rebuilt lesson theory slides to remove generic cross-domain content.
- Fixed department-local chapter numbering and §chapter.lesson titles.
- See templates/simulation_json/THEORY_CONTENT_AUDIT_E93.json.

## E94 · Formula Specialist Pass

- Rebuilt formulas.json from 678 partially-generic cards to 780 lesson-locked formula cards.
- Each of 260 lessons now has exactly 3 formula roles: core, condition/gate, implementation/check.
- Removed generic formula placeholders and synchronized content-index, knowledge-index and mastery-map formula references.
- Added BAUMAN_MATH_E94_SELF_CHECK().

## E95 · Exercise/Application Alignment Pass

- Rebuilt `exercises.json`: 1040 bài tập, 4 mức/bài, khóa theo lý thuyết + 3 công thức E94 + mô phỏng unified.
- Rebuilt `applications.json`: 520 ứng dụng, 2 ứng dụng/bài, tách kỹ thuật và code/notebook.
- Removed generic cross-domain contexts such as probability wording in final-defense lessons or time-series wording in constrained optimization lessons.
- Synced mastery-map/content-index/knowledge-index exerciseIds and applicationIds.
- Added `BAUMAN_MATH_E95_SELF_CHECK()`.


## E96 · Review / Question Bank Alignment Pass
- Rebuilt `question_bank.json` to 4 aligned questions per lesson: Dễ, Trung bình, Khá, Giỏi.
- Rebuilt `review_packs.json` to route wrong answers back through theory, formula gate, deep check, simulation, practice and application.
- Rebuilt `test_blueprints.json` with exact 8/6/4/2 distribution per chapter.
- Synced `tests.json`, `mastery-map.json`, `content-index.json`, `knowledge-index.json`, and manifests.


## E97 · Professor Q&A Alignment Pass

- Rebuilt 260 professor oral-defense cards.
- Each lesson now has 6 anchored Q&A pairs, 12 dialogue turns, terminology, formula anchors, simulation anchor, application anchors, exercise anchors and review-pack link.
- Fixed generic mismatch such as optimization topics being answered as time-series/sensor data.
- Added BAUMAN_MATH_E97_SELF_CHECK().


## E98 · Simulation Reality / Visual Profile Pass

- Rebuild 260 mô phỏng unified để bám đúng từng `lessonId`, lý thuyết E93, công thức E94, ứng dụng E95 và vấn đáp E97.
- Loại bỏ mô phỏng generic `output = f(input, giả thiết, sai số)` và profile `math_concept_lab`.
- Mỗi mô phỏng có tối thiểu 4 biến điều khiển, 4 readout, 3 kịch bản Chuẩn/Biên/Dễ sai, quy trình chạy và PASS/REVIEW/RISK.
- Renderer mô phỏng E98 đọc trực tiếp `computedReadouts`, `runProtocol`, `scenarios`, `variables`; không còn bỏ qua dữ liệu thật để hiện bảng giả.


## E99 · Chapter Lecture / Slide Support Pass

- Bổ sung `data/chapter_lectures.json`: 32 gói slide bổ trợ cấp chương, mỗi chương 10 slide.
- Gắn `chapterLectureId` và `chapterLectureSupport` vào 260 bài học.
- Bài đầu mỗi chương được thêm 6 slide mở chương để học ngay trong tab Lý thuyết: mở chương, điều kiện vào, bản đồ bài, công thức, mô phỏng, bẫy sư phạm.
- Đồng bộ `content-index`, `knowledge-index`, `mastery-map`, `mindmap`, `content-manifest` và `subject-manifest`.
- Mục tiêu: chương không còn là các bài rời rạc; mỗi chương có mục tiêu, đầu ra, cầu nối bài học và thang đánh giá.


## E101 · Final UX/Data Integration Smoke Test

- Đồng bộ lại index/adapter/manifest từ các nhãn cũ E80/E81/E84 sang E101.
- Bổ sung `chapter_lectures` vào runtime dataFiles/initialDataFiles để slide bổ trợ cấp chương được tải thật.
- Sửa plannedCount: question_bank = 1040, simulations = 260 unified labs.
- Thêm `BAUMAN_MATH_E101_SELF_CHECK()` kiểm dữ liệu, liên kết, chapter lectures và importer.


## E103 · Deep Academic Tree Fix
- Sửa cây Khoa → Bộ môn → Chương bằng metadata thật, không trộn chương khác bộ môn.
- Bổ sung slide tầng 2/tầng 3 cho 260 bài: bản chất, trực giác đảo ngược, liên hệ thực tế.
- Thêm self-check `BAUMAN_MATH_E103_SELF_CHECK()`.


## E104 · E-learning UI Framework

Bản này làm lại khung trình bày theo hướng hệ thống giáo dục e-learning: cây học thuật, reader trung tâm, dock học tập, mô phỏng unified, Kho môn học làm backend dữ liệu. Nội dung chuyên sâu tiếp tục tích hợp bằng JSON, không nhồi trực tiếp vào lõi UI.


## E105 · Professional System QA Patch

- Kiểm hệ thống sau E104 theo vai tester chuyên nghiệp.
- Sửa nhãn runtime còn kẹt E103 trong index/adapter/manifest.
- Sửa thứ tự chương nội bộ của bộ môn nghiên cứu phương pháp: C26 → Chương 1, C31 → Chương 2, C32 → Chương 3.
- Thêm `BAUMAN_MATH_E105_SELF_CHECK()` kiểm counts, orphan refs, per-lesson resources, sequence chương trong bộ môn và label runtime.
