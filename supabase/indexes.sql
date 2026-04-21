-- Optimalisasi Performa: Penambahan Indeks pada kolom yang sering difilter

-- 1. Tabel Entries: Mempercepat loading Heatmap Dashboard
-- Indeks ini membantu pencarian berdasarkan user dan rentang tanggal (bulan)
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries (user_id, entry_date);

-- 2. Tabel Release Sessions: Mempercepat loading Riwayat Sesi
-- Indeks ini membantu pengurutan sesi terbaru untuk setiap user
CREATE INDEX IF NOT EXISTS idx_release_sessions_user_at ON release_sessions (user_id, created_at DESC);

-- 3. Tabel Activation Codes: Mempercepat validasi kode (opsional jika data sangat banyak)
CREATE INDEX IF NOT EXISTS idx_activation_codes_used_by ON activation_codes (used_by_user_id);
