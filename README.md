# Emotional Journal (Jurnal Emosi)

Aplikasi *micro-journaling* berbasis Progressive Web App (PWA) yang dirancang untuk membantu pengguna melacak, merilis, dan memahami pola emosi harian dengan antarmuka yang tenang dan meditatif.

![Emotional Journal Preview](EJ/app/icon.png)

## ✨ Filosofi Desain
"Emotional Journal" bukan sekadar aplikasi pencatatan. Ia adalah *safe space* digital. Kami menggunakan estetika **Warm and Minimalist**, tipografi yang elegan, serta mikro-antarmuka yang responsif untuk menciptakan pengalaman meditasi visual saat pengguna berinteraksi dengan emosi mereka.

## 🛠️ Tech Stack Utama
Aplikasi ini dibangun dengan teknologi terkini untuk memastikan performa yang cepat, aman, dan bisa diakses dari perangkat mana pun:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend/DB**: [Supabase](https://supabase.com/) (Real-time Database & SSR Auth)
- **State & Data**: [TanStack Query v5](https://tanstack.com/query) dengan *Offline State Persistence*.
- **PWA**: [@serwist/next](https://serwist.github.io/serwist/) untuk dukungan full offline dan instalasi native di iOS/Android.

## 🌟 Fitur Utama

### 1. Galaxy Mesh Heatmap
Visualisasi kalender unik yang menggambarkan spektrum emosi Anda. Jika dalam satu hari terdapat beberapa entri emosi, kalender akan menampilkan gradasi warna yang indah (Mesh Gradient), menciptakan pola unik setiap bulan.

### 2. Guided Emotional Release (Letting Flow Therapy)
Fitur terapi mandiri dengan 7 langkah terpandu:
- **Relaksasi Napas**: Mengatur ritme napas dengan panduan visual dan audio meditasi.
- **Letting Come & Stay**: Mengakui dan mengamati hadirnya emosi tanpa menolak.
- **Letting Go**: Menuliskan dan merilis beban emosi secara visual (Dissolve animation).
- **Letting God**: Menyerahkan hasil akhir dan refleksi spiritual yang menenangkan.

### 3. Monetization & Security Gate
Sistem aktivasi akun berbasis lisensi. Pengguna hanya dapat mengakses Dashboard penuh setelah melakukan aktivasi menggunakan kode akses unik, memungkinkan model bisnis SaaS atau penjualan lisensi mandiri.

### 4. Zero-Friction Logging
Formulir input yang cepat dengan pilihan emosi berbasis *chip* warna-warni, memungkinkan pencatatan perasaan kurang dari 10 detik.

## 📂 Struktur Folder Proyek
- `EJ/app/` — Halaman utama, routing, dan logic SSR (App Router).
- `EJ/components/` — Komponen UI premium (Modals, Calendar, Picker).
- `EJ/hooks/` — Custom hooks untuk manajemen data emosi.
- `EJ/lib/` — Hubungan API dan utilitas Supabase client/middleware.
- `EJ/public/` — Aset audio meditasi, ikon aplikasi, dan manifest PWA.
- `EJ/supabase/` — Skema database SQL, RLS Policies, dan Indexes.

## 🚀 Instalasi & Pengembangan
1. **Clone & Install**:
   ```bash
   cd EJ
   npm install
   ```
2. **Setup Env**: Pastikan Anda memiliki kredensial Supabase di `.env`.
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
4. **Build Production**:  
   Untuk memvalidasi performa PWA:
   ```bash
   npm run build
   ```

## 🛠️ Solusi Kendala Teknis (Troubleshooting)

### 1. Kebocoran Data Cache (Account Switching)
- **Masalah**: Data dari akun sebelumnya tetap terlihat saat pengguna lain login di browser yang sama.
- **Penyebab**: TanStack Query Persistence menyimpan cache di `localStorage` dengan kunci statis (misal: `['entries', month, year]`), yang tidak membedakan ID pengguna.
- **Solusi**:
    - **Query Key Partitioning**: Menambahkan `userId` ke dalam setiap kunci query (misal: `['entries', userId, month, year]`). Ini mengisolasi data di level penyimpanan.
    - **Explicit Cache Clearance**: Mengintegrasikan `queryClient.clear()` pada setiap fungsi logout untuk memastikan memori cache segera dihapus saat sesi berakhir.

---
*Developed with focus on Mental Health and UX Excellence.*  
**Built by [Fauzihiz](https://fauzihiz.github.io/)**
