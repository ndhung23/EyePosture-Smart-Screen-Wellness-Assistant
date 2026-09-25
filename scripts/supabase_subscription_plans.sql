-- ========================================================
-- EyePosture: Bảng quản lý bảng giá các gói đăng ký
-- Chạy đoạn script này trên Supabase SQL Editor
-- ========================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- 'PRO_MONTH', 'PRO_YEAR', 'PRO_LIFETIME', 'FAMILY_MONTH', 'FAMILY_YEAR', 'FAMILY_LIFETIME'
  tier TEXT NOT NULL, -- 'PRO', 'FAMILY'
  interval TEXT NOT NULL, -- 'month', 'year', 'lifetime'
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_vi TEXT,
  description_en TEXT,
  price_vnd BIGINT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  original_price_vnd BIGINT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Khởi tạo bảng giá ban đầu nếu chưa có
INSERT INTO subscription_plans (id, tier, interval, name_vi, name_en, description_vi, description_en, price_vnd, price_usd, original_price_vnd, is_active, sort_order)
VALUES 
  ('PRO_MONTH', 'PRO', 'month', 'Gói Cá nhân (1 Tháng)', 'Personal Plan (1 Month)', 'Mở khóa toàn bộ tính năng AI 3D, đo khoảng cách và tư thế', 'Full 3D AI posture & distance tracking', 19000, 0.99, 39000, true, 1),
  ('PRO_YEAR', 'PRO', 'year', 'Gói Cá nhân (1 Năm)', 'Personal Plan (1 Year)', 'Tiết kiệm 50% so với gói tháng, đầy đủ báo cáo chuyên sâu', 'Save 50% vs monthly, in-depth reports', 199000, 9.99, 399000, true, 2),
  ('PRO_LIFETIME', 'PRO', 'lifetime', 'Gói Cá nhân (Trọn đời)', 'Personal Plan (Lifetime)', 'Thanh toán 1 lần duy nhất, sở hữu vĩnh viễn mọi bản cập nhật', 'One-time payment, lifetime updates', 299000, 19.99, 699000, true, 3),
  ('FAMILY_MONTH', 'FAMILY', 'month', 'Gói Gia đình (1 Tháng - 5 thiết bị)', 'Family Plan (1 Month - 5 devices)', 'Bảo vệ tư thế và mắt cho cả gia đình, kết nối 5 thiết bị cùng lúc', 'Protect whole family posture, 5 concurrent devices', 49000, 4.99, 99000, true, 4),
  ('FAMILY_YEAR', 'FAMILY', 'year', 'Gói Gia đình (1 Năm - 5 thiết bị)', 'Family Plan (1 Year - 5 devices)', 'Gói tiết kiệm nhất cho cả gia đình sử dụng trong 1 năm', 'Best value for family with 1-year coverage', 299000, 19.99, 599000, true, 5),
  ('FAMILY_LIFETIME', 'FAMILY', 'lifetime', 'Gói Gia đình (Trọn đời - 5 thiết bị)', 'Family Plan (Lifetime - 5 devices)', 'Trọn đời không giới hạn cho gia đình, cam kết tính năng VIP mãi mãi', 'Lifetime unlimited for family, VIP features forever', 499000, 29.99, 999000, true, 6)
ON CONFLICT (id) DO UPDATE SET
  price_vnd = EXCLUDED.price_vnd,
  price_usd = EXCLUDED.price_usd,
  updated_at = NOW();
