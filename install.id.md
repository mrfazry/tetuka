# Unduh & instal

`tetuka` bersifat open source. Installer siap pakai dipublikasikan di **GitHub Releases** untuk Windows, macOS, dan Linux.

## Ambil rilis terbaru

Di situs, gunakan kontrol unduh di halaman instal (rilis stabil terbaru secara default, atau pilih tag). Anda juga bisa membuka **GitHub Releases** repositori.

Jika Anda mem-fork atau mengganti nama repo, gunakan halaman releases milik Anda sendiri.

---

## Windows

**File terkait**

- `tetuka_<version>_x64-setup.exe` (installer NSIS)

**Instal**

1. Unduh file `.exe`.
2. Jalankan. Jika SmartScreen memperingatkan, pilih **More info** → **Run anyway** (build pribadi yang belum ditandatangani sering memicu ini).
3. Selesaikan installer, lalu jalankan **tetuka** dari Start menu.

**Uninstal**

Gunakan **Settings → Apps** dan hapus **tetuka**.

---

## macOS

**File terkait**

- `tetuka_<version>_aarch64.dmg` — Apple Silicon (M1/M2/M3/…)  
- `tetuka_<version>_x64.dmg` — Mac Intel  

**Instal**

1. Unduh file `.dmg` yang sesuai.
2. Buka dan seret **tetuka** ke **Applications**.
3. Peluncuran pertama: klik kanan aplikasi → **Open** → konfirmasi (Gatekeeper mungkin memblokir aplikasi yang belum ditandatangani).

**Uninstal**

Pindahkan aplikasi dari **Applications** ke Trash.

---

## Linux

**File terkait**

- `tetuka_<version>_amd64.AppImage` — berfungsi di sebagian besar distro (satu-satunya paket Linux yang kami sediakan)

**Instal (AppImage)**

```bash
chmod +x "tetuka_"*_amd64.AppImage
./tetuka_*_amd64.AppImage
```

Opsional: pindahkan ke `~/.local/bin/` dan buat desktop entry jika Anda ingin muncul di menu aplikasi.

Pembaruan otomatis di dalam aplikasi bekerja dengan build AppImage. Pastikan file dapat ditulis (bukan di mount read-only) agar pembaruan bisa menggantinya.

---

## Setelah instal

- Tidak perlu akun atau masuk.
- Template disimpan **secara lokal** di komputer Anda.
- Ekspor slide carousel sebagai file PNG ke folder yang Anda pilih.

Lihat [contribute.md](./contribute.md) untuk cara penggunaan dan build dari source langsung.

## Verifikasi unduhan Anda (opsional)

Pastikan aset didapat dari halaman **Releases** resmi repositori ini. Setiap rilis menyertakan `SHA256SUMS.txt`.

```bash
# Linux
sha256sum -c SHA256SUMS.txt --ignore-missing

# macOS
shasum -a 256 -c SHA256SUMS.txt --ignore-missing
```

Di Windows, bandingkan SHA-256 file yang diunduh dengan baris yang cocok di `SHA256SUMS.txt` (mis. `CertUtil -hashfile <file> SHA256`).

Build desktop juga menyertakan tanda tangan updater Tauri (`latest.json` + minisign). Penandatanganan installer OS (SmartScreen / Gatekeeper) belum diterapkan—harapkan peringatan di atas.
