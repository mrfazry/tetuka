import { useState, type MouseEvent } from "react";
import "./PrivacyPolicy.css";

type Lang = "id" | "en";

function goHome(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  window.history.pushState({}, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const copy = {
  id: {
    title: "Kebijakan privasi",
    back: "← Kembali ke aplikasi",
    langLabel: "Bahasa",
    sections: [
      {
        heading: "Ringkasan",
        body: [
          "tetuka berjalan sepenuhnya di perangkat Anda (browser atau aplikasi desktop). Tidak ada akun, tidak ada cloud untuk konten Anda.",
          "Teks yang Anda tulis, template, dan gambar latar tidak dikirim ke server mana pun. Semua pemrosesan terjadi di frontend pada perangkat Anda.",
        ],
      },
      {
        heading: "Data yang disimpan secara lokal",
        body: [
          "Di browser, template dan pengaturan disimpan di IndexedDB pada perangkat Anda.",
          "Di aplikasi desktop, data yang sama disimpan di folder data aplikasi lokal pada komputer Anda.",
          "Ekspor PNG hanya mengunduh atau menyimpan file ke lokasi yang Anda pilih — tidak diunggah.",
        ],
      },
      {
        heading: "Yang tidak kami kumpulkan",
        body: [
          "Kami tidak mengumpulkan teks slide, gambar template, atau identitas pengguna.",
          "Tidak ada analitik pihak ketiga di dalam aplikasi untuk melacak konten Anda.",
        ],
      },
      {
        heading: "Pengecualian",
        body: [
          "Saat Anda membuka situs web, penyedia hosting (Cloudflare Pages) dapat melihat permintaan halaman biasa seperti alamat IP.",
          "Di aplikasi desktop, jika pembaruan otomatis aktif, aplikasi dapat memeriksa GitHub Releases untuk versi baru. Itu tidak mengirim teks atau template Anda.",
          "Halaman unduh/instal dapat memuat daftar rilis dari API GitHub agar tombol unduh berfungsi.",
        ],
      },
      {
        heading: "Kontak",
        body: [
          "Pertanyaan tentang kebijakan ini: kunjungi B3 Labs.",
        ],
      },
    ],
    contactLabel: "B3 Labs",
  },
  en: {
    title: "Privacy policy",
    back: "← Back to app",
    langLabel: "Language",
    sections: [
      {
        heading: "Summary",
        body: [
          "tetuka runs entirely on your device (browser or desktop app). No accounts. No cloud for your content.",
          "The text you write, templates, and background images are never sent to any server. All processing happens in the frontend on your device.",
        ],
      },
      {
        heading: "Data stored locally",
        body: [
          "In the browser, templates and settings are stored in IndexedDB on your device.",
          "In the desktop app, the same data lives in the local application data folder on your computer.",
          "PNG export only downloads or saves files to a location you choose — nothing is uploaded.",
        ],
      },
      {
        heading: "What we do not collect",
        body: [
          "We do not collect slide text, template images, or user identity.",
          "There is no third-party analytics inside the app that tracks your content.",
        ],
      },
      {
        heading: "Exceptions",
        body: [
          "When you open the website, the host (Cloudflare Pages) may see ordinary page requests such as IP address.",
          "In the desktop app, if automatic updates are enabled, the app may check GitHub Releases for a newer version. That does not send your text or templates.",
          "The download/install page may load release lists from the GitHub API so download buttons work.",
        ],
      },
      {
        heading: "Contact",
        body: [
          "Questions about this policy: visit B3 Labs.",
        ],
      },
    ],
    contactLabel: "B3 Labs",
  },
} as const;

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<Lang>("id");
  const t = copy[lang];

  return (
    <div className="privacy">
      <header className="privacy-header">
        <a className="privacy-back" href="/" onClick={goHome}>
          {t.back}
        </a>
        <div className="privacy-lang" role="group" aria-label={t.langLabel}>
          <button
            type="button"
            className={lang === "id" ? "on" : ""}
            aria-current={lang === "id" ? "true" : undefined}
            onClick={() => setLang("id")}
          >
            Bahasa Indonesia
          </button>
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            aria-current={lang === "en" ? "true" : undefined}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>
      </header>

      <h1>{t.title}</h1>
      <p className="privacy-brand">tetuka</p>

      {t.sections.map((section) => (
        <section key={section.heading} className="privacy-section">
          <h2>{section.heading}</h2>
          {section.body.map((para) => {
            if (!para.includes("B3 Labs")) {
              return <p key={para}>{para}</p>;
            }
            const [before] = para.split(/B3 Labs\.?/);
            return (
              <p key={para}>
                {before}
                <a
                  href="https://b3-labs.id"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.contactLabel}
                </a>
                .
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}
