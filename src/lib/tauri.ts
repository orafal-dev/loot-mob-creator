export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export type FetchOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
};

const DEFAULT_USER_AGENT =
  "LootMobCreator/1.0 (+https://github.com/orafal-dev/loot-mob-creator)";

export const minimizeApp = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().minimize();
};

export const maximizeApp = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().toggleMaximize();
};

export const closeApp = async (): Promise<void> => {
  if (!isTauri()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().close();
};

export const fetchUrl = async (
  url: string,
  options: FetchOptions = {},
): Promise<string> => {
  const method = options.method ?? "GET";
  const headers = {
    "User-Agent": DEFAULT_USER_AGENT,
    ...options.headers,
  };

  if (isTauri()) {
    const { fetch } = await import("@tauri-apps/plugin-http");
    const response = await fetch(url, {
      method,
      headers,
      body: options.body,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}): ${url}`);
    }

    return await response.text();
  }

  const response = await globalThis.fetch(url, {
    method,
    headers,
    body: options.body,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }

  return await response.text();
};

export const openExternal = async (url: string): Promise<void> => {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};
