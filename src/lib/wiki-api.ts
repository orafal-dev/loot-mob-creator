import { fetchUrl } from "@/lib/tauri";
import type { WikiParseResponse, WikiQueryResponse } from "@/lib/wiki-api.types";

const WIKI_API_URL = "https://tibia.fandom.com/api.php";

const buildLootStatisticsPage = (mobName: string): string =>
  `Loot_Statistics:${mobName.trim()}`;

const hasLootTableInHtml = (html: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.querySelectorAll(".loot_list").length > 0;
};

const parseApiResponse = (responseText: string): WikiParseResponse => {
  const data = JSON.parse(responseText) as WikiParseResponse;

  if (data.error) {
    throw new Error(data.error.info);
  }

  return data;
};

const extractParsedHtml = (data: WikiParseResponse, mobName: string): string => {
  const html = data.parse?.text?.["*"];

  if (!html) {
    throw new Error(`No loot data found for "${mobName}"`);
  }

  if (!hasLootTableInHtml(html)) {
    throw new Error(`No loot table found for "${mobName}"`);
  }

  return html;
};

const buildApiUrl = (params: Record<string, string>): string => {
  const searchParams = new URLSearchParams({
    format: "json",
    origin: "*",
    ...params,
  });

  return `${WIKI_API_URL}?${searchParams.toString()}`;
};

export const fetchLootHtmlViaApi = async (mobName: string): Promise<string> => {
  const page = buildLootStatisticsPage(mobName);
  const url = buildApiUrl({
    action: "parse",
    page,
    prop: "text",
  });

  const responseText = await fetchUrl(url);
  const data = parseApiResponse(responseText);

  return extractParsedHtml(data, mobName);
};

const fetchWikitextViaQuery = async (mobName: string): Promise<string> => {
  const page = buildLootStatisticsPage(mobName);
  const url = buildApiUrl({
    action: "query",
    titles: page,
    prop: "revisions",
    rvprop: "content",
    redirects: "1",
  });

  const responseText = await fetchUrl(url);
  const data = JSON.parse(responseText) as WikiQueryResponse;

  if (data.error) {
    throw new Error(data.error.info);
  }

  const pages = data.query?.pages ?? {};
  const pageData = Object.values(pages)[0];

  if (!pageData || pageData.missing !== undefined) {
    throw new Error(`Loot statistics page not found for "${mobName}"`);
  }

  const wikitext = pageData.revisions?.[0]?.["*"];

  if (!wikitext) {
    throw new Error(`No loot data found for "${mobName}"`);
  }

  return wikitext;
};

export const fetchLootHtmlViaQueryParse = async (
  mobName: string,
): Promise<string> => {
  const wikitext = await fetchWikitextViaQuery(mobName);
  const body = new URLSearchParams({
    action: "parse",
    text: wikitext,
    contentmodel: "wikitext",
    prop: "text",
    format: "json",
    origin: "*",
  });

  const responseText = await fetchUrl(WIKI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = parseApiResponse(responseText);

  return extractParsedHtml(data, mobName);
};

export const fetchLootHtml = async (mobName: string): Promise<string> => {
  try {
    return await fetchLootHtmlViaApi(mobName);
  } catch (primaryError) {
    try {
      return await fetchLootHtmlViaQueryParse(mobName);
    } catch (fallbackError) {
      const primaryMessage =
        primaryError instanceof Error ? primaryError.message : "Unknown error";
      const fallbackMessage =
        fallbackError instanceof Error ? fallbackError.message : "Unknown error";

      throw new Error(
        `Failed to fetch loot for "${mobName}" via Fandom API. ${primaryMessage}. Fallback: ${fallbackMessage}`,
      );
    }
  }
};
