# Emotional Journal (Jurnal Emosi)

Aplikasi *micro-journaling* berbasis mobile yang dirancang untuk membantu pengguna melacak pola emosi jangka panjang melalui kalender visual "Heatmap".

## 🚀 Objektif Utama
Memberikan pengalaman mencatat emosi yang tanpa hambatan (*frictionless*) dan berfokus pada perangkat seluler.

## 🛠️ Tech Stack (Teknologi)
- **Framework**: React Native (Expo SDK 54)
- **Backend**: Supabase (Database & Auth)
- **State Management**: 
    - **React Query**: Mengelola sinkronisasi data server dan *offline caching*.
    - **Zustand**: Mengelola state UI global (session, pilihan bulan, tema, dll).
- **Persistence**: `AsyncStorage` (untuk dukungan offline & session).
- **Icons**: `@expo/vector-icons` (Ionicons)

## 📊 Model Emosi (Bahasa Indonesia)
Kami menggunakan 12 kategori emosi dengan spektrum warna gradasi:
1. **Marah** 😡 — Red
2. **Takut** 😨 — Slate
3. **Cemas** 😰 — Violet
4. **Sedih** 😢 — Blue
5. **Kecewa** 😞 — Purple
6. **Bosan** 😐 — Gray
7. **Tenang** 😌 — Teal
8. **Bahagia** 😊 — Green
9. **Syukur** 🙏 — Yellow
10. **Berani** 💪 — Orange
11. **Semangat** 🔥 — Amber
12. **Yakin** ✨ — Emerald

## 🗺️ Roadmap Pengembangan

### Fase 1: Fondasi & Autentikasi (v1.0) ✅
- [x] Setup Supabase dengan Email Auth.
- [x] Implementasi Login Screen.
- [x] Setup Database Schema (`entries` & `emotions`).
- [x] Zustand auth store & React Query provider.
- [x] Protected routing (auto-redirect login/dashboard).

### Fase 2: Fitur Utama (Frictionless Quick-Log) ✅
- [x] Full-Page Dashboard Kalender (Flex layout dengan *infinite multi-color stripes*).
- [x] Fitur "Tambah Entri" via tombol "+" dan Quick-Log Form yang responsif.
- [x] Pop-up "Jurnal Hari Ini" untuk membaca history deksripsi *(Expandable Text)*.
- [x] Proteksi cerdas (mencegah curi start mencatat tanggal masa depan).
- [x] Galaxy Mesh (soft gradients) untuk multi-mood days. ✨

### Fase 3: Guided Emotional Release (Therapy Mode) ✅
- [x] Setup Tabel `release_sessions` di Supabase. ✅
- [x] Implementasi **Letting Flow Therapy** (7 Langkah) ✅:
    *   **Langkah 1**: Relaksasi Pernapasan (Ritme 4-6) dengan instruksi.
    *   **Langkah 2**: *Letting Come* (Menghadirkan emosi negatif yang ingin dilepas).
    *   **Langkah 3**: *Letting Stay* (Mengamati emosi sambil menjaga ritme bernapas).
    *   **Langkah 4**: *Letting Go* (Pelepasan emosi via animasi teks melarut).
    *   **Langkah 5**: *Post-Release Breathing* (Relaksasi napas penenang pasca-lepas).
    *   **Langkah 6**: *Letting God* (Refleksi spiritual puitis & penyerahan - Random Text).
    *   **Langkah 7**: *Ketenangan Akhir* (Penilaian skala ketenangan pasca-terapi).
- [x] Integrasi Audio Lokal (`assets/audio/calm.mp3`). ✅
- [x] Riwayat Sesi (History Release Emosi) dengan label status ketenangan. ✅

### Fase 4: Offline & Performa (v1.1) ✅
- [x] Implementasi React Query Persistence (AsyncStorage). ✅
- [x] Optimasi *Fetching* bulanan (Prefetching & Stale Time). ✅
- [x] UI/UX Remake (Warm Aesthetic & Safe Space). ✅

### Fase 5: Sistem Proteksi Akses (Monetization Gate) ✅
- [x] Setup Skema Tabel `activation_codes`. ✅
- [x] Implementasi UI Layar Aktivasi dengan *Safe Space Aesthetic*. ✅
- [x] Logika *Gated Authentication* (Hanya izinkan ke Dashboard jika tervalidasi). ✅
- [x] Script SQL untuk *Mass-Generate* Lisensi. ✅

### Fase 6: Insight & Analisis (v2.0+)
- [ ] Statistik bulanan/tahunan.
- [ ] Notifikasi pengingat harian.

### Fase 7: Distribusi & Mobile Build (Tahap Akhir) 🚧
- [x] Setup deployment ke Vercel (Web Hosting).
- [x] Optimasi PWA (Add to Home Screen).
- [x] Integrasi Google Auth (Web & Native Support).
- [ ] Setup EAS Build untuk final Android APK.

## 🛠️ Solusi Kendala Teknis (Troubleshooting)

Berikut adalah ringkasan masalah teknis yang dihadapi selama pengembangan dan cara penyelesaiannya:

### 1. Google OAuth Redirect Loop (Vercel)
- **Kendala**: Setelah login Google, pengguna terlempar kembali ke `localhost:8081` atau tertahan di halaman login.
- **Solusi**: 
    - Menggunakan `window.location.origin` secara dinamis pada parameter `redirectTo` di `signInWithOAuth`.
    - Mengaktifkan `detectSessionInUrl: true` pada konfigurasi Supabase Client.
    - Menambahkan domain Vercel (contoh: `https://your-app.vercel.app/**`) ke dalam **Redirect URLs** di Dashboard Supabase.

### 2. Error: "Unable to exchange external code"
- **Kendala**: Supabase gagal menukar Kode OAuth dari Google menjadi sesi aktif.
- **Solusi**: 
    - Memastikan tipe kredensial di Google Cloud Console adalah **Web Application** (bukan Android/iOS) dan menyamakan `Client Secret` di dashboard Supabase.
    - Memastikan di Dashboard Supabase untuk provider Google, Client ID dan Client Secret sudah benar sesuai yang diberikan Google Cloud Console.

### 3. Tombol "Add to Home Screen" PWA Tidak Muncul
- **Kendala**: Browser tidak mendeteksi aplikasi sebagai PWA yang valid pada build produksi Expo.
- **Solusi**: 
    - Membuat template kustom `web/index.html` untuk memaksakan injeksi `<link rel="manifest">`.
    - Menyediakan file `public/manifest.json` dan `public/sw.js` secara manual agar disalin ke folder `dist/` saat ekspor.

### 4. Sinkronisasi Model Emosi & Database
- **Kendala**: Menambahkan emosi baru menyebabkan error *Foreign Key* atau salah warna pada data lama.
- **Solusi**: Melakukan `TRUNCATE emotions CASCADE` dan melakukan *re-seed* data 12 emosi baru agar ID dan urutan gradasi warna sinkron antara kode aplikasi dan database.

### 5. Aktivasi Stuck / Loading Terus (Monetization Gate)
- **Kendala**: Setelah memasukkan kode benar, layar tetap berputar (loading) atau tidak berpindah.
- **Solusi**: 
    - Melakukan **Hard Refresh** (`Ctrl + Shift + R`) untuk membersihkan cache PWA lama.
    - Memastikan kode dimasukkan dengan format lengkap (contoh: `EJ-XXXXX`).
    - Gunakan fungsi `maybeSingle()` dan tambahkan `.select()` pada update query untuk menghindari *HTTP 204 No Content hang*.

## ⚠️ Known Issues (TODO)
- [ ] **Email Confirmation**: Saat ini dimatikan untuk development. Harus diaktifkan kembali sebelum production.
- [ ] **EAS CLI**: Memerlukan instalasi global (`npm install -g eas-cli`).

## 📂 Struktur Folder
- `EJ/app/` — Struktur navigasi Expo Router.
- `EJ/public/` — Aset PWA (Manifest, SW, Icons).
- `EJ/web/` — Template HTML kustom untuk build web.
- `EJ/lib/` — Konfigurasi Supabase client.
- `EJ/store/` — Zustand stores (auth, UI state).
- `EJ/supabase/` — SQL script untuk skema database.
