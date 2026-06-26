# MAIN ROUTE R4 FINAL · Logic + UI QA

## Phạm vi
- Chốt lại lộ trình Main sau 4 lượt chỉnh.
- Phân loại lại học phần theo mức độ chắc chắn và vai trò thực tế.
- Không gắn nhãn môn chính thức cho các module tự học, module luận văn hoặc học phần chưa đối chiếu учебный план.

## Kết quả dữ liệu
- 3 giai đoạn lớn: tự chuẩn bị tại Việt Nam, dự bị tại Nga, thạc sĩ Bauman.
- 4 học kỳ chính khóa: HK1, HK2, HK3, HK4.
- 8 trục môn/học phần.
- 31 học phần/module.
- 5 nhóm năng lực đầu ra trong `routeOutcomes`.
- 4 nhóm vai trò đề tài trong `projectTracks`.

## Phân loại đã khóa
- `self_prep`: tự chuẩn bị, không phải môn chính thức.
- `prep_core`: lõi dự bị.
- `prep_support`: bổ trợ dự bị.
- `official_candidate`: học phần ứng viên, cần đối chiếu учебный план.
- `nir_core`: mốc НИР.
- `vkr_core`: mốc ВКР.
- `thesis_module`: module luận văn.
- `support_module`: module hỗ trợ.

## Trục đề tài
- UGV là trục chính vì linh kiện và môi trường thử nghiệm thực tế hơn.
- USV chỉ là hướng mở rộng khi có đủ điều kiện chống nước, GPS/IMU và môi trường thử nghiệm an toàn.
- UAV/UUV không kéo vào trọng tâm để tránh phình lộ trình và rủi ro phần cứng.

## QA logic
- Không có trùng ID course.
- Không có course thiếu `type`, `confidence`, `routeRole`, `deliverable`, `competencies`, `projectUse`, `trackUse`.
- Không có course trỏ sai subject/stage.
- HK3/HK4 đã chuyển trọng tâm sang НИР, thực nghiệm, module luận văn, thực tập và ВКР.
- Dự bị lấy tiếng Nga và khoa học nền làm lõi, kỹ thuật chỉ là bổ trợ nhẹ.

## QA kỹ thuật
- `assets/js/data.js`: syntax OK.
- `assets/js/main.js`: syntax OK.
- `assets/js/planning-main.js`: syntax OK.
- JSON trong toàn bộ thư mục: parse OK.
- ZIP đã nén và test giải nén OK.
