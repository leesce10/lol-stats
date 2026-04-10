"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { POSITION_LABELS, POSITION_ICONS } from "@/types";

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

function getWinRateColor(wr: number): string {
  if (wr >= 53) return "text-blue-400";
  if (wr >= 51) return "text-green-400";
  if (wr >= 49) return "text-[var(--text-primary)]";
  if (wr >= 47) return "text-yellow-400";
  return "text-red-400";
}

function WinRateDiff({ winRate, baseWinRate }: { winRate: number; baseWinRate: number }) {
  const diff = winRate - baseWinRate;
  const isPositive = diff > 0;
  return (
    <span className={`text-xs font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
      {isPositive ? "+" : ""}{diff.toFixed(1)}%
    </span>
  );
}

export default function ChampionDetailPage({ params }: { params: Promise<{ champion: string }> }) {
  const { champion } = use(params);
  const slug = champion.toLowerCase();

  // 슬러그로 챔피언 찾기
  const champData = externalStats.find(
    (s) => s.name.toLowerCase().replace(/[\s']/g, "-") === slug
  );

  if (!champData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">챔피언을 찾을 수 없습니다</h1>
        <p className="text-[var(--text-muted)] mb-6">요청하신 챔피언 데이터가 존재하지 않습니다.</p>
        <Link href="/stats" className="text-[var(--accent-blue)] hover:underline">← 챔피언 통계로 돌아가기</Link>
      </div>
    );
  }

  // 같은 챔피언의 다른 포지션 데이터
  const otherPositions = externalStats.filter(
    (s) => s.name === champData.name && s.position !== champData.position
  );

  const fpScore = Math.min(10, Math.max(0,
    (champData.winRate - 47) * 1.0 + (10 - champData.banRate * 0.3)
  ));
  const fpScoreRounded = Math.round(fpScore * 10) / 10;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link href="/stats" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
        ← 챔피언 통계
      </Link>

      {/* Warning */}
      <div className="mb-5 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Champion header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-[var(--accent-blue)]">
            <Image
              src={getChampionImageUrl(champData.name)}
              alt={champData.nameKr}
              width={80}
              height={80}
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{champData.nameKr}</h1>
            <p className="text-sm text-[var(--text-muted)]">{champData.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-lg">
                {POSITION_ICONS[champData.position]} {POSITION_LABELS[champData.position]}
              </span>
              {otherPositions.map((op) => (
                <span key={op.position} className="flex items-center gap-1 text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-lg opacity-60">
                  {POSITION_ICONS[op.position]} {POSITION_LABELS[op.position]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">게임 수</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">{champData.games.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">승률</div>
            <div className={`text-lg font-bold ${getWinRateColor(champData.winRate)}`}>{champData.winRate.toFixed(2)}%</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">픽률</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">{champData.pickRate.toFixed(2)}%</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">밴률</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">{champData.banRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* FP Score */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">선픽 점수</h2>
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="var(--bg-tertiary)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="42"
                stroke={fpScoreRounded >= 7 ? "#22c55e" : fpScoreRounded >= 4 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8" fill="none"
                strokeDasharray={`${(fpScoreRounded / 10) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{fpScoreRounded}</span>
            </div>
          </div>
          <div className="text-sm text-[var(--text-secondary)] space-y-1">
            <p>{fpScoreRounded >= 7 ? "선픽하기 좋은 챔피언입니다." : fpScoreRounded >= 4 ? "상황에 따라 선픽 가능합니다." : "카운터를 확인하고 후픽을 권장합니다."}</p>
            <p className="text-xs text-[var(--text-muted)]">· 승률과 밴률을 종합하여 산출</p>
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Hard matchups - counters */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 text-red-400">카운터 챔피언</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">{champData.nameKr}이(가) 약한 상대</p>
          <div className="space-y-3">
            {champData.counters.map((counter) => (
              <div key={counter.name} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border-color)]">
                  <Image
                    src={getChampionImageUrl(counter.name)}
                    alt={counter.nameKr}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-primary)]">{counter.nameKr}</div>
                  <div className="text-xs text-[var(--text-muted)]">{counter.games.toLocaleString()}경기</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-400">{counter.winRate.toFixed(1)}%</div>
                  <WinRateDiff winRate={counter.winRate} baseWinRate={champData.winRate} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Easy matchups */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 text-green-400">상대하기 쉬운 챔피언</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">{champData.nameKr}이(가) 강한 상대</p>
          <div className="space-y-3">
            {champData.easyMatchups.map((easy) => (
              <div key={easy.name} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border-color)]">
                  <Image
                    src={getChampionImageUrl(easy.name)}
                    alt={easy.nameKr}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-primary)]">{easy.nameKr}</div>
                  <div className="text-xs text-[var(--text-muted)]">{easy.games.toLocaleString()}경기</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">{easy.winRate.toFixed(1)}%</div>
                  <WinRateDiff winRate={easy.winRate} baseWinRate={champData.winRate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data source */}
      <div className="text-center text-xs text-[var(--text-muted)] py-4">
        {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.lastUpdated}
      </div>
    </div>
  );
}
