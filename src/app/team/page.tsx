"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ChampionSelect from "@/components/ChampionSelect";
import { analyzeTeamComp } from "@/lib/teamcomp";
import { getChampionById, getChampionImageUrl } from "@/data/champions";
import { Position, POSITION_LABELS, POSITION_ICONS, TeamCompResult } from "@/types";

const POSITIONS: Position[] = ["top", "jungle", "mid", "adc", "support"];

function TeamSlot({
  position,
  championId,
  onSelect,
  teamColor,
  allSelectedIds,
}: {
  position: Position;
  championId: string | null;
  onSelect: (id: string) => void;
  teamColor: "blue" | "red";
  allSelectedIds: string[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
          teamColor === "blue" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
        }`}
      >
        {POSITION_ICONS[position]}
      </div>
      <div className="flex-1">
        <ChampionSelect
          label={POSITION_LABELS[position]}
          selectedId={championId}
          onSelect={onSelect}
          position={position}
          excludeIds={allSelectedIds.filter((id) => id !== championId)}
        />
      </div>
    </div>
  );
}

function WinRateGauge({ blueRate, redRate }: { blueRate: number; redRate: number }) {
  return (
    <div className="text-center">
      <div className="flex items-end justify-center gap-8 mb-4">
        <div>
          <div
            className="text-4xl font-bold"
            style={{
              color: blueRate >= redRate ? "var(--accent-blue)" : "var(--text-muted)",
            }}
          >
            {blueRate.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-400 mt-1">블루팀</div>
        </div>
        <div className="text-2xl text-[var(--text-muted)] font-bold pb-1">VS</div>
        <div>
          <div
            className="text-4xl font-bold"
            style={{
              color: redRate >= blueRate ? "var(--accent-red)" : "var(--text-muted)",
            }}
          >
            {redRate.toFixed(1)}%
          </div>
          <div className="text-xs text-red-400 mt-1">레드팀</div>
        </div>
      </div>

      {/* Win rate bar */}
      <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex mx-auto max-w-md">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${blueRate}%`,
            background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
          }}
        />
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${redRate}%`,
            background: "linear-gradient(90deg, #ef4444, #f87171)",
          }}
        />
      </div>
    </div>
  );
}

function TeamAnalysisCard({
  team,
  color,
  strengths,
  weaknesses,
}: {
  team: string;
  color: "blue" | "red";
  strengths: string[];
  weaknesses: string[];
}) {
  const borderColor = color === "blue" ? "border-blue-500/30" : "border-red-500/30";
  const titleColor = color === "blue" ? "text-blue-400" : "text-red-400";

  return (
    <div className={`glass-card p-5 border-l-4 ${borderColor}`}>
      <h3 className={`font-bold mb-4 ${titleColor}`}>{team}</h3>

      {strengths.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
            강점
          </div>
          <div className="space-y-1.5">
            {strengths.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-green-400"
              >
                <span>+</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div>
          <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
            약점
          </div>
          <div className="space-y-1.5">
            {weaknesses.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-red-400"
              >
                <span>-</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const [blueTeam, setBlueTeam] = useState<Record<Position, string | null>>({
    top: null,
    jungle: null,
    mid: null,
    adc: null,
    support: null,
  });

  const [redTeam, setRedTeam] = useState<Record<Position, string | null>>({
    top: null,
    jungle: null,
    mid: null,
    adc: null,
    support: null,
  });

  const allSelectedIds = [
    ...Object.values(blueTeam),
    ...Object.values(redTeam),
  ].filter(Boolean) as string[];

  const blueTeamIds = Object.values(blueTeam).filter(Boolean) as string[];
  const redTeamIds = Object.values(redTeam).filter(Boolean) as string[];

  const canAnalyze = blueTeamIds.length === 5 && redTeamIds.length === 5;

  const result: TeamCompResult | null = useMemo(() => {
    if (!canAnalyze) return null;
    return analyzeTeamComp(blueTeamIds, redTeamIds);
  }, [canAnalyze, blueTeamIds.join(","), redTeamIds.join(",")]);

  function handleReset() {
    setBlueTeam({ top: null, jungle: null, mid: null, adc: null, support: null });
    setRedTeam({ top: null, jungle: null, mid: null, adc: null, support: null });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">조합 분석기</h1>
          <p className="text-[var(--text-secondary)]">
            양 팀의 챔피언을 모두 선택하면 조합 승률을 예측합니다.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          초기화
        </button>
      </div>

      {/* Team selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Blue team */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h2 className="text-lg font-bold text-blue-400">블루팀 (아군)</h2>
          </div>
          <div className="space-y-4">
            {POSITIONS.map((pos) => (
              <TeamSlot
                key={`blue-${pos}`}
                position={pos}
                championId={blueTeam[pos]}
                onSelect={(id) =>
                  setBlueTeam((prev) => ({ ...prev, [pos]: id }))
                }
                teamColor="blue"
                allSelectedIds={allSelectedIds}
              />
            ))}
          </div>
        </div>

        {/* Red team */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <h2 className="text-lg font-bold text-red-400">레드팀 (상대)</h2>
          </div>
          <div className="space-y-4">
            {POSITIONS.map((pos) => (
              <TeamSlot
                key={`red-${pos}`}
                position={pos}
                championId={redTeam[pos]}
                onSelect={(id) =>
                  setRedTeam((prev) => ({ ...prev, [pos]: id }))
                }
                teamColor="red"
                allSelectedIds={allSelectedIds}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {!canAnalyze && (
        <div className="glass-card p-8 text-center mb-8">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
            양 팀의 챔피언을 모두 선택해주세요
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            블루팀 {blueTeamIds.length}/5 | 레드팀 {redTeamIds.length}/5
          </p>
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{
                  width: `${((blueTeamIds.length + redTeamIds.length) / 10) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analysis result */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Win rate gauge */}
          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-center mb-6 text-[var(--text-primary)]">
              조합 승률 예측
            </h2>
            <WinRateGauge
              blueRate={result.blueWinRate}
              redRate={result.redWinRate}
            />
          </div>

          {/* Team analysis cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamAnalysisCard
              team="블루팀 분석"
              color="blue"
              strengths={result.blueStrengths}
              weaknesses={result.blueWeaknesses}
            />
            <TeamAnalysisCard
              team="레드팀 분석"
              color="red"
              strengths={result.redStrengths}
              weaknesses={result.redWeaknesses}
            />
          </div>

          {/* Overall analysis */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
              종합 분석
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {result.analysis}
            </p>
          </div>

          {/* Team preview */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              팀 구성 미리보기
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Blue team lineup */}
              <div>
                <div className="text-xs font-medium text-blue-400 mb-3">블루팀</div>
                <div className="flex gap-2">
                  {POSITIONS.map((pos) => {
                    const id = blueTeam[pos];
                    const champ = id ? getChampionById(id) : null;
                    return (
                      <div key={pos} className="flex flex-col items-center gap-1">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-blue-500/50">
                          {champ && (
                            <Image
                              src={getChampionImageUrl(champ.id)}
                              alt={champ.name}
                              width={48}
                              height={48}
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {champ?.name ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Red team lineup */}
              <div>
                <div className="text-xs font-medium text-red-400 mb-3">레드팀</div>
                <div className="flex gap-2">
                  {POSITIONS.map((pos) => {
                    const id = redTeam[pos];
                    const champ = id ? getChampionById(id) : null;
                    return (
                      <div key={pos} className="flex flex-col items-center gap-1">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-red-500/50">
                          {champ && (
                            <Image
                              src={getChampionImageUrl(champ.id)}
                              alt={champ.name}
                              width={48}
                              height={48}
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {champ?.name ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
