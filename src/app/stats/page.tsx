"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { Position, POSITION_LABELS, POSITION_ICONS } from "@/types";

type SortKey = "winRate" | "pickRate" | "banRate" | "games" | "name";
type SortDir = "asc" | "desc";

const positions: (Position | "all")[] = ["all", "top", "jungle", "mid", "adc", "support"];

function getWinRateColor(wr: number): string {
  if (wr >= 53) return "var(--accent-blue)";
  if (wr >= 51) return "var(--accent-green)";
  if (wr >= 49) return "var(--text-primary)";
  if (wr >= 47) return "var(--accent-gold)";
  return "var(--accent-red)";
}

function getTierBg(tier: number): string {
  switch (tier) {
    case 1: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case 2: return "bg-green-500/20 text-green-400 border-green-500/30";
    case 3: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case 4: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

export default function StatsPage() {
  const [positionFilter, setPositionFilter] = useState<Position | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("winRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
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
        case "name": cmp = a.nameKr.localeCompare(b.nameKr); break;
        case "winRate": cmp = a.winRate - b.winRate; break;
        case "pickRate": cmp = a.pickRate - b.pickRate; break;
        case "banRate": cmp = a.banRate - b.banRate; break;
        case "games": cmp = a.games - b.games; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [positionFilter, sortKey, sortDir, searchQuery]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1">챔피언 통계</h1>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
          {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {(EXTERNAL_DATA_INFO.totalSamples / 10000).toFixed(0)}만경기
        </p>
      </div>

      {/* Warning */}
      <div className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-[11px]">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Position filter + search */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
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

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="챔피언 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="champion-search w-full px-3 py-2 pl-8 text-sm"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Mobile sort */}
          <select
            value={sortKey}
            onChange={(e) => handleSort(e.target.value as SortKey)}
            className="sm:hidden champion-search px-2 py-2 text-xs"
          >
            <option value="winRate">승률순</option>
            <option value="pickRate">픽률순</option>
            <option value="banRate">밴률순</option>
            <option value="games">게임수순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </div>

      {/* Champion list */}
      <div className="space-y-1.5">
        {filteredStats.map((champ, index) => (
          <Link
            key={champ.name + champ.position}
            href={`/stats/${champ.name.toLowerCase().replace(/[\s']/g, "-")}`}
            className="flex items-center gap-2.5 glass-card glass-card-hover px-3 py-2.5 sm:px-4 sm:py-3"
          >
            {/* Rank */}
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] w-4 sm:w-5 text-right font-mono shrink-0">
              {index + 1}
            </span>

            {/* Champion image */}
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-lg border border-[var(--border-color)] shrink-0">
              <Image
                src={getChampionImageUrl(champ.name)}
                alt={champ.nameKr}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Name + position */}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-[var(--text-primary)] truncate">{champ.nameKr}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{POSITION_LABELS[champ.position]}</div>
            </div>

            {/* Stats - responsive grid */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Win rate - always visible */}
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold" style={{ color: getWinRateColor(champ.winRate) }}>
                  {champ.winRate.toFixed(1)}%
                </div>
                <div className="text-[9px] text-[var(--text-muted)] sm:hidden">승률</div>
              </div>

              {/* Pick/Ban rate - hidden on very small screens */}
              <div className="hidden xs:flex gap-2 sm:gap-4">
                <div className="text-right">
                  <div className="text-xs text-[var(--text-secondary)]">{champ.pickRate.toFixed(1)}%</div>
                  <div className="text-[9px] text-[var(--text-muted)]">픽률</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--text-secondary)]">{champ.banRate.toFixed(1)}%</div>
                  <div className="text-[9px] text-[var(--text-muted)]">밴률</div>
                </div>
              </div>

              {/* Games - hidden on mobile */}
              <div className="hidden sm:block text-right">
                <div className="text-xs text-[var(--text-secondary)] font-mono">{champ.games.toLocaleString()}</div>
                <div className="text-[9px] text-[var(--text-muted)]">게임</div>
              </div>

              {/* Tier badge */}
              <span className={`inline-flex h-5 sm:h-6 w-10 sm:w-12 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold border shrink-0 ${getTierBg(champ.tier)}`}>
                T{champ.tier}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
