import itemsData from "@/lib/items.json";
import type { CatalogItem } from "@/lib/types";

type ItemsJson = {
  items: Array<{
    id: string;
    name: string;
  }>;
};

const parsed = itemsData as ItemsJson;

export const catalogItems: CatalogItem[] = parsed.items
  .map((item) => ({
    id: Number(item.id),
    name: item.name,
  }))
  .filter((item) => item.id > 0 && item.name.length > 0);

export const catalogItemNames = catalogItems.map((item) => item.name);

export const getCatalogItemByIndex = (index: number): CatalogItem | undefined =>
  catalogItems[index];
