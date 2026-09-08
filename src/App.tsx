import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SettingsPanel } from "./components/SettingsPanel";
import { Slide } from "./components/Slide";
import { TemplateLibrary } from "./components/TemplateLibrary";
import { exportSlides } from "./lib/exportSlides";
import { rollSeed } from "./lib/generateBackground";
import { isTauri } from "./lib/platform";
import { splitText } from "./lib/splitText";
import {
  deleteTemplate,
  listTemplates,
  loadSettings,
  pickImageFile,
  resolveImageSrc,
  saveGeneratedTemplate,
  saveSettings,
  saveUploadedTemplate,
} from "./lib/templateLibrary";
import {
  CANVAS_PORTRAIT,
  CANVAS_SQUARE,
  type SavedTemplate,
} from "./lib/types";
import { checkForUpdates } from "./lib/updates";
import "./App.css";

const SAMPLE = `Tulis slide pertama di sini.

Paragraf kedua tetap di slide yang sama.


Gunakan dua baris kosong antar slide
— atau baris yang hanya berisi ---


Seperti slide ketiga ini.`;

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [canvasMode, setCanvasMode] = useState<"portrait" | "square">("portrait");
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoUpdateChecked = useRef(false);

  const size = canvasMode === "portrait" ? CANVAS_PORTRAIT : CANVAS_SQUARE;
  const slides = useMemo(() => splitText(text), [text]);
  const active = templates.find((t) => t.id === activeId) ?? null;

  const refresh = useCallback(async () => {
    const list = await listTemplates();
    setTemplates(list);
    return list;
  }, []);

  useEffect(() => {
    (async () => {
      const desktop = await isTauri();
      setIsDesktop(desktop);
      const settings = await loadSettings();
      setCanvasMode(settings.canvas);
      setAutoUpdate(settings.autoUpdate);
      const list = await refresh();
      const initial =
        (settings.lastTemplateId &&
          list.find((t) => t.id === settings.lastTemplateId)?.id) ||
        list[0]?.id ||
        null;
      setActiveId(initial);
      setReady(true);

      if (desktop && settings.autoUpdate && !autoUpdateChecked.current) {
        autoUpdateChecked.current = true;
        void checkForUpdates({ interactive: false });
      }
    })().catch((err) => {
      console.error(err);
      setStatus("Gagal memuat perpustakaan");
      setReady(true);
    });
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    void saveSettings({
      lastTemplateId: activeId,
      canvas: canvasMode,
      autoUpdate,
    });
  }, [activeId, canvasMode, autoUpdate, ready]);

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    setStatus("Memeriksa pembaruan…");
    try {
      const result = await checkForUpdates({ interactive: true });
      if (result.status === "upToDate") {
        setStatus("Sudah versi terbaru");
      } else if (result.status === "updated") {
        setStatus(`Memasang v${result.version}…`);
      } else if (result.status === "error") {
        setStatus(`Pembaruan gagal: ${result.message}`);
      } else {
        setStatus(null);
      }
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!active || active.kind !== "upload") {
        setImageSrc(null);
        return;
      }
      const src = await resolveImageSrc(active);
      if (!cancelled) setImageSrc(src);
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (slideIndex >= slides.length) {
      setSlideIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, slideIndex]);

  const selectTemplate = (id: string) => {
    setActiveId(id);
    setStatus(null);
  };

  const handleGenerate = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const entry = await saveGeneratedTemplate(rollSeed());
      const list = await refresh();
      setTemplates(list);
      setActiveId(entry.id);
      setStatus(`Disimpan “${entry.name}”`);
    } catch (err) {
      console.error(err);
      setStatus("Tidak bisa membuat template");
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const file = await pickImageFile();
      if (!file) {
        setBusy(false);
        return;
      }
      const entry = await saveUploadedTemplate(file);
      const list = await refresh();
      setTemplates(list);
      setActiveId(entry.id);
      setStatus(`Disimpan “${entry.name}”`);
    } catch (err) {
      console.error(err);
      setStatus("Tidak bisa mengunggah template");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      const list = await deleteTemplate(id);
      setTemplates(list);
      if (activeId === id) {
        setActiveId(list[0]?.id ?? null);
      }
      setStatus("Template dihapus");
    } catch (err) {
      console.error(err);
      setStatus("Tidak bisa menghapus template");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    if (!active) {
      setStatus("Pilih atau buat template dulu");
      return;
    }
    setBusy(true);
    setStatus("Mengekspor…");
    try {
      // Wait a frame so hidden export slides are mounted/laid out
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const els = exportRefs.current.filter(Boolean) as HTMLDivElement[];
      const result = await exportSlides(els);
      setStatus(
        result.folder
          ? `${result.count} PNG diekspor ke ${result.folder}`
          : `${result.count} PNG diunduh`,
      );
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Ekspor gagal";
      setStatus(msg === "Ekspor dibatalkan" ? "Ekspor dibatalkan" : "Ekspor gagal");
    } finally {
      setBusy(false);
    }
  };

  const previewScale = canvasMode === "portrait" ? 0.32 : 0.36;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="brand">tetuka</p>
          <p className="tagline">Pembuat post IG lokal — template, teks, ekspor.</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={handleUpload} disabled={busy}>
            Unggah
          </button>
          <button type="button" onClick={handleGenerate} disabled={busy}>
            Generate template
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleGenerate}
            disabled={busy}
            title="Buat latar prosedural baru"
          >
            Regenerate template
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleExport}
            disabled={busy || !active}
          >
            Ekspor PNG
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setSettingsOpen(true)}
            title="Pengaturan"
          >
            Pengaturan
          </button>
        </div>
      </header>

      <SettingsPanel
        open={settingsOpen}
        autoUpdate={autoUpdate}
        isDesktop={isDesktop}
        checking={checkingUpdate}
        onClose={() => setSettingsOpen(false)}
        onAutoUpdateChange={setAutoUpdate}
        onCheckNow={() => void handleCheckUpdates()}
      />

      <section className="library-section">
        <div className="section-label">Perpustakaan template</div>
        <TemplateLibrary
          templates={templates}
          activeId={activeId}
          onSelect={selectTemplate}
          onDelete={handleDelete}
        />
      </section>

      <div className="workspace">
        <aside className="controls">
          <label className="field">
            <span>Ukuran kanvas</span>
            <div className="segmented">
              <button
                type="button"
                className={canvasMode === "portrait" ? "on" : ""}
                onClick={() => setCanvasMode("portrait")}
              >
                1080 × 1350
              </button>
              <button
                type="button"
                className={canvasMode === "square" ? "on" : ""}
                onClick={() => setCanvasMode("square")}
              >
                1080 × 1080
              </button>
            </div>
          </label>

          <label className="field grow">
            <span>
              Teks{" "}
              <em>
                (dua baris kosong atau <code>---</code> memisahkan slide)
              </em>
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
          </label>

          {status && <p className="status">{status}</p>}
        </aside>

        <main className="preview-pane">
          <div className="preview-frame">
            <Slide
              text={slides[slideIndex] ?? ""}
              template={active}
              imageSrc={imageSrc}
              size={size}
              pageIndex={slideIndex}
              pageTotal={slides.length}
              scale={previewScale}
            />
          </div>

          <div className="slide-nav">
            <button
              type="button"
              disabled={slideIndex <= 0}
              onClick={() => setSlideIndex((i) => i - 1)}
            >
              Sebelumnya
            </button>
            <span>
              Slide {slideIndex + 1} dari {slides.length}
            </span>
            <button
              type="button"
              disabled={slideIndex >= slides.length - 1}
              onClick={() => setSlideIndex((i) => i + 1)}
            >
              Berikutnya
            </button>
          </div>

          <div className="thumbs">
            {slides.map((chunk, i) => (
              <button
                key={i}
                type="button"
                className={`thumb ${i === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(i)}
              >
                {i + 1}
                <span>{chunk.slice(0, 42) || "Kosong"}</span>
              </button>
            ))}
          </div>
        </main>
      </div>

      {ready && !isDesktop && (
        <p className="web-cta">
          Butuh website atau web app? Konsultasi ke{" "}
          <a
            href="https://b3-labs.id"
            target="_blank"
            rel="noopener noreferrer"
          >
            B3 Labs
          </a>
          .
        </p>
      )}

      {/* Off-screen full-size slides for export */}
      <div className="export-stage" aria-hidden>
        {slides.map((chunk, i) => (
          <Slide
            key={`export-${i}-${size.height}-${activeId}`}
            text={chunk}
            template={active}
            imageSrc={imageSrc}
            size={size}
            pageIndex={i}
            pageTotal={slides.length}
            scale={1}
            slideRef={(el) => {
              exportRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
