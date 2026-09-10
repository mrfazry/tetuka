import { toPng } from "html-to-image";
import { isTauri } from "./platform";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

async function rasterize(el: HTMLElement): Promise<string> {
  return toPng(el, {
    pixelRatio: 1,
    cacheBust: true,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });
}

async function savePngs(
  pngs: { name: string; dataUrl: string }[],
): Promise<{ count: number; folder?: string }> {
  if (await isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const { join } = await import("@tauri-apps/api/path");
    const folder = await open({ directory: true, multiple: false });
    if (!folder || Array.isArray(folder)) {
      throw new Error("Ekspor dibatalkan");
    }
    for (const png of pngs) {
      const path = await join(folder, png.name);
      await writeFile(path, await dataUrlToBytes(png.dataUrl));
    }
    return { count: pngs.length, folder };
  }

  for (const png of pngs) {
    downloadDataUrl(png.dataUrl, png.name);
  }
  return { count: pngs.length };
}

/**
 * Rasterize each slide element at full resolution and write PNGs.
 * In Tauri: pick a folder and write files. In browser: download each file.
 */
export async function exportSlides(
  slideEls: HTMLElement[],
): Promise<{ count: number; folder?: string }> {
  if (slideEls.length === 0) {
    throw new Error("Tidak ada slide untuk diekspor");
  }

  const pngs: { name: string; dataUrl: string }[] = [];
  for (let i = 0; i < slideEls.length; i++) {
    const el = slideEls[i]!;
    const dataUrl = await rasterize(el);
    pngs.push({ name: `slide-${pad(i + 1)}.png`, dataUrl });
  }

  return savePngs(pngs);
}

/** Rasterize one element and save a single PNG. */
export async function exportSinglePng(
  el: HTMLElement,
  filename: string,
): Promise<{ count: number; folder?: string }> {
  const dataUrl = await rasterize(el);
  return savePngs([{ name: filename, dataUrl }]);
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "template";
}
