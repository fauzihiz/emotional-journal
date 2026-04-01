# Emotional Journal (Jurnal Emosi)

Aplikasi *micro-journaling* berbasis mobile yang dirancang untuk membantu pengguna melacak pola emosi jangka panjang melalui kalender visual "Heatmap".

## 🚀 Objektif Utama
Memberikan pengalaman mencatat emosi yang tanpa hambatan (*frictionless*) dan berfokus pada perangkat seluler.

## 🛠️ Tech Stack (Teknologi)
- **Framework**: React Native (Expo)
- **Backend**: Supabase (Database & Auth)
- **State Management**: 
    - **React Query**: Mengelola sinkronisasi data server dan *offline caching*.
    - **Zustand**: Mengelola state UI global (pilihan bulan, tema, dll).
- **Persistence**: `AsyncStorage` (untuk dukungan offline).

## 📊 Model Emosi (Bahasa Indonesia)
Kami menggunakan 8 kategori emosi yang seimbang berdasarkan intensitas dan valensi:
1. **Semangat** (Energi Tinggi, Positif)
2. **Bahagia** (Sangat Positif)
3. **Tenang** (Damai, Positif)
4. **Berani** (Percaya Diri, Netral-Positif)
5. **Bosan** (Energi Rendah, Netral-Negatif)
6. **Sedih** (Negatif)
7. **Kecewa** (Kurang Puas, Negatif)
8. **Marah** (Frustrasi/Energi Tinggi, Negatif)

## 🗺️ Roadmap Pengembangan

### Fase 1: Fondasi & Autentikasi (v1.0)
- [ ] Setup Supabase dengan Google Auth.
- [ ] Implementasi Login Screen.
- [ ] Setup Database Schema (`entries` & `emotions`).

### Fase 2: Fitur Utama (Quick-Log)
- [ ] Dashboard Kalender dengan Heatmap warna.
- [ ] Fitur "Tambah Entri" (Pilih Mood & Teks).
- [ ] Dukungan *Backdate* (Mencatat tanggal sebelumnya).

### Fase 3: Offline & Performa (v1.1)
- [ ] Implementasi React Query Persistence.
- [ ] Optimasi *Fetching* bulanan (Hanya ambil data bulan aktif).
- [ ] UI/UX Polishing (Animasi & Micro-interactions).

### Fase 4: Insight & Analisis (v2.0+)
- [ ] Statistik bulanan/tahunan.
- [ ] Notifikasi pengingat harian.

## 📂 Struktur Folder
- `EJ/app/`: Struktur navigasi Expo Router.
- `EJ/supabase/`: SQL script untuk skema database.
- `openapi.yaml`: Dokumentasi API (Kontrak).
