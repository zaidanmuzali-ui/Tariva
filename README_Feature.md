# Tariva Feature Documentation

Dokumen ini berisi penjelasan detail mengenai fitur-fitur di Tariva. Seluruh AI Agent yang memodifikasi kode Tariva **WAJIB** merujuk ke dokumen ini agar fitur tidak bertabrakan.

---

## 1. Autentikasi & User Management
- **Modal Auth**: Menggunakan `src/components/Auth.tsx`. Mendukung mode `login` dan `register`.
- **Logic**:
  - Tombol "Mulai Sekarang" / "Daftar" mengarahkan ke mode `register`.
  - Tombol "Masuk" mengarahkan ke mode `login`.
- **Supabase**: Menggunakan Supabase Auth untuk session management.
- **Plan Status**: User memiliki metadata `plan` ('free' atau 'pro').

## 2. AI Smart Search (Core Feature)
- **RAG Implementation**: Menggabungkan data dari database BTKI (via Supabase RPC `match_btki`) dengan kemampuan reasoning LLM.
- **Embedding Model**: Menggunakan `qwen/qwen3-embedding-8b` via OpenRouter untuk akurasi semantik yang lebih tinggi.
- **Clarification Flow**: 
  - **Alur Kerja**: Hasil pencarian RAG awal digunakan sebagai dasar untuk membuat pertanyaan klarifikasi jika terdapat beberapa opsi yang mirip.
  - Sisi klien (`HSCodeSearch.tsx`) akan menampilkan UI tanya-jawab sebelum menampilkan hasil akhir.
  - **PENTING**: Jawaban dari user (`followUpAnswers`) dianggap sebagai FAKTA ABSOLUT oleh AI untuk penyempitan hasil dari data RAG.
- **Confidence Scoring**: 
  - Jika AI tidak yakin 100% pada satu kode 8-digit dari hasil RAG, `confidence` harus < 75 dan `questions` tidak boleh kosong (Maksimal 5 pertanyaan).
- **Division of Output**: 
  - Data HS Code dan Tarif wajib diambil dari hasil RAG (BTKI Context).
  - Analisis lainnya (dokumen, insight, tren) diproses oleh model Hunyuan 3 (hy3).
- **Model**: Menggunakan `tencent/hy3-preview:free` sebagai model utama di OpenRouter (via `app.ts`).

## 3. Pembayaran & Langganan (Pro Plan)
- **Gateway**: Menggunakan Midtrans Snap (Sandbox/Production).
- **Checkout**: Endpoint `/api/payment/checkout` menghasilkan token transaksi Midtrans.
- **Sync Status**: 
  - Setelah bayar, status di-update via webhook `/api/payment/callback`.
  - User bisa menekan tombol "Sinkronisasi" untuk memicu pengecekan manual via `/api/sync-pro`.
- **Pro Perks**: 
  - Unlimited search (Guest limit: 3, Free user: unlimited but with lower priority/limits).
  - Simpan lebih dari 5 hasil.
  - Akses filter negara spesifik.
  - Export hasil ke PDF.

## 4. Pencarian & Filter
- **Mode Dagang**: Impor (Tarif BM, PPN, PPh) dan Ekspor (Bea Keluar).
- **Negara Tujuan**: Filter untuk melihat regulasi khusus di negara mitra (Hanya Pro).
- **Riwayat**: Hasil pencarian dapat disimpan ke koleksi pribadi (Database Supabase `saved_hs_codes`).

## 5. Architecture & Deployment
- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons + Motion.
- **Backend**: Express.js (Modular).
  - `app.ts`: Logika rute dan middleware.
  - `server.ts`: Startup server lokal.
  - `api/index.ts`: Entry point untuk Vercel Serverless.
- **Deployment**: Vercel.

---
**Catatan untuk AI**: Jangan mengubah logika inti dari fitur di atas kecuali ada instruksi eksplisit dari USER.
