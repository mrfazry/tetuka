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

Lihat [contribute.md](./contribute.md) untuk cara penggunaan dan membangun dari sumber.

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

---

# Download & install

tetuka is open source. Prebuilt installers are published on **GitHub Releases** for Windows, macOS, and Linux.

## Get the latest release

Use the download buttons at the top of this page (latest stable by default, or pick a tag). You can also open **GitHub Releases** for the repository.

If you forked or renamed the repo, use your own releases page instead.

---

## Windows

**Files to look for**

- `tetuka_<version>_x64-setup.exe` (NSIS installer)

**Install**

1. Download the `.exe`.
2. Run it. If SmartScreen warns, choose **More info** → **Run anyway** (unsigned personal builds often trigger this).
3. Finish the installer, then launch **tetuka** from the Start menu.

**Uninstall**

Use **Settings → Apps** and remove **tetuka**.

---

## macOS

**Files to look for**

- `tetuka_<version>_aarch64.dmg` — Apple Silicon (M1/M2/M3/…)  
- `tetuka_<version>_x64.dmg` — Intel Macs  

**Install**

1. Download the matching `.dmg`.
2. Open it and drag **tetuka** into **Applications**.
3. First launch: right-click the app → **Open** → confirm (Gatekeeper may block unsigned apps).

**Uninstall**

Move the app from **Applications** to Trash.

---

## Linux

**Files to look for**

- `tetuka_<version>_amd64.AppImage` — works on most distros (only Linux package we ship)

**Install (AppImage)**

```bash
chmod +x "tetuka_"*_amd64.AppImage
./tetuka_*_amd64.AppImage
```

Optional: move it to `~/.local/bin/` and create a desktop entry if you want it in your app menu.

In-app auto-update works with the AppImage build. Keep the file writable (not on a read-only mount) so updates can replace it.

---

## After install

- No account or sign-in.
- Templates are stored **locally** on your machine.
- Export carousel slides as PNG files to a folder you choose.

See [contribute.md](./contribute.md) for usage and for building from source.

## Verify what you downloaded (optional)

Prefer assets from the official **Releases** page of this repository. Each release includes `SHA256SUMS.txt`.

```bash
# Linux
sha256sum -c SHA256SUMS.txt --ignore-missing

# macOS
shasum -a 256 -c SHA256SUMS.txt --ignore-missing
```

On Windows, compare the SHA-256 of your downloaded file with the matching line in `SHA256SUMS.txt` (e.g. with `CertUtil -hashfile <file> SHA256`).

Desktop builds also ship Tauri updater signatures (`latest.json` + minisign). OS installer code signing (SmartScreen / Gatekeeper) is not applied yet—expect the warnings above.

## Creating a release (maintainers)

Releases are produced by GitHub Actions when you push a version tag.

1. Commit and push your changes to `main` (including [`.github/workflows/release.yml`](./.github/workflows/release.yml)).
2. Create and push a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

3. Open the repo **Actions** tab and wait for the **release** workflow to finish on all platforms (Windows, macOS arm64/x64, Linux).
4. Open **Releases** — a published release for that tag appears with `.exe` / `.dmg` / `.AppImage` assets, `latest.json` for auto-update, and `SHA256SUMS.txt`.
5. After the release workflow succeeds, **pages-deploy** builds the site (including `/install`) and deploys it to Cloudflare Pages.

Notes:

- Tag format must be `v*` (e.g. `v0.1.0`). The leading `v` is stripped for the app version (`0.1.0`).
- Tags with a hyphen (e.g. `v0.2.0-beta.1`) are marked as **prerelease**.
- You can re-run a build from **Actions → release → Run workflow** and pass an existing tag.
- Set GitHub Actions secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` so release builds can sign updater artifacts.
- Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for post-release site deploys.

End users should use **`/install`** on the site (latest stable by default) or **Releases → Latest**.

## No release yet? Build from source

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm install
npm run tauri:build
```

Installers appear under `src-tauri/target/release/bundle/`.
