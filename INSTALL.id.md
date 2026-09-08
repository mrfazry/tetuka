# Unduh & instal

tetuka bersifat open source. Installer siap pakai dipublikasikan di **GitHub Releases** untuk Windows, macOS, dan Linux.

## Ambil rilis terbaru

Gunakan tombol unduh di bagian atas halaman ini (rilis stabil terbaru secara default, atau pilih tag). Anda juga bisa membuka **GitHub Releases** repositori.

Jika Anda mem-fork atau mengganti nama repo, gunakan halaman releases milik Anda sendiri.

---

## Windows

**File yang dicari**

- `tetuka_<version>_x64-setup.exe` (installer NSIS)

**Instal**

1. Unduh file `.exe`.
2. Jalankan. Jika SmartScreen memperingatkan, pilih **More info** → **Run anyway** (build pribadi yang belum ditandatangani sering memicu ini).
3. Selesaikan installer, lalu jalankan **tetuka** dari Start menu.

**Uninstal**

Gunakan **Settings → Apps** dan hapus **tetuka**.

---

## macOS

**File yang dicari**

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

**File yang dicari**

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

Lihat [README](./README.md) utama untuk cara penggunaan dan membangun dari sumber.

## Verifikasi unduhan Anda (opsional)

Utamakan aset dari halaman **Releases** resmi repositori ini. Setiap rilis menyertakan `SHA256SUMS.txt`.

```bash
# Linux
sha256sum -c SHA256SUMS.txt --ignore-missing

# macOS
shasum -a 256 -c SHA256SUMS.txt --ignore-missing
```

Di Windows, bandingkan SHA-256 file yang diunduh dengan baris yang cocok di `SHA256SUMS.txt` (mis. `CertUtil -hashfile <file> SHA256`).

Build desktop juga menyertakan tanda tangan updater Tauri (`latest.json` + minisign). Penandatanganan installer OS (SmartScreen / Gatekeeper) belum diterapkan—harapkan peringatan di atas.

## Belum ada rilis?

Jika Releases masih kosong, bangun dari sumber (pengembang):

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm install
npm run tauri:build
```

Installer muncul di `src-tauri/target/release/bundle/`. Maintainer dapat membuat rilis dengan memberi tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Itu memicu GitHub Action yang melampirkan installer Windows / macOS / Linux (AppImage) ke rilis, termasuk `latest.json` dan `SHA256SUMS.txt`. Setelah rilis sukses, situs (termasuk `/install`) di-deploy ke Cloudflare Pages.

Setel secret Actions:

- `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — tanda tangan artefak updater
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — deploy Pages setelah rilis
