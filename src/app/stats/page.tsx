"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { Position, POSITION_LABELS } from "@/types";
import PositionIcon from "@/components/PositionIcon";

type SortKey = "tier" | "winRate" | "pickRate" | "banRate" | "name";

const positions: (Position | "all")[] = ["all", "top", "jungle", "mid", "adc", "support"];

function getWinRateColor(wr: number): string {
  if (wr >= 53) return "var(--accent-blue)";
  if (wr >= 51) return "var(--accent-green)";
  if (wr >= 49) return "var(--text-primary)";
  if (wr >= 47) return "var(--accent-gold)";
  return "var(--accent-red)";
}

function getTierStyle(tier: number): { bg: string; text: string } {
  switch (tier) {
    case 1: return { bg: "bg-blue-500/20 border-blue-500/40", text: "text-blue-400" };
    case 2: return { bg: "bg-green-500/20 border-green-500/40", text: "text-green-400" };
    case 3: return { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-400" };
    case 4: return { bg: "bg-orange-500/20 border-orange-500/40", text: "text-orange-400" };
    default: return { bg: "bg-gray-500/20 border-gray-500/40", text: "text-gray-400" };
  }
}

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

export default function StatsPage() {
  const [positionFilter, setPositionFilter] = useState<Position | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("tier");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStats = useMemo(() => {
    let list = externalStats;
    if (positionFilter !== "all") {
      list = list.filter((s) => s.position === positionFilter);
    } else {
      // 전체 보기: 챔프당 메인 라인(게임수 최다) 하나만 표시
      const best = new Map<string, typeof list[number]>();
      for (const s of list) {
        const existing = best.get(s.name);
        if (!existing || s.games > existing.games) {
          best.set(s.name, s);
        }
      }
      list = Array.from(best.values());
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

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => handleSort(k)}
        className={`text-[11px] sm:text-xs ${active ? "text-[var(--accent-blue)] font-bold" : "text-[var(--text-muted)]"}`}
      >
        {label}{active && (sortDir === "asc" ? " ↑" : " ↓")}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-3">
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
          return (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {pos === "all" ? (
                <span className="text-sm">ALL</span>
              ) : (
                <PositionIcon position={pos} size={14} className={isActive ? "brightness-200" : "opacity-70"} />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-3 relative">
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

      {/* Column header */}
      <div className="flex items-center px-2.5 py-1.5 border-b border-[var(--border-color)] mb-0.5">
        <div className="w-6 shrink-0" />
        <div className="w-8 shrink-0" />
        <div className="flex-1 min-w-0 pl-2">
          <SortBtn k="name" label="챔피언" />
        </div>
        <div className="w-14 text-center shrink-0">
          <SortBtn k="tier" label="티어" />
        </div>
        <div className="w-16 text-right shrink-0">
          <SortBtn k="winRate" label="승률" />
        </div>
        <div className="w-14 text-right shrink-0">
          <SortBtn k="pickRate" label="픽률" />
        </div>
        <div className="w-14 text-right shrink-0 hidden xs:block">
          <SortBtn k="banRate" label="밴률" />
        </div>
      </div>

      {/* Champion list */}
      <div>
        {filteredStats.map((champ, index) => {
          const tierStyle = getTierStyle(champ.tier);
          return (
            <Link
              key={champ.name + champ.position}
              href={`/stats/${champ.name.toLowerCase().replace(/[\s']/g, "-")}`}
              className="flex items-center px-2.5 py-2 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)]/30"
            >
              {/* Rank */}
              <span className="w-6 shrink-0 text-[11px] text-[var(--text-muted)] text-right font-mono pr-1">
                {index + 1}
              </span>

              {/* Image */}
              <div className="w-8 h-8 shrink-0 relative overflow-hidden rounded-md border border-[var(--border-color)]">
                <Image src={getChampionImageUrl(champ.name)} alt={champ.nameKr} width={32} height={32} className="object-cover" unoptimized />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0 pl-2">
                <div className="text-xs font-medium text-[var(--text-primary)] truncate">{champ.nameKr}</div>
                <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                  <PositionIcon position={champ.position} size={10} className="opacity-60" />
                  {POSITION_LABELS[champ.position]}
                </div>
              </div>

              {/* Tier badge */}
              <div className="w-14 shrink-0 flex justify-center">
                <span className={`inline-flex h-5 px-2 items-center justify-center rounded text-[10px] font-bold border ${tierStyle.bg} ${tierStyle.text}`}>
                  {champ.tier} tier
                </span>
              </div>

              {/* Win rate */}
              <div className="w-16 shrink-0 text-right">
                <span className="text-xs font-bold" style={{ color: getWinRateColor(champ.winRate) }}>
                  {champ.winRate.toFixed(1)}%
                </span>
              </div>

              {/* Pick rate */}
              <div className="w-14 shrink-0 text-right">
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {champ.pickRate.toFixed(1)}%
                </span>
              </div>

              {/* Ban rate */}
              <div className="w-14 shrink-0 text-right hidden xs:block">
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {champ.banRate.toFixed(1)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
