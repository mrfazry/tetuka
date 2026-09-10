import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { SettingsPanel } from "./components/SettingsPanel";
import { Slide } from "./components/Slide";
import { TemplateLibrary } from "./components/TemplateLibrary";
import { exportSinglePng, exportSlides, sanitizeFilename } from "./lib/exportSlides";
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
import { CANVAS_PORTRAIT, type SavedTemplate } from "./lib/types";
import { checkForUpdates } from "./lib/updates";
import "./App.css";

const SAMPLE = `Tulis slide pertama di sini.

Paragraf kedua tetap di slide yang sama.


Gunakan dua baris kosong antar slide.


Seperti slide ketiga ini.`;

export default function App() {
  const [text, setText] = useState(SAMPLE);
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
  const templateExportRef = useRef<HTMLDivElement | null>(null);
  const templateExportWaiter = useRef<{
    resolve: (el: HTMLDivElement) => void;
    reject: (err: Error) => void;
  } | null>(null);
  const autoUpdateChecked = useRef(false);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [templateExport, setTemplateExport] = useState<{
    template: SavedTemplate;
    imageSrc: string | null;
  } | null>(null);

  const size = CANVAS_PORTRAIT;
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
      // Portrait-only for now; coerce any stored "square" setting.
      setAutoUpdate(settings.autoUpdate);
      if (settings.canvas !== "portrait") {
        await saveSettings({ ...settings, canvas: "portrait" });
      }
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
      canvas: "portrait",
      autoUpdate,
    });
  }, [activeId, autoUpdate, ready]);

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
      const msg = err instanceof Error ? err.message : "";
      setStatus(
        msg.startsWith("Ukuran harus")
          ? msg
          : "Tidak bisa menambah template",
      );
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

  const handleClearText = () => {
    setText("");
    setStatus(null);
    textAreaRef.current?.focus();
  };

  const handlePasteText = async () => {
    try {
      const pasted = await navigator.clipboard.readText();
      setText(pasted);
      setStatus(pasted.trim() ? "Teks ditempel" : "Clipboard kosong");
      textAreaRef.current?.focus();
    } catch (err) {
      console.error(err);
      setStatus("Di HP: tekan lama di kotak teks lalu pilih Tempel");
      textAreaRef.current?.focus();
    }
  };

  const handleTextAreaFocus = () => {
    const el = textAreaRef.current;
    if (!el || el.value !== SAMPLE) return;
    // Defer so focus settles; selecting SAMPLE lets native paste replace it.
    requestAnimationFrame(() => {
      if (textAreaRef.current?.value === SAMPLE) {
        textAreaRef.current.select();
      }
    });
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

  const handleExportTemplate = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) {
      setStatus("Template tidak ditemukan");
      return;
    }
    setBusy(true);
    setStatus("Mengekspor template…");
    try {
      const src =
        template.kind === "upload" ? await resolveImageSrc(template) : null;
      const el = await new Promise<HTMLDivElement>((resolve, reject) => {
        templateExportWaiter.current = { resolve, reject };
        setTemplateExport({ template, imageSrc: src });
      });
      const filename = `${sanitizeFilename(template.name)}.png`;
      const result = await exportSinglePng(el, filename);
      setStatus(
        result.folder
          ? `Template diekspor ke ${result.folder}`
          : "Template diunduh",
      );
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Ekspor gagal";
      setStatus(msg === "Ekspor dibatalkan" ? "Ekspor dibatalkan" : "Ekspor gagal");
    } finally {
      templateExportWaiter.current = null;
      setTemplateExport(null);
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!templateExport) return;
    const waiter = templateExportWaiter.current;
    if (!waiter) return;
    const el = templateExportRef.current;
    templateExportWaiter.current = null;
    if (!el) {
      waiter.reject(new Error("Ekspor gagal"));
      return;
    }
    // Let layout settle before rasterizing
    requestAnimationFrame(() => waiter.resolve(el));
  }, [templateExport]);

  const desktopCap = 0.32;
  const previewScale =
    frameWidth > 0
      ? Math.min(desktopCap, frameWidth / size.width)
      : desktopCap;

  useEffect(() => {
    const el = previewFrameRef.current;
    if (!el) return;

    const update = () => setFrameWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="brand">tetuka</p>
          <p className="tagline">
            Pembuat post IG lokal — proses di perangkat Anda. Teks &amp; template
            tidak dikirim ke server.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            onClick={handleUpload}
            disabled={busy}
            title="Disimpan di perangkat Anda, tidak dikirim ke server"
          >
            Unggah gambar
          </button>
          <button type="button" onClick={handleGenerate} disabled={busy}>
            Generate template
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
          busy={busy}
          onSelect={selectTemplate}
          onDelete={handleDelete}
          onExportTemplate={(id) => void handleExportTemplate(id)}
        />
      </section>

      <div className="workspace">
        <aside className="controls">
          <label className="field grow">
            <span>
              Teks{" "}
              <em>
                (dua baris kosong memisahkan slide · di HP: tekan lama lalu
                Tempel)
              </em>
            </span>
            <div className="field-actions">
              <button
                type="button"
                className="secondary"
                onClick={handleClearText}
                disabled={!text}
              >
                Hapus
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => void handlePasteText()}
              >
                Tempel
              </button>
            </div>
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleTextAreaFocus}
              spellCheck={false}
              placeholder="Tempel teks di sini…"
            />
          </label>

          {status && <p className="status">{status}</p>}
        </aside>

        <main className="preview-pane">
          <div className="preview-frame" ref={previewFrameRef}>
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

      <footer className="app-footer">
        {ready && !isDesktop && (
          <>
            <p className="web-cta">
              Mau install di komputer? Lihat caranya di{" "}
              <a href="/install/id/">halaman unduh &amp; instal</a>.
            </p>
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
          </>
        )}
        <p className="web-cta privacy-link">
          <a
            href="./privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/privacy-policy");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Kebijakan privasi
          </a>
          {" — "}
          semuanya di frontend; data Anda tidak dikirim ke server.
        </p>
      </footer>

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
        {templateExport && (
          <div
            ref={templateExportRef}
            className="template-export-canvas"
            style={{
              width: CANVAS_PORTRAIT.width,
              height: CANVAS_PORTRAIT.height,
            }}
          >
            <BackgroundLayer
              template={templateExport.template}
              imageSrc={templateExport.imageSrc}
            />
          </div>
        )}
      </div>
    </div>
  );
}
