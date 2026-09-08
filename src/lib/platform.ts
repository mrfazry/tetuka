/** Detect whether the app is running inside a Tauri webview. */
export async function isTauri(): Promise<boolean> {
  try {
    const { isTauri: check } = await import("@tauri-apps/api/core");
    return check();
  } catch {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  }
}
