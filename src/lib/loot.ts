import type { Item, LootAverage, LootItemData } from "@/lib/types";

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
    const rows = table.querySelectorAll("tbody>tr");

    for (let i = 1; i < rows.length; i += 1) {
      const columns = rows[i].querySelectorAll("td");
      if (!columns.length) {
        continue;
      }

      const name = columns[2]?.textContent?.trim() ?? "";
      const amountMinMax = columns[1]?.textContent?.trim().split("-") ?? [];
      const amountMin = amountMinMax[0] ?? "1";
      const amountMax = amountMinMax[1] ?? amountMin;
      const percentage = parseFloat(
        (columns[5]?.textContent?.trim() ?? "0").replace("%", ""),
      );
      const killsToGetOne = parseFloat(columns[6]?.textContent?.trim() ?? "0");

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

      itemData[name].totalMin += parseInt(amountMin, 10) || 1;
      itemData[name].totalMax += parseInt(amountMax, 10) || 1;
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
