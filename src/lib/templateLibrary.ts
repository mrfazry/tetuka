import { isTauri } from "./platform";
import { seedDisplayName } from "./generateBackground";
import type { AppSettings, SavedTemplate, TemplateSeed } from "./types";

const INDEX_KEY = "templates/index.json";
const SETTINGS_KEY = "settings.json";
const BROWSER_DB = "tetuka";
const BROWSER_STORE = "kv";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayLabel(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- Browser IndexedDB helpers ---------------- */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BROWSER_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(BROWSER_STORE)) {
        db.createObjectStore(BROWSER_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BROWSER_STORE, "readonly");
    const req = tx.objectStore(BROWSER_STORE).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BROWSER_STORE, "readwrite");
    tx.objectStore(BROWSER_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDel(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BROWSER_STORE, "readwrite");
    tx.objectStore(BROWSER_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------------- Tauri FS helpers ---------------- */

async function ensureTauriDirs(): Promise<string> {
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const {
    exists,
    mkdir,
  } = await import("@tauri-apps/plugin-fs");
  const base = await appDataDir();
  const templates = await join(base, "templates");
  const images = await join(templates, "images");
  if (!(await exists(templates))) {
    await mkdir(templates, { recursive: true });
  }
  if (!(await exists(images))) {
    await mkdir(images, { recursive: true });
  }
  return base;
}

async function tauriReadText(relPath: string): Promise<string | null> {
  const { join } = await import("@tauri-apps/api/path");
  const { exists, readTextFile } = await import("@tauri-apps/plugin-fs");
  const base = await ensureTauriDirs();
  const full = await join(base, relPath);
  if (!(await exists(full))) return null;
  return readTextFile(full);
}

async function tauriWriteText(relPath: string, contents: string): Promise<void> {
  const { join } = await import("@tauri-apps/api/path");
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  const base = await ensureTauriDirs();
  const full = await join(base, relPath);
  await writeTextFile(full, contents);
}

async function tauriWriteBytes(relPath: string, data: Uint8Array): Promise<string> {
  const { join } = await import("@tauri-apps/api/path");
  const { writeFile } = await import("@tauri-apps/plugin-fs");
  const base = await ensureTauriDirs();
  const full = await join(base, relPath);
  await writeFile(full, data);
  return full;
}

async function tauriRemove(relPath: string): Promise<void> {
  const { join } = await import("@tauri-apps/api/path");
  const { exists, remove } = await import("@tauri-apps/plugin-fs");
  const base = await ensureTauriDirs();
  const full = await join(base, relPath);
  if (await exists(full)) {
    await remove(full);
  }
}

/* ---------------- Public API ---------------- */

async function readIndex(): Promise<SavedTemplate[]> {
  if (await isTauri()) {
    const raw = await tauriReadText(INDEX_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SavedTemplate[];
    } catch {
      return [];
    }
  }
  return (await idbGet<SavedTemplate[]>(INDEX_KEY)) ?? [];
}

async function writeIndex(list: SavedTemplate[]): Promise<void> {
  if (await isTauri()) {
    await tauriWriteText(INDEX_KEY, JSON.stringify(list, null, 2));
    return;
  }
  await idbSet(INDEX_KEY, list);
}

export async function loadSettings(): Promise<AppSettings> {
  const defaults: AppSettings = {
    lastTemplateId: null,
    canvas: "portrait",
    autoUpdate: true,
  };
  if (await isTauri()) {
    const raw = await tauriReadText(SETTINGS_KEY);
    if (!raw) return defaults;
    try {
      return { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      return defaults;
    }
  }
  const stored = await idbGet<Partial<AppSettings>>(SETTINGS_KEY);
  return stored ? { ...defaults, ...stored } : defaults;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (await isTauri()) {
    await tauriWriteText(SETTINGS_KEY, JSON.stringify(settings, null, 2));
    return;
  }
  await idbSet(SETTINGS_KEY, settings);
}

export async function listTemplates(): Promise<SavedTemplate[]> {
  const list = await readIndex();
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveGeneratedTemplate(
  seed: TemplateSeed,
): Promise<SavedTemplate> {
  const entry: SavedTemplate = {
    id: uid(),
    name: seedDisplayName(seed),
    kind: "generated",
    createdAt: new Date().toISOString(),
    seed,
  };
  const list = await readIndex();
  list.push(entry);
  await writeIndex(list);
  return entry;
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function extFromName(name: string): string {
  const m = name.toLowerCase().match(/\.(png|jpe?g|webp|gif)$/);
  return m ? m[1]!.replace("jpeg", "jpg") : "png";
}

export async function saveUploadedTemplate(file: File): Promise<SavedTemplate> {
  const id = uid();
  const ext = extFromName(file.name);
  const entry: SavedTemplate = {
    id,
    name: `Tambah ${todayLabel()}`,
    kind: "upload",
    createdAt: new Date().toISOString(),
  };

  if (await isTauri()) {
    const rel = `templates/images/${id}.${ext}`;
    const bytes = await fileToBytes(file);
    const full = await tauriWriteBytes(rel, bytes);
    entry.imagePath = full;
  } else {
    entry.imageData = await fileToDataUrl(file);
  }

  const list = await readIndex();
  list.push(entry);
  await writeIndex(list);
  return entry;
}

export async function deleteTemplate(id: string): Promise<SavedTemplate[]> {
  const list = await readIndex();
  const target = list.find((t) => t.id === id);
  if (!target) return listTemplates();

  if (await isTauri()) {
    if (target.imagePath) {
      const { remove, exists } = await import("@tauri-apps/plugin-fs");
      if (await exists(target.imagePath)) {
        await remove(target.imagePath);
      }
    } else {
      // Best-effort remove by known relative patterns
      for (const ext of ["png", "jpg", "jpeg", "webp", "gif"]) {
        await tauriRemove(`templates/images/${id}.${ext}`);
      }
    }
  } else {
    await idbDel(`image:${id}`);
  }

  const next = list.filter((t) => t.id !== id);
  await writeIndex(next);
  return listTemplates();
}

/** Resolve a displayable image URL for an uploaded template. */
export async function resolveImageSrc(
  template: SavedTemplate,
): Promise<string | null> {
  if (template.kind !== "upload") return null;
  if (template.imageData) return template.imageData;
  if (!template.imagePath) return null;

  if (await isTauri()) {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    return convertFileSrc(template.imagePath);
  }
  return template.imagePath;
}

export async function pickImageFile(): Promise<File | null> {
  if (await isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readFile } = await import("@tauri-apps/plugin-fs");
    const selected = await open({
      multiple: false,
      filters: [{ name: "Gambar", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });
    if (!selected || Array.isArray(selected)) return null;
    const bytes = await readFile(selected);
    const name = selected.split(/[/\\]/).pop() ?? "upload.png";
    const type = name.endsWith(".png")
      ? "image/png"
      : name.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return new File([bytes], name, { type });
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}
