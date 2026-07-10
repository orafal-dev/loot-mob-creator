"use client";

import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  catalogItemNames,
  getCatalogItemByIndex,
} from "@/lib/items-data";
import type { CatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type SearchItemProps = {
  onSelectItem: (item: CatalogItem) => void;
};

export const SearchItem = ({ onSelectItem }: SearchItemProps) => {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(catalogItemNames, {
        threshold: 0.3,
      }),
    [],
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return fuse
      .search(query, { limit: 5 })
      .map((result) => getCatalogItemByIndex(result.refIndex))
      .filter((item): item is CatalogItem => Boolean(item?.id && item?.name));
  }, [fuse, query]);

  const handleSelectItem = (item: CatalogItem) => {
    onSelectItem(item);
    setQuery("");
  };

  return (
    <div>
      <Label htmlFor="item-search">Search</Label>
      <Input
        id="item-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search item..."
        className="mt-2"
      />

      {results.length > 0 ? (
        <div className="mt-2 space-y-1">
          {results.map((item) => (
            <button
              key={`${item.id}-${item.name}`}
              type="button"
              onClick={() => handleSelectItem(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-zinc-700 px-2 py-2 text-left transition hover:bg-white/5",
              )}
            >
              <div className="relative size-10 overflow-hidden">
                <img
                  src={`https://item-images.ots.me/latest_otbr/${item.id}.png`}
                  alt=""
                  className="absolute -top-6 left-1"
                />
              </div>
              <span className="text-sm text-white">{item.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
