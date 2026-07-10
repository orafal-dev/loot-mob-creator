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

const emptyItem = (): Item => ({
  name: "",
  id: null,
});

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>(emptyItem());
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

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
    if (!newItem.name || !newItem.id) {
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

  const handleToggleEdit = (item: Item) => {
    setIsEditing(true);
    setItemToEdit({ ...item });
  };

  const handleSaveItem = async () => {
    if (!itemToEdit?.name || !itemToEdit.id) {
      return;
    }

    const nextItems = items.map((item) =>
      item.id === itemToEdit.id ? { ...itemToEdit } : item,
    );

    await saveItems(nextItems);
    setIsEditing(false);
    setItemToEdit(null);
  };

  const handleItemSelected = (item: CatalogItem) => {
    setNewItem({
      id: item.id,
      name: item.name,
    });
  };

  return (
    <BackgroundGradient variant="green" className="text-white">
      <h1>Item mapping</h1>

      <div className="not-prose mt-6 space-y-6">
        <SearchItem onSelectItem={handleItemSelected} />

        <p className="text-sm text-muted-foreground">Or add one manually</p>

        <div className="flex flex-col gap-4 sm:flex-row">
          {isEditing && itemToEdit ? (
            <>
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
                    id: Number(event.target.value) || null,
                  })
                }
                placeholder="Item ID"
              />
              <Button className="shrink-0" onClick={() => void handleSaveItem()}>
                Save
              </Button>
            </>
          ) : (
            <>
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
                    id: Number(event.target.value) || null,
                  })
                }
                placeholder="Item ID"
              />
              <Button className="shrink-0" onClick={() => void handleAddItem()}>
                Add item
              </Button>
            </>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Item ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.id}-${item.name}`}>
                <TableCell>
                  <div className="inline-flex items-center gap-x-2">
                    <div className="relative size-10 overflow-hidden">
                      <img
                        src={`https://item-images.ots.me/latest_otbr/${item.id}.png`}
                        alt=""
                        className="absolute -top-6 left-1"
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
                      onClick={() => handleToggleEdit(item)}
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
