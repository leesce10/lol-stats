"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { Position, POSITION_LABELS, POSITION_ICONS } from "@/types";

type SortKey = "tier" | "winRate" | "pickRate" | "banRate" | "name";
type SortDir = "asc" | "desc";

const positions: (Position | "all")[] = ["all", "top", "jungle", "mid", "adc", "support"];

function getWinRateColor(wr: number): string {
  if (wr >= 53) return "var(--accent-blue)";
  if (wr >= 51) return "var(--accent-green)";
  if (wr >= 49) return "var(--text-primary)";
  if (wr >= 47) return "var(--accent-gold)";
  return "var(--accent-red)";
}

function getTierColor(tier: number): string {
  switch (tier) {
    case 1: return "text-blue-400";
    case 2: return "text-green-400";
    case 3: return "text-yellow-400";
    case 4: return "text-orange-400";
    default: return "text-gray-400";
  }
}

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

export default function StatsPage() {
  const [positionFilter, setPositionFilter] = useState<Position | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("tier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStats = useMemo(() => {
    let list = externalStats;
    if (positionFilter !== "all") {
      list = list.filter((s) => s.position === positionFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.nameKr.includes(q) || s.name.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "tier": cmp = a.tier - b.tier || b.winRate - a.winRate; break;
        case "name": cmp = a.nameKr.localeCompare(b.nameKr); break;
        case "winRate": cmp = a.winRate - b.winRate; break;
        case "pickRate": cmp = a.pickRate - b.pickRate; break;
        case "banRate": cmp = a.banRate - b.banRate; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [positionFilter, sortKey, sortDir, searchQuery]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "tier" || key === "name" ? "asc" : "desc");
    }
  }

  // 정렬 라벨
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "tier", label: "티어순" },
    { key: "winRate", label: "승률순" },
    { key: "pickRate", label: "픽률순" },
    { key: "banRate", label: "밴률순" },
    { key: "name", label: "이름순" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1">챔피언 통계</h1>
        <p className="text-[var(--text-secondary)] text-[11px] sm:text-sm">
          {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {(EXTERNAL_DATA_INFO.totalSamples / 10000).toFixed(0)}만경기
        </p>
      </div>

      {/* Warning */}
      <div className="mb-3 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-[11px]">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Position filter */}
      <div className="mb-3 flex items-center gap-1 overflow-x-auto pb-1">
        {positions.map((pos) => {
          const isActive = positionFilter === pos;
          const label = pos === "all" ? "전체" : POSITION_LABELS[pos];
          const icon = pos === "all" ? "🎮" : POSITION_ICONS[pos];
          return (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Search + sort */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="챔피언 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="champion-search w-full px-3 py-1.5 pl-8 text-xs sm:text-sm"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-0.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`px-2 py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors ${
                sortKey === opt.key
                  ? "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table header - desktop */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-[11px] text-[var(--text-muted)] font-medium border-b border-[var(--border-color)] mb-1">
        <span className="w-5 text-right">#</span>
        <span className="w-10" />
        <span className="flex-1">챔피언</span>
        <span className="w-14 text-center">티어</span>
        <span className="w-16 text-right">승률</span>
        <span className="w-14 text-right">픽률</span>
        <span className="w-14 text-right">밴률</span>
      </div>

      {/* Champion list */}
      <div className="space-y-0.5">
        {filteredStats.map((champ, index) => (
          <Link
            key={champ.name + champ.position}
            href={`/stats/${champ.name.toLowerCase().replace(/[\s']/g, "-")}`}
            className="flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            {/* Rank */}
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] w-4 sm:w-5 text-right font-mono shrink-0">
              {index + 1}
            </span>

            {/* Champion image */}
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-md border border-[var(--border-color)] shrink-0">
              <Image
                src={getChampionImageUrl(champ.name)}
                alt={champ.nameKr}
                width={36}
                height={36}
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Name + position - compact */}
            <div className="w-16 sm:w-auto sm:flex-1 shrink-0">
              <div className="font-medium text-xs sm:text-sm text-[var(--text-primary)] truncate">{champ.nameKr}</div>
              <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">{POSITION_LABELS[champ.position]}</div>
            </div>

            {/* Tier */}
            <span className={`shrink-0 w-6 text-center text-xs sm:text-sm font-bold ${getTierColor(champ.tier)}`}>
              {champ.tier}
            </span>

            {/* Win rate */}
            <div className="w-14 sm:w-16 text-right shrink-0">
              <span className="text-xs sm:text-sm font-bold" style={{ color: getWinRateColor(champ.winRate) }}>
                {champ.winRate.toFixed(1)}%
              </span>
            </div>

            {/* Pick rate */}
            <div className="w-12 sm:w-14 text-right shrink-0">
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                {champ.pickRate.toFixed(1)}%
              </span>
            </div>

            {/* Ban rate - hidden on tiny screens */}
            <div className="hidden xs:block w-12 sm:w-14 text-right shrink-0">
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                {champ.banRate.toFixed(1)}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
