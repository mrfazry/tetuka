# Contribute

Developer notes for **tetuka** — a personal desktop (and browser) app that turns pasted text into Instagram-ready carousel PNGs.

- Upload a background **or** generate a constrained procedural one
- Split text on two blank lines
- Preview slides with pagination (`1 / N` when multi-slide)
- Save templates locally; select or delete anytime
- Export `slide-01.png`, `slide-02.png`, …

No auth. No cloud. No AI image generation.

**License:** [MIT](./LICENSE)

**End users:** open **`/install`** on the deployed site (or see **[Download & install](./install.en.md)**) for Windows (NSIS), macOS (DMG), and Linux (AppImage). The install page defaults to the latest stable GitHub Release and lets you pick older tags.

## Stack

- Tauri 2 + React + TypeScript + Vite
- `html-to-image` for PNG export
- Works in the **browser** (`npm run dev`) with IndexedDB storage, or as a **desktop** app via Tauri

## Prerequisites

### All platforms

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) stable (1.88+ recommended for latest Tauri deps; 1.87 works with the pinned lockfile)

### Linux (desktop build)

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

See [Tauri prerequisites](https://tauri.app/start/prerequisites/) for macOS/Windows details.

## Develop

```bash
npm install
npm run dev          # browser UI at http://localhost:1420
npm run tauri:dev    # native desktop window (needs OS deps)
```

## Build installers

```bash
npm run tauri:build
```

Artifacts land under `src-tauri/target/release/bundle/` (NSIS, AppImage, or DMG depending on OS).

### Multi-OS releases

Push a version tag or run the **release** GitHub Action:

```bash
git tag v0.1.0
git push origin v0.1.0
```

CI builds Windows, macOS, and Linux (AppImage) installers, publishes a GitHub Release for that tag (including `latest.json` and `SHA256SUMS.txt`), then deploys the site to Cloudflare Pages.

Required repository secrets:

- `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — updater artifact signing
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — Pages deploy after a successful release

Local site deploy (optional):

```bash
npm run pages:deploy
```

Set `GITHUB_REPOSITORY=owner/repo` when building so install-page links and the version picker target the correct Releases API.

## Usage

1. **Upload** an image template, or **Generate** / **Regenerate** a procedural background (saved to the library).
2. Paste text. Separate slides with two blank lines.
3. Choose **1080×1350** or **1080×1080**.
4. Preview with Prev/Next; export PNGs to a folder (desktop) or downloads (browser).

Templates live in the app data directory on desktop, or IndexedDB in the browser.
