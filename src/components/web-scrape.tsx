"use client";

import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { HighlightedCode } from "@/components/highlighted-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateLootFromHtml } from "@/lib/loot";
import { getStoredItems } from "@/lib/store";
import { fetchLootHtml } from "@/lib/wiki-api";
import type { Item } from "@/lib/types";

export const WebScrape = () => {
  const [mobName, setMobName] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mappedItems, setMappedItems] = useState<Item[]>([]);

  const hasMobName = mobName.trim().length > 0;

  useEffect(() => {
    const loadItems = async () => {
      const items = await getStoredItems();
      setMappedItems(items);
    };

    void loadItems();
  }, []);

  const handleScrape = async () => {
    if (!hasMobName) {
      setError("Monster name is required");
      setResult("");
      return;
    }

    setIsLoading(true);
    setError("");
    setCopied(false);

    try {
      const html = await fetchLootHtml(mobName);
      const loot = generateLootFromHtml(html, mappedItems);
      setResult(loot);
    } catch (scrapeError) {
      const message =
        scrapeError instanceof Error
          ? scrapeError.message
          : "Failed to generate loot";
      setError(message);
      setResult("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleScrape();
  };

  return (
    <div className="not-prose space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="mob_name">Monster name</Label>
          <Input
            id="mob_name"
            name="mob_name"
            value={mobName}
            onChange={(event) => {
              setMobName(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Mob name from Tibia Wiki"
            required
            aria-invalid={!hasMobName && Boolean(error)}
          />
        </div>

        <Button type="submit" disabled={!hasMobName || isLoading}>
          {isLoading ? "Generating..." : "Generate loot"}
        </Button>
      </form>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {result ? (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 z-10"
            onClick={handleCopyCode}
            aria-label="Copy generated loot"
          >
            {copied ? (
              <CheckCircle2 className="size-5 text-green-400" />
            ) : (
              <ClipboardCopy className="size-5" />
            )}
          </Button>

          <HighlightedCode code={result} className="mt-10" />
        </div>
      ) : null}
    </div>
  );
};
