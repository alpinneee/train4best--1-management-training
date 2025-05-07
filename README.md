# Train4Best - Sistem Manajemen Pelatihan

Train4Best adalah platform manajemen pelatihan modern yang dibangun dengan Next.js, Prisma, dan MySQL. Platform ini dirancang untuk memudahkan pengelolaan kursus, peserta, dan sertifikasi pelatihan.

## 🚀 Fitur Utama

- **Multi-role Authentication**
  - Super Admin
  - Instruktur
  - Peserta
  - Manajemen akses berbasis peran

- **Manajemen Kursus**
  - Pembuatan dan pengelolaan kursus
  - Penjadwalan kelas
  - Manajemen materi pembelajaran
  - Kategorisasi kursus

- **Manajemen Peserta**
  - Pendaftaran peserta
  - Tracking progress pembelajaran
  - Manajemen sertifikasi
  - Riwayat pelatihan

- **Sistem Sertifikasi**
  - Pembuatan sertifikat
  - Tracking masa berlaku
  - Notifikasi sertifikat yang akan kadaluarsa
  - Verifikasi sertifikat

- **Laporan dan Analitik**
  - Laporan keuangan
  - Statistik peserta
  - Analisis performa kursus
  - Dashboard interaktif

## 🛠️ Teknologi yang Digunakan

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Material-UI
  - React Query

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - MySQL Database
  - NextAuth.js

## 📋 Prasyarat

Sebelum menginstal, pastikan perangkat Anda memenuhi persyaratan berikut:

- Node.js (versi 18.0.0 atau lebih baru)
- MySQL (versi 8.0 atau lebih baru)
- npm atau yarn
- Git

## 🚀 Panduan Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/train4best.git
cd train4best
```

### 2. Instalasi Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Konfigurasi Environment

Buat file `.env` di root proyek dan isi dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/train4best"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (opsional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# (Opsional) Seed database dengan data awal
npx prisma db seed
```

### 5. Jalankan Aplikasi

```bash
# Development
npm run dev
# atau
yarn dev

# Production
npm run build
npm start
# atau
yarn build
yarn start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📱 Akses Aplikasi

- **Super Admin**: `/dashboard`
- **Instruktur**: `/instructor`
- **Peserta**: `/participant`

## 🔧 Troubleshooting

### Masalah Umum

1. **Error Database Connection**
   - Pastikan MySQL server berjalan
   - Periksa kredensial database di `.env`
   - Pastikan database sudah dibuat

2. **Error Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate reset
   ```

3. **Error Next.js**
   ```bash
   rm -rf .next
   npm run dev
   ```

## 🤝 Kontribusi

Kami menerima kontribusi! Silakan buat pull request atau buka issue untuk diskusi.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE)

## 📞 Kontak

Untuk bantuan dan dukungan, silakan hubungi:
- Email: support@train4best.com
- Website: https://train4best.com
