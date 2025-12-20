-- Công dụng: Seed dữ liệu mẫu cho bảng `genres` (thể loại nhạc).
-- Chạy file này 1 lần (hoặc nhiều lần cũng không sao) để có sẵn danh sách genre cơ bản.
-- Dùng ON CONFLICT DO NOTHING để tránh insert trùng.

INSERT INTO genres (name) VALUES
  ('Pop'),
  ('Rock'),
  ('Hip Hop'),
  ('R&B'),
  ('EDM'),
  ('Jazz'),
  ('Classical'),
  ('Indie'),
  ('K-Pop'),
  ('V-Pop'),
  ('Lo-fi'),
  ('Acoustic')
ON CONFLICT (name) DO NOTHING;
