# Panduan Sistem E-Perpus Amerta

Selamat datang di kode sumber (source code) **E-Perpus Amerta**! Panduan ini dibuat khusus untuk Anda yang sudah paham dasar pembuatan web (seperti HTML & CSS) tetapi baru pertama kali menyentuh **Next.js**.

Di Next.js, Anda tidak akan menemukan rentetan file `.html` biasa. Sebaliknya, aplikasi ini dibangun menggunakan komponen-komponen (gabungan **HTML, CSS Tailwind, dan JavaScript**) yang disatukan menjadi halaman utuh.

---

## Memahami Struktur Dasar Next.js

Seluruh aplikasi kita menggunakan sistem **App Router** terbaru dari Next.js. Inti dari sistem ini sangat sederhana:
**"Setiap folder di dalam folder `app/` merepresentasikan tautan/URL (halaman) di website Anda."**

*   `app/page.tsx` => Tampil saat mengunjungi `http://localhost:3000/`
*   `app/login/page.tsx` => Tampil saat mengunjungi `http://localhost:3000/login`
*   `app/catalog/page.tsx` => Tampil saat mengunjungi `http://localhost:3000/catalog`

### Mengenal File Khusus
Di setiap folder web Anda, Anda akan sering menjumpai 3 jenis nama file ajaib:
1.  **`page.tsx`**: Ini ibarat `index.html`. Isinya adalah kerangka utama halaman Anda. Jika Anda ingin mengganti tulisan di sebuah halaman, cari file `page.tsx` pada folder halamannya.
2.  **`layout.tsx`**: Ini adalah "pembungkus" bawaan halaman. Biasanya digunakan untuk mendefinisikan *font* dan layout dasar bawaan sistem yang menempel di semua halaman sekaligus.
3.  **`actions.ts`**: Ini adalah skrip "Belakang Layar" (Server Actions). Kalau di HTML jadul Anda butuh file PHP panjang untuk menyimpan data/login, di Next.js fungsi *backend* tersebut disimpan di dalam file ini agar aman dan ringan.

> 💡 **Info:** File berakhiran `.tsx` di dalamnya berisi `JSX`. Yaitu gabungan antara logika JavaScript dan penulisan tag ala HTML (seperti `<div>`, `<h1>`, dsb). Anda bisa mendesain tampilan web (mirip HTML) di file ini memanfaatkan baris `className="..."` karena kita menggunakan framework CSS mutakhir yang bernama **TailwindCSS**.

---

## Struktur Folder Website Anda

```text
c:\e-perpus\
│
├── app/                  # (SANGAT PENTING) Semua halaman website & backend ada di sini!
│   ├── admin/            # Folder semua panel admin (Management. Katalog, dll)
│   ├── borrowings/       # Halaman daftar pinjaman siswa saat ini (/borrowings)
│   ├── catalog/          # Halaman pencarian dan rak buku E-Perpus (/catalog)
│   │   └── [id]          # File dinamis untuk melihat DETAIL SATU BUKU (/catalog/12345)
│   ├── login/            # Halaman otentikasi/Login (/login)
│   ├── profile/          # Halaman akun pribadi user (/profile)
│   ├── saved/            # Halaman daftar bookmark buku tersimpan (/saved)
│   └── page.tsx          # Beranda Utama (Dashboard perpus, sambutan)
│
├── components/           # (PENTING) Komponen potongan HTML yang bisa dipakai berulang-ulang
│   ├── AppShell.tsx      # Komponen navigasi yang menyatukan Header Atas dan Tab Bawah
│   ├── BookCover.tsx     # Komponen kecil untuk merender bentuk kartu gambar buku
│   ├── AddMemberModal.tsx# Komponen formulir popup untuk Admin menambah Anggota
│   ├── Footer.tsx        # Kotak footer berisi nama developer "Upscale Digital Lab"
│   └── (file lainnya)..
│
├── lib/                  # "Dapur" program
│   ├── supabase/         # Koneksi langsung ke Database (pembacaan SQL/data.ts)
│   └── types.ts          # Kamus panduan tipe data (mencatat struktur Buku, User, Tabel)
│
├── public/               # Tempat menyimpan file aset awam
│   ├── logo.png          # Gambar logo amerta 
│   ├── background.jpg    # Aset statis lainnya...
│
└── supabase/
    └── schema.sql        # Blueprint susunan database. Kalau butuh buat ulang database, pakai ini!
```

---

## Cara Komponen Saling Terhubung (Bongkar Pasang)

Coba bayangkan `components` sebagai sekumpulan lego, dan `app` (Halaman) sebagai alas papannya. 

Di HTML tradisional, jika Anda ingin memiliki navigasi/header, Anda harus *copy-paste* puluhan baris kode `<header>...</header>` di setiap file. 
Di Next.js sistem ini telah dipermudah:
*   Kita buat logika menu navigasinya 1x saja di file `components/AppShell.tsx`.
*   Nanti, ketika membuat halaman baru (misal `app/saved/page.tsx`), kita cukup mengetik tag pendek seperti `<AppShell> Isi Halamannya di sini </AppShell>`.
*   Boom! Seluruh dekorasi navigasi langsung menempel dengan sempurna secara seragam, efisien, rapi dan anti capek.

---

## Penjelasan Isi Komponen per Halaman Utama

Berikut yang perlu Anda ketahui mengenai isi dari halaman-halaman yang sudah dibuat agar mudah dimodifikasi ke depannya:

### 1. Panel Admin (`/admin`)
Pusat kendali tempat pustakawan dan admin bekerja. 
*   Di dalamnya terdapat halaman turunan navigasinya, termasuk manajemen katalog dan manajemen anggota. Di sini Anda bisa mengedit data, men-generate anggota dengan Auto-ID (seperti `AMT-SW-1241`), dan menghapus komentar-komentar (review) spam lewat kode yang ada di subfolder tersebut.

### 2. Beranda (`/`)
Halaman depan atau etalase ketika membuka web. Ini memuat ucapan sambutan, sedikit rangkuman rak buku terbaru ("Baru Ditambahkan") yang di-styling sedemikian rupa dengan CSS efek pudar ke bawah dan sebagainya. 

### 3. Katalog Buku (`/catalog` & `/catalog/[id]`)
*   `/catalog`: Berisi kotak-kotak grid daftar buku beserta *Search bar* nya. Menggunakan `<BookCover />` dari pustaka lego `components`.
*   `/catalog/[id]`: Kata "id" pakai kurung siku menandakan kalau URL ini bisa apa saja (contoh: `/catalog/abcd` atau `/catalog/xyz`). Berguna untuk menampung seluruh detil (Sinopsis, Judul, Author) buku apa pun yang di-klik tanpa perlu membuat file HTML satuan!. Diatur di `page.tsx` ini juga menyertakan Client Component `<SaveBookButton />` agar bisa menampilkan buku tersimpan secara langsung.

### 4. Peminjaman & Tersimpan (`/borrowings` & `/saved`)
Hanya memunculkan list (daftar baris kode loop dari database) dari riwayat peminjaman beserta status tanggal tenggat waktu, dan juga halaman penampung "Buku Favorit" yang mau dibaca lain waktu.

### 5. Profil (`/profile`)
Tempat di mana Siswa atau Guru bisa mengecek informasi dasar ID Anggota, Ganti Kata Sandi, dan tentunya *Logout* (Keluar Akun). Data ini diambil dari database khusus tabel profil (*auth.users*).

---

## 🎨 Ringkasan Kunci untuk Manipulasi Desain (CSS/Tailwind)
Karena kode Anda tidak mendefinisikan CSS di dalam file `.css` khusus secara tradisional, semua modifikasinya ditulis di dalam file **`.tsx`** via tag atribut class.

**Rumus Tailwind CSS:**
*   `bg-red-500` -> sama dengan background-color: red.
*   `text-white` -> sama dengan color: white.
*   `p-4` -> sama dengan padding: 1rem (16px).
*   `m-4` -> sama dengan margin: 1rem (16px).
*   `flex` -> menjadikan bentuk display flex.

Semoga petunjuk ini membantu penyesuaian situs Anda! Selamat berkarya mengoptimasi perpustakaan SMK Amerta bersama keahlian desain Anda!
