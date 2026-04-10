"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO, ExternalChampionStats } from "@/data/external-stats";
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

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="text-[var(--text-muted)] ml-1">↕</span>;
    return <span className="text-[var(--accent-blue)] ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">챔피언 통계</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.totalSamples.toLocaleString()}경기 기준
        </p>
      </div>

      {/* Warning */}
      <div className="mb-5 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs">
        <span className="mt-0.5">&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Position filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          {positions.map((pos) => {
            const isActive = positionFilter === pos;
            const label = pos === "all" ? "전체" : POSITION_LABELS[pos];
            const icon = pos === "all" ? "🎮" : POSITION_ICONS[pos];
            return (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="챔피언 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="champion-search w-full sm:w-56 px-4 py-2 pl-9 text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="stats-table w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="px-4 py-3" onClick={() => handleSort("name")}>
                  챔피언 <SortIcon column="name" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("winRate")}>
                  승률 <SortIcon column="winRate" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("pickRate")}>
                  픽률 <SortIcon column="pickRate" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("banRate")}>
                  밴률 <SortIcon column="banRate" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("games")}>
                  게임 수 <SortIcon column="games" />
                </th>
                <th className="px-4 py-3 text-center">티어</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((champ, index) => (
                <tr key={champ.name + champ.position} className="glass-card-hover cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/stats/${champ.name.toLowerCase().replace(/[\s']/g, "-")}`} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] w-5 text-right font-mono">{index + 1}</span>
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border-color)]">
                        <Image
                          src={getChampionImageUrl(champ.name)}
                          alt={champ.nameKr}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{champ.nameKr}</div>
                        <div className="text-xs text-[var(--text-muted)]">{POSITION_LABELS[champ.position]}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold" style={{ color: getWinRateColor(champ.winRate) }}>
                      {champ.winRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {champ.pickRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {champ.banRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)] font-mono text-xs">
                    {champ.games.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex h-6 w-14 items-center justify-center rounded-full text-xs font-bold border ${getTierBg(champ.tier)}`}>
                      Tier {champ.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
