# King Ardenwyr: Sang Ksatria Pedagang Jagung

**King Ardenwyr** adalah sebuah game aksi 2D semi-3D bergaya klasik (terinspirasi dari _Metal Slug_ dan beat 'em up) berbasis web yang dibangun sepenuhnya menggunakan teknologi murni (Vanilla HTML5 Canvas, CSS, dan JavaScript). Game ini mengangkat kisah dark-medieval tentang Aratha, seorang penjual jagung miskin yang berjuang demi cinta dan kehormatannya melawan dua raja lalim.

## 🌟 Fitur Utama

- **Zero Asset Dependencies**: Seluruh grafik dirender secara manual menggunakan HTML5 Canvas. Efek suara (SFX) sepenuhnya dihasilkan menggunakan metode _Procedural Audio_ via Web Audio API (tidak memuat file `.mp3` atau `.wav` apa pun).
- **Pertarungan Aksi Dinamis**: Sistem pertempuran _hack-and-slash_ dengan ragam serangan (Tebas, Tebas Ganda, Tebas Berat, Tebasan Berputar) dan kemampuan menangkis (Block).
- **Sistem Evolusi Pedang**: Bunuh musuh untuk mengisi progres, dan saksikan pedangmu berevolusi (dari Pisau Jagung bintang 1 hingga Pedang Legenda bintang 5) secara otomatis, yang meningkatkan jangkauan, animasi cahaya (glow), dan *damage* secara signifikan.
- **Cuaca & Waktu Dinamis**: Siklus pergeseran hari (Day/Night Cycle) yang menyatu dengan partikel cuaca (dedaunan gugur, hujan abu vulkanik) dan parallax latar belakang yang berubah-ubah seiring progres babak (Stage 1-10).
- **Pertarungan Bos Epik**: Hadapi Raja Obsidian di pertengahan jalan (Stage 6) dan Raja Malachar yang kejam di akhir permainan (Stage 10).
- **Animasi Cinematic Ending**: Selesaikan game untuk memicu penobatan dan adegan penjemputan tuan putri tanpa cut-screen statis.

## 🎮 Panduan Kontrol

| Tombol / Aksi | Fungsi |
| :--- | :--- |
| **Panah Kiri / Kanan** | Berjalan ke kiri / kanan |
| **Panah Atas** | Melompat |
| **Z** | Serangan Biasa (Tebas / Tebas Ganda jika ditekan cepat) |
| **X** | Serangan Berat (Heavy Slash / Jump Attack jika di udara) |
| **C** | Serangan Berputar (Spin Slash) |
| **Spasi** | Menangkis (Block) - Mengurangi kerusakan (damage) secara drastis |
| **Esc** | Jeda Permainan (Pause) / Melanjutkan |

## 📖 Ringkasan Cerita (Lore)
Di pasar kumuh Kerajaan Ardenwyr, Aratha hanyalah seorang penjual jagung rebus. Pertemuannya dengan Putri Lyra memicu cinta terlarang. Ketika sayembara mematikan digelar oleh Raja Malachar untuk menaklukkan Kerajaan Obsidian, Aratha mempertaruhkan nyawanya, menukarkan panci jagungnya dengan sebilah pedang tua. Dari hutan terlarang hingga neraka benteng Obsidian, Aratha terus maju, didorong satu janji: bertahan hidup dan membawa pulang cinta sejatinya.

## 🛠 Teknologi & Struktur Kode

1. **`index.html`**: Antarmuka pengguna utama, HUD, dan pembungkus Canvas. Memuat library *Lucide Icons* secara native.
2. **`style.css`**: Pengaturan layout bergaya *dark fantasy*, glow overlay, responsivitas layar game, dan transisi antar menu (MainMenu, Story, Stage Clear, Game Over, Ending).
3. **`audio.js`**: Mesin suara prosedural (synthesizer) yang menyajikan derik pedang, gemuruh angin malam (drone), suara lompatan, hingga ledakan serangan kritikal.
4. **`game.js`**: Mesin inti permainan. Menangani:
   - Manajemen State dan Loop Game (60fps requestAnimationFrame).
   - Fisika dan Gravitasi pseudo-3D.
   - Kecerdasan Buatan (AI) musuh dan pemanggilan serangan (Projectiles).
   - Animasi Partikel, Sistem Cuaca, Parallax Background, rendering tokoh.

## 🚀 Cara Menjalankan

Karena tidak ada aset file gambar atau suara yang harus dimuat dari sistem file (CORS issue), Anda bisa menjalankan game ini hanya dengan mengklik ganda file `index.html` di browser modern apa pun (Chrome, Firefox, Edge, Safari).

Untuk bermain di web:
<https://corn-knight.vercel.app/>

Jika ingin menjalankannya lewat server lokal, Anda dapat menggunakan modul python:
```bash
python -m http.server 8080
```
Lalu buka `http://localhost:8080/index.html` di web browser Anda. Jangan ragu untuk berkolaborasi untuk pengembangan game ini lebih lanjut :)

---
_Dibuat dengan cinta dan dedikasi. "Pedang bisa patah, namun tekad tidak."_
