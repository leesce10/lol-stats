"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { champions, generateChampionStats, getChampionImageUrl, DDRAGON_VERSION } from "@/data/champions";
import { ChampionStats, Position, POSITION_LABELS } from "@/types";
import { RealChampionStats } from "@/lib/stats-calculator";
import PositionFilter from "./PositionFilter";

type SortKey = "name" | "winRate" | "pickRate" | "banRate" | "games" | "tier" | "fpScore";
type SortDir = "asc" | "desc";

interface ChampionRow {
  id: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  position: Position;
  stats: {
    winRate: number;
    pickRate: number;
    banRate: number;
    games: number;
    tier: 1 | 2 | 3 | 4 | 5;
    fpScore: number;
  };
}

function getTierLabel(tier: number): string {
  return `Tier ${tier}`;
}

function getFpColor(score: number): string {
  if (score >= 8) return "var(--accent-blue)";
  if (score >= 6) return "var(--accent-green)";
  if (score >= 4) return "var(--accent-gold)";
  return "var(--accent-red)";
}

function getWinRateColor(wr: number): string {
  if (wr >= 53) return "var(--accent-blue)";
  if (wr >= 51) return "var(--accent-green)";
  if (wr >= 49) return "var(--text-primary)";
  if (wr >= 47) return "var(--accent-gold)";
  return "var(--accent-red)";
}

// Riot API championName → 우리 챔피언 데이터 매핑
function findChampionByApiName(apiName: string) {
  return champions.find(
    (c) => c.id === apiName || c.nameEn.replace(/['\s]/g, "") === apiName
  );
}

export default function ChampionTable() {
  const [positionFilter, setPositionFilter] = useState<Position | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("tier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [realStats, setRealStats] = useState<RealChampionStats[] | null>(null);
  const [dataInfo, setDataInfo] = useState<{
    totalMatches: number;
    lastUpdated: string | null;
  } | null>(null);

  // 실제 데이터 로드 시도
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats && data.stats.length > 0) {
          setRealStats(data.stats);
          setDataInfo({
            totalMatches: data.totalMatches,
            lastUpdated: data.lastUpdated,
          });
        }
      })
      .catch(() => {
        // 실패 시 생성 데이터 사용
      });
  }, []);

  const generatedStats = useMemo(() => generateChampionStats(), []);

  const rows: ChampionRow[] = useMemo(() => {
    const result: ChampionRow[] = [];

    if (realStats && realStats.length > 0) {
      // 실제 데이터 사용
      for (const stat of realStats) {
        const champ = findChampionByApiName(stat.championName);
        if (positionFilter !== "all" && stat.position !== positionFilter) continue;

        const displayName = champ?.name ?? stat.championName;
        const displayNameEn = champ?.nameEn ?? stat.championName;
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${stat.championName}.png`;

        const query = searchQuery.toLowerCase();
        if (
          query &&
          !displayName.toLowerCase().includes(query) &&
          !displayNameEn.toLowerCase().includes(query) &&
          !stat.championName.toLowerCase().includes(query)
        ) {
          continue;
        }

        result.push({
          id: stat.championName,
          name: displayName,
          nameEn: displayNameEn,
          imageUrl,
          position: stat.position,
          stats: {
            winRate: stat.winRate,
            pickRate: stat.pickRate,
            banRate: stat.banRate,
            games: stat.games,
            tier: stat.tier,
            fpScore: stat.fpScore,
          },
        });
      }
    } else {
      // 생성 데이터 폴백
      for (const stat of generatedStats) {
        const champ = champions.find((c) => c.id === stat.championId);
        if (!champ) continue;
        if (positionFilter !== "all" && stat.position !== positionFilter) continue;

        const query = searchQuery.toLowerCase();
        if (
          query &&
          !champ.name.toLowerCase().includes(query) &&
          !champ.nameEn.toLowerCase().includes(query)
        ) {
          continue;
        }

        result.push({
          id: champ.id,
          name: champ.name,
          nameEn: champ.nameEn,
          imageUrl: getChampionImageUrl(champ.id),
          position: stat.position,
          stats: {
            winRate: stat.winRate,
            pickRate: stat.pickRate,
            banRate: stat.banRate,
            games: stat.games,
            tier: stat.tier,
            fpScore: stat.fpScore,
          },
        });
      }
    }
    return result;
  }, [realStats, generatedStats, positionFilter, searchQuery]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "winRate":
          cmp = a.stats.winRate - b.stats.winRate;
          break;
        case "pickRate":
          cmp = a.stats.pickRate - b.stats.pickRate;
          break;
        case "banRate":
          cmp = a.stats.banRate - b.stats.banRate;
          break;
        case "games":
          cmp = a.stats.games - b.stats.games;
          break;
        case "tier":
          cmp = a.stats.tier - b.stats.tier || b.stats.winRate - a.stats.winRate;
          break;
        case "fpScore":
          cmp = a.stats.fpScore - b.stats.fpScore;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "tier" ? "asc" : "desc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="text-[var(--text-muted)] ml-1">↕</span>;
    return <span className="text-[var(--accent-blue)] ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="animate-fade-in">
      {/* Warning banner */}
      <div className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm">
        <span className="mt-0.5">&#9888;&#65039;</span>
        <div>
          <span className="text-yellow-400 font-medium">임시 데이터</span>
          <span className="text-[var(--text-muted)]">
            {dataInfo && dataInfo.totalMatches > 0
              ? ` · 챌린저 ${dataInfo.totalMatches}경기 수집 — 샘플이 적어 통계 신뢰도가 낮습니다. 참고용으로만 활용하세요.`
              : " · 시뮬레이션 데이터입니다. 실제 게임 통계가 아닙니다."}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PositionFilter selected={positionFilter} onChange={setPositionFilter} />
        <div className="relative">
          <input
            type="text"
            placeholder="챔피언 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="champion-search w-full sm:w-64 px-4 py-2 pl-10 text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-4 text-sm text-[var(--text-secondary)]">
        총 <span className="font-semibold text-[var(--text-primary)]">{sortedRows.length}</span>개
        챔피언
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="stats-table w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3" onClick={() => handleSort("name")}>
                  챔피언 <SortIcon column="name" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("winRate")}>
                  승률 <SortIcon column="winRate" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("pickRate")}>
                  픽률 <SortIcon column="pickRate" />
                </th>
                <th className="px-4 py-3 text-right" onClick={() => handleSort("games")}>
                  게임 수 <SortIcon column="games" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, index) => (
                <tr key={row.id + row.position} className="animate-fade-in">
                  <td className="px-4 py-3 text-center text-[var(--text-muted)] font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border-color)]">
                        <Image
                          src={row.imageUrl}
                          alt={row.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {row.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {POSITION_LABELS[row.position]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="font-semibold"
                      style={{ color: getWinRateColor(row.stats.winRate) }}
                    >
                      {row.stats.winRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {row.stats.pickRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)] font-mono text-xs">
                    {row.stats.games.toLocaleString()}
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
