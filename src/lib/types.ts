export type Item = {
  name: string;
  id: number | null;
};

export type CatalogItem = {
  name: string;
  id: number;
};

export type LootItemData = {
  totalMin: number;
  totalMax: number;
  totalPercentage: number;
  totalKills: number;
  count: number;
};

export type LootAverage = {
  name: string;
  averageMin: number;
  averageMax: number;
  chance: number;
  averageKills: number;
};
