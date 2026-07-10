import type { Item, LootAverage, LootItemData } from "@/lib/types";
import type { LootColumnMap } from "@/lib/loot.types";

const percentageToNumber = (percentage: number): number => {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  const maxNumber = 100_000;
  return Math.floor((percentage / 100) * maxNumber);
};

export const prettyFormatLua = (luaCode: string): string =>
  luaCode
    .replace(/{\s*name/g, "{ name")
    .replace(/{\s*id/g, "{ id")
    .replace(/},\s*{/g, "},\n    {")
    .replace(/},\s*}/g, "}\n}")
    .replace(/monster\.loot = \{\s*/g, "monster.loot = {\n    ")
    .replace(/,\s*\n    }/g, "\n}")
    .replace(/} -- (.*),{/g, (_match, name: string) => `}, -- ${name}\n    {`);

const findMappedItem = (items: Item[], name: string): Item | undefined =>
  items.find((item) => item.name.toLowerCase() === name.toLowerCase());

const normalizeHeaderLabel = (label: string): string =>
  label.replace(/\s+/g, " ").trim().toLowerCase();

const buildColumnMap = (headerRow: Element): LootColumnMap | null => {
  const headers = headerRow.querySelectorAll("th");
  const columnMap: Partial<LootColumnMap> = {};

  headers.forEach((header, index) => {
    const label = normalizeHeaderLabel(header.textContent ?? "");

    if (label.startsWith("amount")) {
      columnMap.amount = index;
      return;
    }

    if (label === "item") {
      columnMap.item = index;
      return;
    }

    if (label.startsWith("times")) {
      columnMap.times = index;
      return;
    }

    if (label.startsWith("percentage")) {
      columnMap.percentage = index;
      return;
    }

    if (label.includes("kills to get 1")) {
      columnMap.killsToGetOne = index;
    }
  });

  if (
    columnMap.amount === undefined ||
    columnMap.item === undefined ||
    columnMap.times === undefined
  ) {
    return null;
  }

  return columnMap as LootColumnMap;
};

const parseCaptionTotalSamples = (table: Element): number | null => {
  const caption = table.querySelector("caption")?.textContent ?? "";
  const normalizedCaption = caption.replace(/\s+/g, " ");

  const killsMatch = normalizedCaption.match(/([\d,]+)\s+kills/i);
  if (killsMatch) {
    return Number.parseInt(killsMatch[1].replace(/,/g, ""), 10);
  }

  const rewardChestsMatch = normalizedCaption.match(/([\d,]+)\s+reward chests/i);
  if (rewardChestsMatch) {
    return Number.parseInt(rewardChestsMatch[1].replace(/,/g, ""), 10);
  }

  return null;
};

const parseAmountRange = (text: string): { min: number; max: number } => {
  const trimmed = text.trim();

  if (!trimmed || trimmed === "-") {
    return { min: 1, max: 1 };
  }

  const [minText, maxText] = trimmed.split("-");
  const min = Number.parseInt(minText, 10) || 1;
  const max = Number.parseInt(maxText ?? minText, 10) || min;

  return { min, max };
};

const parsePercentage = (
  columns: NodeListOf<HTMLTableCellElement>,
  columnMap: LootColumnMap,
  totalSamples: number | null,
): number => {
  if (columnMap.percentage !== undefined) {
    const percentageText = columns[columnMap.percentage]?.textContent?.trim() ?? "0";
    return Number.parseFloat(percentageText.replace("%", "")) || 0;
  }

  if (!totalSamples) {
    return 0;
  }

  const times = Number.parseFloat(columns[columnMap.times]?.textContent?.trim() ?? "0");
  if (!times) {
    return 0;
  }

  return (times / totalSamples) * 100;
};

const parseKillsToGetOne = (
  columns: NodeListOf<HTMLTableCellElement>,
  columnMap: LootColumnMap,
  totalSamples: number | null,
  percentage: number,
): number => {
  if (columnMap.killsToGetOne !== undefined) {
    return Number.parseFloat(columns[columnMap.killsToGetOne]?.textContent?.trim() ?? "0");
  }

  const times = Number.parseFloat(columns[columnMap.times]?.textContent?.trim() ?? "0");
  if (times > 0 && totalSamples) {
    return totalSamples / times;
  }

  if (percentage > 0) {
    return 100 / percentage;
  }

  return 0;
};

export const generateLootFromHtml = (
  html: string,
  mappedItems: Item[],
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const itemData: Record<string, LootItemData> = {};

  const tables = doc.querySelectorAll(".loot_list");
  const tablesToProcess = Array.from(tables).slice(0, 1);

  tablesToProcess.forEach((table) => {
    const headerRow = table.querySelector("tbody>tr");
    if (!headerRow) {
      return;
    }

    const columnMap = buildColumnMap(headerRow);
    if (!columnMap) {
      return;
    }

    const totalSamples = parseCaptionTotalSamples(table);
    const rows = table.querySelectorAll("tbody>tr");

    for (let i = 1; i < rows.length; i += 1) {
      const columns = rows[i].querySelectorAll("td");
      if (!columns.length) {
        continue;
      }

      const name = columns[columnMap.item]?.textContent?.trim() ?? "";
      const { min: amountMin, max: amountMax } = parseAmountRange(
        columns[columnMap.amount]?.textContent ?? "",
      );
      const percentage = parsePercentage(columns, columnMap, totalSamples);
      const killsToGetOne = parseKillsToGetOne(
        columns,
        columnMap,
        totalSamples,
        percentage,
      );

      if (name === "Empty" || name === "!Empty") {
        continue;
      }

      if (!itemData[name]) {
        itemData[name] = {
          totalMin: 0,
          totalMax: 0,
          totalPercentage: 0,
          totalKills: 0,
          count: 0,
        };
      }

      itemData[name].totalMin += amountMin;
      itemData[name].totalMax += amountMax;
      itemData[name].totalPercentage += percentage;
      itemData[name].totalKills += killsToGetOne;
      itemData[name].count += 1;
    }
  });

  const averages: LootAverage[] = Object.entries(itemData).map(
    ([name, data]) => ({
      name,
      averageMin: Math.floor(data.totalMin / data.count),
      averageMax: Math.floor(data.totalMax / data.count),
      chance: percentageToNumber(data.totalPercentage / data.count),
      averageKills: data.totalKills / data.count,
    }),
  );

  const template = `monster.loot = {${averages.map((item) => {
    const mapped = findMappedItem(mappedItems, item.name);
    if (mapped?.id) {
      return `{ id = ${mapped.id}, chance = ${item.chance}, maxCount = ${item.averageMax} } -- ${item.name}`;
    }

    return `{ name = "${item.name}", chance = ${item.chance}, maxCount = ${item.averageMax} }`;
  })}\n}`;

  return prettyFormatLua(template);
};
