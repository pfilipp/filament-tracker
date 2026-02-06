"use client";

import { useState, useRef, useEffect } from "react";

interface BrandSelectProps {
  value: string;
  brands: string[];
  onBrandChange: (brand: string) => void;
  onAddBrand: (name: string) => void;
  includeAll?: boolean;
}

const ADD_NEW_SENTINEL = "__add_new__";

export function BrandSelect({
  value,
  brands,
  onBrandChange,
  onAddBrand,
  includeAll,
}: BrandSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSelectChange = (val: string) => {
    if (val === ADD_NEW_SENTINEL) {
      setIsAdding(true);
      setNewBrand("");
    } else {
      onBrandChange(val);
    }
  };

  const handleConfirm = () => {
    const trimmed = newBrand.trim();
    if (trimmed) {
      onAddBrand(trimmed);
      onBrandChange(trimmed);
    }
    setIsAdding(false);
    setNewBrand("");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewBrand("");
  };

  if (isAdding) {
    return (
      <div className="flex gap-1">
        <input
          ref={inputRef}
          type="text"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Brand name..."
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!newBrand.trim()}
          className="rounded-lg bg-zinc-900 px-2.5 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-zinc-300 px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => handleSelectChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
    >
      {includeAll && <option value="all">All Brands</option>}
      {brands.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
      <option value={ADD_NEW_SENTINEL}>+ Add new...</option>
    </select>
  );
}
