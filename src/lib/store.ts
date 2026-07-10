import type { Item } from "@/lib/types";
import { isTauri } from "@/lib/tauri";

const STORAGE_KEY = "items";

const getBrowserItems = (): Item[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Item[];
  } catch {
    return [];
  }
};

const setBrowserItems = (items: Item[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getStoredItems = async (): Promise<Item[]> => {
  if (isTauri()) {
    const { LazyStore } = await import("@tauri-apps/plugin-store");
    const store = new LazyStore("settings.json");
    const items = await store.get<Item[]>(STORAGE_KEY);
    return items ?? [];
  }

  return getBrowserItems();
};

export const setStoredItems = async (items: Item[]): Promise<void> => {
  if (isTauri()) {
    const { LazyStore } = await import("@tauri-apps/plugin-store");
    const store = new LazyStore("settings.json");
    await store.set(STORAGE_KEY, items);
    await store.save();
    return;
  }

  setBrowserItems(items);
};
