-- CloverFit toB フォーム用の追加列（既存DBへ適用）
ALTER TABLE bookings ADD COLUMN employee_count TEXT;
ALTER TABLE bookings ADD COLUMN headcount TEXT;
ALTER TABLE bookings ADD COLUMN timing TEXT;
ALTER TABLE bookings ADD COLUMN venue TEXT;
ALTER TABLE bookings ADD COLUMN plan TEXT;
