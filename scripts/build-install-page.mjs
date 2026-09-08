import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo =
  process.env.GITHUB_REPOSITORY &&
  /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(process.env.GITHUB_REPOSITORY)
    ? process.env.GITHUB_REPOSITORY
    : "<owner>/<repo>";
const githubBlobBase = `https://github.com/${repo}/blob/main`;
const githubReleasesBase = `https://github.com/${repo}/releases`;

const pages = [
  {
    source: "INSTALL.md",
    out: join("public", "install", "index.html"),
    lang: "en",
    title: "Download & install — tetuka",
    homeLabel: "Open app",
    langLabel: "Language",
    enLabel: "English",
    idLabel: "Bahasa Indonesia",
    picker: {
      heading: "Download",
      loading: "Loading releases…",
      error: "Could not load releases from GitHub.",
      fallback: "Open GitHub Releases",
      versionLabel: "Version",
      latestStableHint: "Latest stable",
      prereleaseHint: "Pre-release",
      win: "Windows (NSIS)",
      macArm: "macOS (Apple Silicon)",
      macIntel: "macOS (Intel)",
      linux: "Linux (AppImage)",
      checksums: "SHA256SUMS.txt",
      missing: "No matching installer on this release",
    },
  },
  {
    source: "INSTALL.id.md",
    out: join("public", "install", "id", "index.html"),
    lang: "id",
    title: "Unduh & instal — tetuka",
    homeLabel: "Buka aplikasi",
    langLabel: "Bahasa",
    enLabel: "English",
    idLabel: "Bahasa Indonesia",
    picker: {
      heading: "Unduh",
      loading: "Memuat rilis…",
      error: "Tidak dapat memuat rilis dari GitHub.",
      fallback: "Buka GitHub Releases",
      versionLabel: "Versi",
      latestStableHint: "Stabil terbaru",
      prereleaseHint: "Pra-rilis",
      win: "Windows (NSIS)",
      macArm: "macOS (Apple Silicon)",
      macIntel: "macOS (Intel)",
      linux: "Linux (AppImage)",
      checksums: "SHA256SUMS.txt",
      missing: "Tidak ada installer yang cocok di rilis ini",
    },
  },
];

function rewriteDocLinks(html) {
  let out = html.replace(
    /href="\.\/([^"#]+)(#[^"]*)?"/g,
    (_match, path, hash = "") => `href="${githubBlobBase}/${path}${hash}"`,
  );
  out = out.replaceAll("https://github.com/<owner>/<repo>", `https://github.com/${repo}`);
  out = out.replaceAll("<owner>/<repo>", repo);
  return out;
}

function pickerMarkup(labels) {
  return `
<section class="picker" id="download-picker" data-repo="${repo}" aria-labelledby="picker-heading">
  <h2 id="picker-heading">${labels.heading}</h2>
  <p class="picker-status" id="picker-status" role="status">${labels.loading}</p>
  <p class="picker-error" id="picker-error" hidden></p>
  <p class="picker-fallback" id="picker-fallback" hidden>
    <a href="${githubReleasesBase}" rel="noopener">${labels.fallback}</a>
  </p>
  <div class="picker-controls" id="picker-controls" hidden>
    <label class="picker-version">
      <span>${labels.versionLabel}</span>
      <select id="picker-tag" aria-label="${labels.versionLabel}"></select>
    </label>
    <p class="picker-hint" id="picker-hint"></p>
    <div class="picker-buttons" id="picker-buttons">
      <a class="dl" data-kind="win" href="#" hidden>${labels.win}</a>
      <a class="dl" data-kind="macArm" href="#" hidden>${labels.macArm}</a>
      <a class="dl" data-kind="macIntel" href="#" hidden>${labels.macIntel}</a>
      <a class="dl" data-kind="linux" href="#" hidden>${labels.linux}</a>
      <a class="dl checksums" data-kind="checksums" href="#" hidden>${labels.checksums}</a>
    </div>
    <p class="picker-missing" id="picker-missing" hidden>${labels.missing}</p>
  </div>
</section>
<script>
(function () {
  var labels = ${JSON.stringify(labels)};
  var root = document.getElementById("download-picker");
  if (!root) return;
  var repo = root.getAttribute("data-repo") || "";
  var statusEl = document.getElementById("picker-status");
  var errorEl = document.getElementById("picker-error");
  var fallbackEl = document.getElementById("picker-fallback");
  var controlsEl = document.getElementById("picker-controls");
  var tagEl = document.getElementById("picker-tag");
  var hintEl = document.getElementById("picker-hint");
  var missingEl = document.getElementById("picker-missing");
  var releases = [];

  function classifyAsset(name) {
    var n = name.toLowerCase();
    if (n === "sha256sums.txt") return "checksums";
    if (n.endsWith(".appimage")) return "linux";
    if (n.endsWith("-setup.exe") || (n.endsWith(".exe") && n.indexOf("setup") !== -1)) return "win";
    if (n.endsWith(".dmg") && (n.indexOf("aarch64") !== -1 || n.indexOf("arm64") !== -1)) return "macArm";
    if (n.endsWith(".dmg") && (n.indexOf("x64") !== -1 || n.indexOf("x86_64") !== -1)) return "macIntel";
    if (n.endsWith(".dmg")) return "macIntel";
    return null;
  }

  function applyRelease(rel) {
    var byKind = {};
    (rel.assets || []).forEach(function (a) {
      var kind = classifyAsset(a.name);
      if (kind && !byKind[kind]) byKind[kind] = a.browser_download_url;
    });
    var any = false;
    root.querySelectorAll(".dl").forEach(function (el) {
      var kind = el.getAttribute("data-kind");
      var url = byKind[kind];
      if (url) {
        el.href = url;
        el.hidden = false;
        any = true;
      } else {
        el.hidden = true;
        el.removeAttribute("href");
      }
    });
    missingEl.hidden = any;
    if (rel.prerelease) {
      hintEl.textContent = labels.prereleaseHint;
    } else {
      var latestStable = releases.find(function (r) { return !r.prerelease; });
      hintEl.textContent =
        latestStable && latestStable.tag_name === rel.tag_name
          ? labels.latestStableHint
          : "";
    }
  }

  function showError(msg) {
    statusEl.hidden = true;
    controlsEl.hidden = true;
    errorEl.hidden = false;
    errorEl.textContent = msg || labels.error;
    fallbackEl.hidden = false;
  }

  if (!repo || repo.indexOf("<") !== -1) {
    showError(labels.error);
    return;
  }

  fetch("https://api.github.com/repos/" + repo + "/releases?per_page=30", {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      releases = (data || []).filter(function (r) { return !r.draft; });
      if (!releases.length) throw new Error("empty");
      tagEl.innerHTML = "";
      releases.forEach(function (r, i) {
        var opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = r.tag_name + (r.prerelease ? " (" + labels.prereleaseHint + ")" : "");
        tagEl.appendChild(opt);
      });
      var preferred = releases.findIndex(function (r) { return !r.prerelease; });
      if (preferred < 0) preferred = 0;
      tagEl.value = String(preferred);
      applyRelease(releases[preferred]);
      statusEl.hidden = true;
      controlsEl.hidden = false;
      tagEl.addEventListener("change", function () {
        var idx = Number(tagEl.value);
        if (releases[idx]) applyRelease(releases[idx]);
      });
    })
    .catch(function () {
      showError(labels.error);
    });
})();
</script>
`;
}

function renderPage({ htmlBody, meta }) {
  const enHref = "/install/";
  const idHref = "/install/id/";
  const enCurrent = meta.lang === "en" ? ' aria-current="page"' : "";
  const idCurrent = meta.lang === "id" ? ' aria-current="page"' : "";

  return `<!doctype html>
<html lang="${meta.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <script>window.__TETUKA_REPO__=${JSON.stringify(repo)};</script>
  <style>
    :root {
      --bg: #f6f3ee;
      --ink: #1c1917;
      --muted: #57534e;
      --line: #d6d3d1;
      --accent: #0f766e;
      --code-bg: #ebe6df;
      --btn: #0f766e;
      --btn-ink: #fafaf9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
      color: var(--ink);
      background:
        radial-gradient(1200px 600px at 10% -10%, #e7efe9 0%, transparent 55%),
        radial-gradient(900px 500px at 100% 0%, #efe8dc 0%, transparent 50%),
        var(--bg);
      line-height: 1.65;
    }
    .wrap {
      max-width: 42rem;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 3.5rem;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--line);
    }
    .brand {
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      font-weight: 650;
      letter-spacing: 0.02em;
      color: var(--ink);
      text-decoration: none;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      align-items: center;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      font-size: 0.9rem;
    }
    nav a {
      color: var(--accent);
      text-decoration: none;
    }
    nav a:hover { text-decoration: underline; }
    nav a[aria-current="page"] {
      color: var(--ink);
      font-weight: 600;
      text-decoration: none;
      pointer-events: none;
    }
    .lang {
      color: var(--muted);
      display: inline-flex;
      gap: 0.4rem;
      align-items: center;
    }
    .lang span { color: var(--muted); }
    .picker {
      margin: 0 0 2.25rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--line);
      font-family: "Avenir Next", "Segoe UI", sans-serif;
    }
    .picker h2 {
      font-size: 1.35rem;
      margin: 0 0 0.75rem;
      letter-spacing: -0.01em;
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    }
    .picker-status, .picker-error, .picker-hint, .picker-missing {
      color: var(--muted);
      font-size: 0.92rem;
      margin: 0.5rem 0;
    }
    .picker-error { color: #9f1239; }
    .picker-version {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.9rem;
      margin: 0.75rem 0;
      max-width: 18rem;
    }
    .picker-version select {
      font: inherit;
      padding: 0.45rem 0.55rem;
      border: 1px solid var(--line);
      border-radius: 0.35rem;
      background: #fff;
      color: var(--ink);
    }
    .picker-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .picker-buttons .dl {
      display: inline-block;
      padding: 0.55rem 0.9rem;
      background: var(--btn);
      color: var(--btn-ink);
      text-decoration: none;
      border-radius: 0.35rem;
      font-size: 0.88rem;
      font-weight: 600;
    }
    .picker-buttons .dl:hover { filter: brightness(1.05); }
    .picker-buttons .dl.checksums {
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--line);
      font-weight: 500;
    }
    .picker-fallback a { color: var(--accent); }
    article h1 {
      font-size: 2rem;
      line-height: 1.2;
      margin: 0 0 1rem;
      letter-spacing: -0.02em;
    }
    article h2 {
      font-size: 1.25rem;
      margin: 2rem 0 0.75rem;
      letter-spacing: -0.01em;
    }
    article p, article li { color: var(--ink); }
    article a { color: var(--accent); }
    article hr {
      border: 0;
      border-top: 1px solid var(--line);
      margin: 2rem 0;
    }
    article code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.88em;
      background: var(--code-bg);
      padding: 0.1em 0.35em;
      border-radius: 0.25rem;
    }
    article pre {
      background: #1c1917;
      color: #f5f5f4;
      padding: 1rem 1.1rem;
      overflow-x: auto;
      border-radius: 0.5rem;
    }
    article pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.85rem;
    }
    article strong { font-weight: 650; }
    article ul { padding-left: 1.2rem; }
    article ol { padding-left: 1.3rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="brand" href="/">tetuka</a>
      <nav>
        <a href="/">${meta.homeLabel}</a>
        <span class="lang">
          <span>${meta.langLabel}:</span>
          <a href="${enHref}"${enCurrent}>${meta.enLabel}</a>
          <span>·</span>
          <a href="${idHref}"${idCurrent}>${meta.idLabel}</a>
        </span>
      </nav>
    </header>
    ${pickerMarkup(meta.picker)}
    <article>
${htmlBody}
    </article>
  </div>
</body>
</html>
`;
}

marked.setOptions({ gfm: true });

for (const page of pages) {
  const markdown = readFileSync(join(root, page.source), "utf8");
  const htmlBody = rewriteDocLinks(marked.parse(markdown).trim());
  const outPath = join(root, page.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderPage({ htmlBody, meta: page }), "utf8");
  console.log(`Wrote ${page.out} (repo=${repo})`);
}
