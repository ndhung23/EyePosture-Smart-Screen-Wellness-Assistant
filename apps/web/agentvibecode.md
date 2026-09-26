# Rules: AI Coding & Structured Vibe Coding Guidelines

Tất cả AI Agent khi làm việc trong dự án này bắt buộc phải tuân thủ nghiêm ngặt bộ quy tắc trong `agentvibecode.md`:

1. **Spec & Context First:** Kiểm tra cấu trúc repo, file liên quan và context trước khi code. Không sửa bừa, không suy đoán khi requirement mơ hồ.
2. **File Size Limit (< 1000 LOC):** Tuyệt đối không tạo hoặc để bất kỳ file nào vượt quá 1000 dòng code. Chủ động tách nhỏ module khi file đạt 300-500 dòng.
3. **Zero Secret & Security:** Tuyệt đối không hard-code keys, tokens, secrets. Mọi input qua boundary đều phải validate (Zod/Schema).
4. **Auto-Verification Pipeline:** Tự động chạy `typecheck`, `lint`, `test`, `build` bằng terminal mà không cần hỏi người dùng. Sửa lỗi tận gốc (root cause).
5. **Anti-Bloat & DRY:** Tái sử dụng components/utilities hiện có, không lặp code, không tùy tiện thêm thư viện bên ngoài.
6. **Bảo toàn tương thích & Không xóa tùy tiện:** Giữ tương thích ngược, không tự ý xóa file, schema, table hay config.
7. **Escalation Protocol:** Dừng lại hỏi khi thay đổi schema database, breaking public API contracts, chạm vào logic auth/payment nhạy cảm hoặc retry quá 3 lần.

Tham chiếu chi tiết: Xem file `agentvibecode.md` tại thư mục gốc của repository.
