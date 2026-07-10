"use client";

import { useEffect, useState } from "react";
import { BackgroundGradient } from "@/components/background-gradient";
import { SearchItem } from "@/components/search-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStoredItems, setStoredItems } from "@/lib/store";
import type { CatalogItem, Item } from "@/lib/types";
import Image from "next/image";

const emptyItem = (): Item => ({
  name: "",
  id: null,
});

const parseItemId = (value: string): number | null => {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>(emptyItem());
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const storedItems = await getStoredItems();
      setItems(storedItems);
    };

    void load();
  }, []);

  const saveItems = async (nextItems: Item[]) => {
    await setStoredItems(nextItems);
    setItems(nextItems);
  };

  const handleAddItem = async () => {
    if (!newItem.name || newItem.id == null) {
      return;
    }

    const nextItems = [...items, newItem];
    await saveItems(nextItems);
    setNewItem(emptyItem());
  };

  const handleRemove = async (item: Item) => {
    const nextItems = items.filter((current) => current !== item);
    await saveItems(nextItems);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setItemToEdit(null);
    setEditingIndex(null);
  };

  const handleToggleEdit = (item: Item, index: number) => {
    setIsEditing(true);
    setItemToEdit({ ...item });
    setEditingIndex(index);
  };

  const handleSaveItem = async () => {
    if (!itemToEdit?.name || itemToEdit.id == null || editingIndex == null) {
      return;
    }

    const nextItems = items.map((item, index) =>
      index === editingIndex ? { ...itemToEdit } : item,
    );

    await saveItems(nextItems);
    handleCancelEdit();
  };

  const handleItemSelected = (item: CatalogItem) => {
    const selected = {
      id: item.id,
      name: item.name,
    };

    if (isEditing) {
      setItemToEdit(selected);
      return;
    }

    setNewItem(selected);
  };

  return (
    <BackgroundGradient className="text-white">
      <h1>Item mapping</h1>
      <p className="text-sm text-muted-foreground">This is a tool to help you map items to their IDs. It helps when there are multiple items with the same name. And so you can use the ID to identify the item properly.</p>

      <div className="not-prose mt-6 space-y-6">
        <SearchItem onSelectItem={handleItemSelected} />

        <p className="text-sm text-muted-foreground">Or add one manually</p>

        {isEditing && itemToEdit ? (
          <form
            className="flex flex-col gap-4 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSaveItem();
            }}
          >
            <Input
              value={itemToEdit.name}
              onChange={(event) =>
                setItemToEdit({ ...itemToEdit, name: event.target.value })
              }
              placeholder="Item name"
            />
            <Input
              type="number"
              value={itemToEdit.id ?? ""}
              onChange={(event) =>
                setItemToEdit({
                  ...itemToEdit,
                  id: parseItemId(event.target.value),
                })
              }
              placeholder="Item ID"
            />
            <Button type="submit" className="shrink-0">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAddItem();
            }}
          >
            <Input
              value={newItem.name}
              onChange={(event) =>
                setNewItem({ ...newItem, name: event.target.value })
              }
              placeholder="Item name"
            />
            <Input
              type="number"
              value={newItem.id ?? ""}
              onChange={(event) =>
                setNewItem({
                  ...newItem,
                  id: parseItemId(event.target.value),
                })
              }
              placeholder="Item ID"
            />
            <Button type="submit" className="shrink-0">
              Add item
            </Button>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Item ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={`${item.id}-${item.name}`}
                className={
                  editingIndex === index ? "bg-white/5" : undefined
                }
              >
                <TableCell>
                  <div className="inline-flex items-center gap-x-2">
                    <div className="relative size-8 overflow-hidden">
                      <Image
                        width={32}
                        height={32}
                        src={`https://item-images.ots.me/latest_otbr/${item.id}.png`}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-x-3">
                    <button
                      type="button"
                      onClick={() => void handleRemove(item)}
                      className="cursor-pointer text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEdit(item, index)}
                      className="cursor-pointer text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </BackgroundGradient>
  );
}
