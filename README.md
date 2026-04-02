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
Kami menggunakan 8 kategori emosi yang seimbang berdasarkan intensitas dan valensi:
1. **Semangat** (Energi Tinggi, Positif) — 🟡 Gold
2. **Bahagia** (Sangat Positif) — 🟢 Lime Green
3. **Tenang** (Damai, Positif) — 🔵 Sky Blue
4. **Berani** (Percaya Diri, Netral-Positif) — 🟠 Orange
5. **Bosan** (Energi Rendah, Netral-Negatif) — ⚫ Gray
6. **Sedih** (Negatif) — 🔷 Dodger Blue
7. **Kecewa** (Kurang Puas, Negatif) — 🟣 Purple
8. **Marah** (Frustrasi/Energi Tinggi, Negatif) — 🔴 Orange Red

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

### Fase 3: Distribusi & Mobile Build (PWA & APK) 🚧
- [x] Setup deployment ke Vercel (Web Hosting).
- [x] Optimasi PWA (Add to Home Screen).
- [ ] Setup EAS Build untuk Android APK.
- [ ] Uji coba Google Auth di perangkat fisik.

### Fase 4: Offline & Performa (v1.1)
- [ ] Implementasi React Query Persistence.
- [ ] Optimasi *Fetching* bulanan (Hanya ambil data bulan aktif).
- [ ] UI/UX Polishing (Animasi & Micro-interactions).

### Fase 5: Insight & Analisis (v2.0+)
- [ ] Statistik bulanan/tahunan.
- [ ] Notifikasi pengingat harian.

## ⚠️ Known Issues (TODO)
- [ ] **Google Auth**: OAuth redirect flow belum berfungsi di web. Perlu ditest di Expo Go (mobile).
- [ ] **Email Confirmation**: Saat ini dimatikan untuk development. Harus diaktifkan kembali sebelum production.
- [ ] **EAS CLI**: Memerlukan instalasi global (`npm install -g eas-cli`).

## 📂 Struktur Folder
- `EJ/app/` — Struktur navigasi Expo Router.
- `EJ/app/(auth)/` — Halaman login/register.
- `EJ/app/(app)/` — Halaman utama (dashboard, dll).
- `EJ/lib/` — Konfigurasi Supabase client.
- `EJ/store/` — Zustand stores (auth, UI state).
- `EJ/supabase/` — SQL script untuk skema database.
- `EJ/vercel.json` — Konfigurasi routing untuk Vercel.
