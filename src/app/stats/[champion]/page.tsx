"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { POSITION_LABELS, POSITION_ICONS } from "@/types";
import { getChampionGuide } from "@/data/champion-guides";

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

  // 챔피언 공략 가이드 (있는 경우만)
  const guide = getChampionGuide(champData.name);

  // 선픽 점수: 승률 높을수록 +, 밴률 높을수록 - (카운터 많다는 의미), 픽률 적당하면 +
  const wrScore = (champData.winRate - 48) * 1.5; // -3 ~ +7.5
  const banPenalty = champData.banRate * 0.15; // 밴률 높으면 감점 (카운터 취약)
  const pickBonus = Math.min(champData.pickRate * 0.1, 1); // 픽률 적당하면 소폭 가점
  const fpScore = Math.min(10, Math.max(0, wrScore - banPenalty + pickBonus + 3));
  const fpScoreRounded = Math.round(fpScore * 10) / 10;

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8">
      {/* Back link */}
      <Link href="/stats" className="inline-flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 sm:mb-6">
        ← 챔피언 통계
      </Link>

      {/* Warning */}
      <div className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-[11px]">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Champion header */}
      <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border-2 border-[var(--accent-blue)] shrink-0">
            <Image
              src={getChampionImageUrl(champData.name)}
              alt={champData.nameKr}
              width={80}
              height={80}
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{champData.nameKr}</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">{champData.name}</p>
            <div className="flex items-center gap-1.5 sm:gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs sm:text-sm bg-[var(--bg-tertiary)] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
                {POSITION_ICONS[champData.position]} {POSITION_LABELS[champData.position]}
              </span>
              {otherPositions.map((op) => (
                <span key={op.position} className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg opacity-60">
                  {POSITION_ICONS[op.position]} {POSITION_LABELS[op.position]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-0.5">게임 수</div>
            <div className="text-sm sm:text-lg font-bold text-[var(--text-primary)]">{(champData.games / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-0.5">승률</div>
            <div className={`text-sm sm:text-lg font-bold ${getWinRateColor(champData.winRate)}`}>{champData.winRate.toFixed(1)}%</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-0.5">픽률</div>
            <div className="text-sm sm:text-lg font-bold text-[var(--text-primary)]">{champData.pickRate.toFixed(1)}%</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-0.5">밴률</div>
            <div className="text-sm sm:text-lg font-bold text-[var(--text-primary)]">{champData.banRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* FP Score */}
      <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">선픽 점수</h2>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0">
            <svg className="h-20 w-20 sm:h-24 sm:w-24 -rotate-90" viewBox="0 0 100 100">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Hard matchups - counters */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-red-400">카운터 챔피언</h2>
          <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mb-3">{champData.nameKr}이(가) 약한 상대</p>
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
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-green-400">상대하기 쉬운 챔피언</h2>
          <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mb-3">{champData.nameKr}이(가) 강한 상대</p>
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

      {/* 챔피언 공략 가이드 */}
      {guide && (
        <div className="space-y-4 sm:space-y-6 mb-6">
          {/* 한 줄 핵심 */}
          <div className="glass-card p-4 sm:p-6 border-l-4 border-[var(--accent-blue)]">
            <h2 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2">
              <span>💡</span> 핵심 한 줄
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-primary)]">{guide.oneLine}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
              <span>난이도: {"★".repeat(guide.difficulty)}{"☆".repeat(5 - guide.difficulty)}</span>
              <span>딜 타입: {guide.damageType}</span>
            </div>
          </div>

          {/* 장점/단점 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold mb-3 text-green-400">강점</h3>
              <ul className="space-y-1.5">
                {guide.strengths.map((s, i) => (
                  <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                    <span className="text-green-400">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold mb-3 text-red-400">약점</h3>
              <ul className="space-y-1.5">
                {guide.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                    <span className="text-red-400">-</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 콤보 */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-3">🎯 핵심 콤보</h2>
            <div className="space-y-3">
              {guide.combos.map((c, i) => (
                <div key={i} className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[var(--accent-blue)]">{c.name}</span>
                    <code className="text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--text-primary)]">{c.sequence}</code>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 시간대별 운영 */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-4">⏱️ 시간대별 운영</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-yellow-400 mb-2">🌅 라인전 (1~14분)</div>
                <ul className="space-y-1">
                  {guide.earlyGame.map((e, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                      <span className="text-[var(--text-muted)]">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-orange-400 mb-2">⚔️ 중반 (14~25분)</div>
                <ul className="space-y-1">
                  {guide.midGame.map((m, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                      <span className="text-[var(--text-muted)]">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-purple-400 mb-2">🏆 후반 (25분+)</div>
                <ul className="space-y-1">
                  {guide.lateGame.map((l, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                      <span className="text-[var(--text-muted)]">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 실전 팁 */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-3">📝 실전 팁</h2>
            <ul className="space-y-1.5">
              {guide.tips.map((t, i) => (
                <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                  <span className="text-[var(--accent-blue)]">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 룬 + 아이템 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold mb-3">🌀 추천 룬</h3>
              <div className="text-xs sm:text-sm space-y-1">
                <div><span className="text-[var(--text-muted)]">주룬:</span> {guide.recommendedRunes.primary}</div>
                <div><span className="text-[var(--text-muted)]">부룬:</span> {guide.recommendedRunes.secondary}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-2">{guide.recommendedRunes.note}</div>
              </div>
            </div>
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold mb-3">🛒 추천 아이템</h3>
              <div className="text-xs sm:text-sm space-y-1.5">
                <div>
                  <span className="text-[var(--text-muted)]">코어:</span>{" "}
                  {guide.recommendedItems.core.join(" → ")}
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">상황별:</span>{" "}
                  {guide.recommendedItems.situational.join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* 출처 영상 */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
              <span>📺</span> 참고 강의 영상
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              아래 강의 영상들을 종합하여 정리한 가이드입니다. 자세한 내용은 영상을 직접 확인하세요.
            </p>
            <div className="space-y-2">
              {guide.sources.map((s) => (
                <a
                  key={s.videoId}
                  href={`https://www.youtube.com/watch?v=${s.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <div className="relative w-20 h-12 overflow-hidden rounded shrink-0 bg-[var(--bg-tertiary)]">
                    <Image
                      src={`https://i.ytimg.com/vi/${s.videoId}/mqdefault.jpg`}
                      alt={s.title}
                      width={80}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                      {s.title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                      {s.channel} · {s.duration} · {s.viewCount}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data source */}
      <div className="text-center text-xs text-[var(--text-muted)] py-4">
        {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.lastUpdated}
      </div>
    </div>
  );
}
