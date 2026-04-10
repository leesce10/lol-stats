"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { champions, getChampionImageUrl } from "@/data/champions";
import { Position, ChampionData } from "@/types";

interface ChampionSelectProps {
  label: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  position?: Position;
  excludeIds?: string[];
}

export default function ChampionSelect({
  label,
  selectedId,
  onSelect,
  position,
  excludeIds = [],
}: ChampionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredChampions = useMemo(() => {
    let list = champions;
    if (position) {
      list = list.filter((c) => c.positions.includes(position));
    }
    list = list.filter((c) => !excludeIds.includes(c.id));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [position, excludeIds, search]);

  const selectedChamp = selectedId
    ? champions.find((c) => c.id === selectedId)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>

      {/* Selected champion display / trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center gap-3 w-full glass-card px-4 py-3 text-left hover:border-[var(--accent-blue)] transition-colors"
      >
        {selectedChamp ? (
          <>
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border-color)]">
              <Image
                src={getChampionImageUrl(selectedChamp.id)}
                alt={selectedChamp.name}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {selectedChamp.name}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {selectedChamp.nameEn}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <div className="h-10 w-10 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center">
              <span className="text-lg">+</span>
            </div>
            <span className="text-sm">챔피언 선택</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 glass-card shadow-xl shadow-black/50 animate-fade-in overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)]">
            <input
              type="text"
              placeholder="챔피언 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="champion-search w-full px-3 py-2 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {filteredChampions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() => {
                    onSelect(champ.id);
                    setIsOpen(false);
                  }}
                  className="champion-grid-item p-1 flex flex-col items-center"
                  title={champ.name}
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                    <Image
                      src={getChampionImageUrl(champ.id)}
                      alt={champ.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate w-full text-center">
                    {champ.name}
                  </span>
                </button>
              ))}
            </div>
            {filteredChampions.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">
                결과가 없습니다
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
