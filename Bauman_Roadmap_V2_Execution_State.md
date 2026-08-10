# BAUMAN MASTER AI — ROADMAP V2

## Trạng thái triển khai tuần tự

- Mốc hoàn thành gần nhất: **Lượt 20 / Bước 80**.
- Mốc tiếp theo: **Lượt 21 / Bước 81**.
- Trạng thái: **PASS — migration chưa thực thi**.
- Ngày kiểm kê: **2026-08-10 (Asia/Bangkok)**.
- Repository: `BlueDragon33/Bauman-master-ai-system`.
- Baseline vật lý: `main@e383912354673bdce7a0059d6b9a23799d74e689`.
- Branch triển khai: `agent/roadmap-v2-l19-contract`.
- Draft PR: `https://github.com/BlueDragon33/Bauman-master-ai-system/pull/18`.

## Vấn đề đã xử lý dứt điểm tại Bước 73

Đặc tả Lượt 18 từng coi `E15 / Chương 7 covariance–correlation–PCA` là baseline
vật lý và coi lesson/formula/exercise/simulation/test đã đồng bộ. Kiểm tra trực
tiếp repository, toàn bộ branch hiện có và Library chứng minh mô tả này không đúng.

Trạng thái vật lý đã được khóa lại:

- `lessons.json`: 347 lesson ID duy nhất, 41 chapter ID, 5.552 base slide.
- Covariance/correlation/PCA tồn tại dưới các legacy lesson C05/C10/C15.
- `MATH-L2-C07` là node logic composite, không phải số Chương 7 vật lý.
- `theory_lecture_content.json`: 18 overlay bền vững cho C01–C03.
- `formulas.json`, `exercises.json`, `simulations.json`: mảng rỗng tại baseline.
- `tests.json`: contract shell, chưa phải ngân hàng test đồng bộ.
- 15 đường dẫn runtime/data quan trọng đã được fingerprint bằng Git blob SHA.

Không có dữ liệu học thuật nào bị xóa. Sai ở đây là naming/mapping của bàn giao,
không phải nội dung covariance/PCA bị mất.

## Kết quả Lượt 19 — Bước 73–76

| Bước | Trạng thái | Kết quả |
|---|---|---|
| 73 | PASS | Baseline inventory, fingerprint và mapping composite C07 |
| 74 | PASS | Registry: 10 kho, 85 node, 304 lesson đánh số, 8 node động |
| 75 | PASS | Graph: 170 edge bắt buộc, 2 khuyến nghị, 13 gate, 0 missing, 0 cycle |
| 76 | PASS | Mapping report 85/85 + migration contract sidecar-only |

Validation đã chạy hai lần liên tiếp; JSON sinh ra có hash không đổi. Sáu script
Node đã qua syntax check. Runtime/UI và 15 protected path không thay đổi.

## Kết quả Lượt 20 — Bước 77–80

- Repository baseline validator: PASS trên checkout GitHub thật.
- Migration dry-run: PASS, chỉ tạo 4 sidecar trong thư mục tạm ngoài worktree.
- Rollback test: PASS; 15 fingerprint và academic baseline giống hệt trước–sau.
- Deterministic regeneration: PASS, không phát sinh Git diff.
- GitHub Actions run: `31403531123`, conclusion `success`.
- Lỗi planned count `tests: 5` bị hiểu nhầm thành level count đã được sửa: dữ liệu
  thật là 4 level và 0 question.

## Quy trình bắt buộc tiếp tục

1. Thực hiện tuần tự từ Lượt 20 đến Lượt 50, mỗi lượt 4 bước.
2. Chỉ chuyển bước khi validator của bước hiện tại `PASS`.
3. Gặp thiếu nguồn, mapping mơ hồ, ID collision, cycle, fingerprint drift hoặc
   regression thì dừng và giải quyết dứt điểm trước khi đi tiếp.
4. Không dùng `PASS_BROWSER_SMOKE` nếu chưa chạy browser smoke thật.
5. Không rewrite legacy ID hoặc patch runtime/UI lõi khi migration dry-run và
   protected-fingerprint gate chưa đạt.

## Điểm bắt đầu Lượt 21

**Bước 81:** xây canonical read-only sidecar package và loader trong Node harness cô
lập. Chưa nối loader vào production HTML/runtime trước khi schema, immutability và
failure-mode test đạt.
