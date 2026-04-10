"use client";

import { useState } from "react";
import Image from "next/image";
import ChampionSelect from "@/components/ChampionSelect";
import PositionFilter from "@/components/PositionFilter";
import { calculateMatchup } from "@/lib/matchup";
import { getChampionById, getChampionImageUrl } from "@/data/champions";
import { Position, MatchupResult } from "@/types";

function PhaseCard({
  phase,
  label,
  data,
}: {
  phase: string;
  label: string;
  data: { advantage: string; description: string };
}) {
  const colorClass =
    data.advantage === "strong"
      ? "phase-strong"
      : data.advantage === "weak"
      ? "phase-weak"
      : "phase-even";

  const advLabel =
    data.advantage === "strong"
      ? "유리"
      : data.advantage === "weak"
      ? "불리"
      : "균형";

  const bgClass =
    data.advantage === "strong"
      ? "border-green-500/30 bg-green-500/5"
      : data.advantage === "weak"
      ? "border-red-500/30 bg-red-500/5"
      : "border-yellow-500/30 bg-yellow-500/5";

  return (
    <div className={`rounded-xl border p-4 ${bgClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        <span className={`text-sm font-bold ${colorClass}`}>{advLabel}</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {data.description}
      </p>
    </div>
  );
}

export default function MatchupPage() {
  const [position, setPosition] = useState<Position | "all">("mid");
  const [myChampId, setMyChampId] = useState<string | null>(null);
  const [enemyChampId, setEnemyChampId] = useState<string | null>(null);

  const activePosition = position === "all" ? undefined : position;
  const result: MatchupResult | null =
    myChampId && enemyChampId && activePosition
      ? calculateMatchup(myChampId, enemyChampId, activePosition)
      : null;

  const myChamp = myChampId ? getChampionById(myChampId) : null;
  const enemyChamp = enemyChampId ? getChampionById(enemyChampId) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">맞라인 분석</h1>
        <p className="text-[var(--text-secondary)]">
          내 챔피언과 상대 챔피언을 선택하면 매치업 분석과 플레이 가이드를
          제공합니다.
        </p>
      </div>

      {/* Position select */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
          포지션 선택
        </label>
        <PositionFilter
          selected={position}
          onChange={(p) => {
            setPosition(p);
            setMyChampId(null);
            setEnemyChampId(null);
          }}
        />
      </div>

      {/* Champion selection */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6">
          <ChampionSelect
            label="내 챔피언"
            selectedId={myChampId}
            onSelect={setMyChampId}
            position={activePosition}
            excludeIds={enemyChampId ? [enemyChampId] : []}
          />

          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-[var(--text-muted)]">VS</div>
          </div>

          <ChampionSelect
            label="상대 챔피언"
            selectedId={enemyChampId}
            onSelect={setEnemyChampId}
            position={activePosition}
            excludeIds={myChampId ? [myChampId] : []}
          />
        </div>
      </div>

      {/* Result */}
      {result && myChamp && enemyChamp && (
        <div className="space-y-6 animate-fade-in">
          {/* Win rate display */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-blue-500">
                  <Image
                    src={getChampionImageUrl(myChamp.id)}
                    alt={myChamp.name}
                    width={56}
                    height={56}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="font-bold text-lg">{myChamp.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {myChamp.nameEn}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-bold text-lg text-right">
                    {enemyChamp.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] text-right">
                    {enemyChamp.nameEn}
                  </div>
                </div>
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-red-500">
                  <Image
                    src={getChampionImageUrl(enemyChamp.id)}
                    alt={enemyChamp.name}
                    width={56}
                    height={56}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Win rate bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span
                  className="font-bold"
                  style={{
                    color:
                      result.winRate >= 50
                        ? "var(--accent-blue)"
                        : "var(--text-secondary)",
                  }}
                >
                  {result.winRate.toFixed(1)}%
                </span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      result.winRate < 50
                        ? "var(--accent-red)"
                        : "var(--text-secondary)",
                  }}
                >
                  {(100 - result.winRate).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${result.winRate}%`,
                    background:
                      result.winRate >= 50
                        ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                        : "linear-gradient(90deg, #6b7280, #9ca3af)",
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${100 - result.winRate}%`,
                    background:
                      result.winRate < 50
                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                        : "linear-gradient(90deg, #6b7280, #9ca3af)",
                  }}
                />
              </div>
            </div>

            {/* Overall advantage */}
            <div className="text-center mt-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                  result.laneAdvantage === "strong"
                    ? "bg-green-500/15 text-green-400"
                    : result.laneAdvantage === "weak"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-yellow-500/15 text-yellow-400"
                }`}
              >
                {result.laneAdvantage === "strong"
                  ? `${myChamp.name} 유리한 매치업`
                  : result.laneAdvantage === "weak"
                  ? `${enemyChamp.name} 유리한 매치업`
                  : "균형 잡힌 매치업"}
              </span>
            </div>
          </div>

          {/* Phase analysis */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              구간별 분석
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PhaseCard
                phase="early"
                label="🌅 초반 (Lv 1~6)"
                data={result.phases.early}
              />
              <PhaseCard
                phase="mid"
                label="☀️ 중반 (Lv 7~13)"
                data={result.phases.mid}
              />
              <PhaseCard
                phase="late"
                label="🌙 후반 (Lv 14+)"
                data={result.phases.late}
              />
            </div>
          </div>

          {/* Key points */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              핵심 포인트
            </h2>
            <ul className="space-y-2">
              {result.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                >
                  <span className="text-[var(--accent-blue)] mt-0.5">●</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              플레이 가이드
            </h2>
            <div className="space-y-3">
              {result.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-xs font-bold text-[var(--accent-blue)]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">⚔️</div>
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">
            챔피언을 선택해주세요
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            포지션을 선택한 후, 내 챔피언과 상대 챔피언을 선택하면
            <br />
            매치업 분석 결과를 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
