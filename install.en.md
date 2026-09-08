# Download & install

tetuka is open source. Prebuilt installers are published on **GitHub Releases** for Windows, macOS, and Linux.

## Get the latest release

On the site, use the download controls on the install page (latest stable by default, or pick a tag). You can also open **GitHub Releases** for the repository.

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
