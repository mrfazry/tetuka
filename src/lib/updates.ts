import { isTauri } from "./platform";

export type UpdateCheckResult =
  | { status: "skipped" }
  | { status: "upToDate" }
  | { status: "updated"; version: string }
  | { status: "error"; message: string };

/**
 * Check GitHub Releases for a newer build.
 * When an update is available, download, install, and relaunch.
 * Background (non-interactive) failures return quietly as `error` without throwing.
 */
export async function checkForUpdates(options?: {
  interactive?: boolean;
}): Promise<UpdateCheckResult> {
  const interactive = options?.interactive ?? false;
  if (!(await isTauri())) {
    return { status: "skipped" };
  }

  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const { relaunch } = await import("@tauri-apps/plugin-process");
    const update = await check();
    if (!update) {
      return { status: "upToDate" };
    }
    await update.downloadAndInstall();
    await relaunch();
    return { status: "updated", version: update.version };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (interactive) {
      console.error(err);
    }
    return { status: "error", message };
  }
}
