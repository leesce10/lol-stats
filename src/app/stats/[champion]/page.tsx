"use client";

import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { externalStats, EXTERNAL_DATA_INFO, ExternalChampionStats } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { POSITION_LABELS } from "@/types";
import PositionIcon from "@/components/PositionIcon";
import { getChampionGuide, ChampionGuide } from "@/data/champion-guides";
import { parseRuneString, getRuneIconUrl, getRuneStyleIconUrl, RUNE_TREES } from "@/data/rune-icons";

type Tab = "overview" | "guide" | "matchup" | "build";

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

// ===== 탭별 컴포넌트 =====

function OverviewTab({ champData, guide, fpScoreRounded }: {
  champData: ExternalChampionStats;
  guide: ChampionGuide | undefined;
  fpScoreRounded: number;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 한 줄 핵심 (가이드 있을 때) */}
      {guide && (
        <div className="glass-card p-4 sm:p-5 border-l-4 border-[var(--accent-blue)]">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">💡</span>
            <h2 className="text-sm sm:text-base font-bold">핵심 한 줄</h2>
          </div>
          <p className="text-sm sm:text-base text-[var(--text-primary)]">{guide.oneLine}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
            <span>난이도: {"★".repeat(guide.difficulty)}{"☆".repeat(5 - guide.difficulty)}</span>
            <span>딜 타입: {guide.damageType}</span>
          </div>
        </div>
      )}

      {/* 장점/단점 */}
      {guide && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-bold mb-3 text-green-400">강점</h3>
            <ul className="space-y-1.5">
              {guide.strengths.map((s, i) => (
                <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                  <span className="text-green-400 shrink-0">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-bold mb-3 text-red-400">약점</h3>
            <ul className="space-y-1.5">
              {guide.weaknesses.map((w, i) => (
                <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                  <span className="text-red-400 shrink-0">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 선픽 점수 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-3">선픽 점수</h2>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
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
              <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{fpScoreRounded}</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-1">
            <p>{fpScoreRounded >= 7 ? "선픽하기 좋은 챔피언입니다." : fpScoreRounded >= 4 ? "상황에 따라 선픽 가능합니다." : "카운터를 확인하고 후픽을 권장합니다."}</p>
            <p className="text-[10px] text-[var(--text-muted)]">· 승률과 밴률을 종합하여 산출</p>
          </div>
        </div>
      </div>

      {/* 가이드 없는 경우 안내 */}
      {!guide && (
        <div className="glass-card p-6 text-center text-sm text-[var(--text-muted)]">
          이 챔피언의 상세 공략 가이드는 준비 중입니다.
        </div>
      )}
    </div>
  );
}

function GuideTab({ guide }: { guide: ChampionGuide }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 콤보 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
          <span>🎯</span> 핵심 콤보
        </h2>
        <div className="space-y-2.5">
          {guide.combos.map((c, i) => (
            <div key={i} className="bg-[var(--bg-tertiary)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[var(--accent-blue)]">{c.name}</span>
                <code className="text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--text-primary)]">{c.sequence}</code>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">{c.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 시간대별 운영 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
          <span>⏱️</span> 시간대별 운영
        </h2>
        <div className="space-y-4">
          <div>
            <div className="text-xs sm:text-sm font-bold text-yellow-400 mb-2">🌅 라인전 (1~14분)</div>
            <ul className="space-y-1">
              {guide.earlyGame.map((e, i) => (
                <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0">•</span>
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
                  <span className="text-[var(--text-muted)] shrink-0">•</span>
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
                  <span className="text-[var(--text-muted)] shrink-0">•</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 실전 팁 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
          <span>📝</span> 실전 팁
        </h2>
        <ul className="space-y-1.5">
          {guide.tips.map((t, i) => (
            <li key={i} className="text-xs sm:text-sm text-[var(--text-secondary)] flex gap-2">
              <span className="text-[var(--accent-blue)] shrink-0">▸</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MatchupTab({ champData, guide }: { champData: ExternalChampionStats; guide: ChampionGuide | undefined }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 통계 카운터/이지매치업 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-bold mb-1 text-red-400">카운터 챔피언</h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-3">{champData.nameKr}이(가) 약한 상대</p>
          <div className="space-y-2">
            {champData.counters.map((counter) => (
              <div key={counter.name} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-[var(--border-color)] shrink-0">
                  <Image src={getChampionImageUrl(counter.name)} alt={counter.nameKr} width={36} height={36} className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs sm:text-sm text-[var(--text-primary)] truncate">{counter.nameKr}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{counter.games.toLocaleString()}경기</div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-red-400">{counter.winRate.toFixed(1)}%</div>
                  <WinRateDiff winRate={counter.winRate} baseWinRate={champData.winRate} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-bold mb-1 text-green-400">상대하기 쉬운 챔피언</h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-3">{champData.nameKr}이(가) 강한 상대</p>
          <div className="space-y-2">
            {champData.easyMatchups.map((easy) => (
              <div key={easy.name} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-[var(--border-color)] shrink-0">
                  <Image src={getChampionImageUrl(easy.name)} alt={easy.nameKr} width={36} height={36} className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs sm:text-sm text-[var(--text-primary)] truncate">{easy.nameKr}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{easy.games.toLocaleString()}경기</div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-green-400">{easy.winRate.toFixed(1)}%</div>
                  <WinRateDiff winRate={easy.winRate} baseWinRate={champData.winRate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 가이드의 강한 상대/약한 상대 */}
      {guide && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-bold mb-2 text-green-400">유리한 상대 (요약)</h3>
            <div className="flex flex-wrap gap-1.5">
              {guide.goodAgainst.map((name, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-300">{name}</span>
              ))}
            </div>
          </div>
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-bold mb-2 text-red-400">불리한 상대 (요약)</h3>
            <div className="flex flex-wrap gap-1.5">
              {guide.badAgainst.map((name, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-300">{name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 룬 아이콘 1개 (텍스트 없이 아이콘만, 호버 시 이름 표시) */
function RuneIcon({ name, size, isActive, isKeystone }: { name: string; size: number; isActive: boolean; isKeystone: boolean }) {
  const url = getRuneIconUrl(name);
  return (
    <div className="relative group flex items-center justify-center" style={{ width: size, height: size }}>
      {url ? (
        <Image
          src={url}
          alt={name}
          width={size}
          height={size}
          className={`rounded-full ${
            isActive
              ? isKeystone ? "ring-2 ring-[var(--accent-gold)]" : ""
              : "brightness-[0.25] grayscale"
          }`}
          unoptimized
        />
      ) : (
        <div
          className={`rounded-full bg-[var(--bg-hover)] ${isActive ? "" : "opacity-25"}`}
          style={{ width: size, height: size }}
        />
      )}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
        <span className="text-[9px] text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">{name}</span>
      </div>
    </div>
  );
}

/** 룬 트리 한 행 */
function RuneTreeRow({ runes, selected, isKeystone }: { runes: string[]; selected: Set<string>; isKeystone: boolean }) {
  const size = isKeystone ? 34 : 28;
  return (
    <div className="flex items-center justify-center gap-1.5">
      {runes.map((name) => (
        <RuneIcon key={name} name={name} size={size} isActive={selected.has(name)} isKeystone={isKeystone} />
      ))}
    </div>
  );
}

/** 주 룬 트리 */
function PrimaryRuneTree({ runeString }: { runeString: string }) {
  const { style, runes: selectedRunes } = parseRuneString(runeString);
  const tree = RUNE_TREES[style];
  const styleIcon = getRuneStyleIconUrl(style);
  const selected = new Set(selectedRunes);

  if (!tree) return <div className="text-xs text-[var(--text-muted)]">{runeString}</div>;

  return (
    <div className="flex flex-col items-center gap-2.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
      {styleIcon && <Image src={styleIcon} alt={style} width={28} height={28} unoptimized />}
      <div className="w-10 h-px bg-[var(--border-color)]" />
      <RuneTreeRow runes={tree.rows[0]} selected={selected} isKeystone />
      <div className="w-6 h-px bg-[var(--border-color)]" />
      {tree.rows.slice(1).map((row, i) => (
        <RuneTreeRow key={i} runes={row} selected={selected} isKeystone={false} />
      ))}
    </div>
  );
}

/** 보조 룬 트리 */
function SecondaryRuneTree({ runeString }: { runeString: string }) {
  const { style, runes: selectedRunes } = parseRuneString(runeString);
  const tree = RUNE_TREES[style];
  const styleIcon = getRuneStyleIconUrl(style);
  const selected = new Set(selectedRunes);

  if (!tree) return <div className="text-xs text-[var(--text-muted)]">{runeString}</div>;

  return (
    <div className="flex flex-col items-center gap-2.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
      {styleIcon && <Image src={styleIcon} alt={style} width={28} height={28} unoptimized />}
      <div className="w-10 h-px bg-[var(--border-color)]" />
      {tree.rows.slice(1).map((row, i) => (
        <RuneTreeRow key={i} runes={row} selected={selected} isKeystone={false} />
      ))}
    </div>
  );
}

function BuildTab({ guide }: { guide: ChampionGuide }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 룬 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-4">추천 룬</h2>
        <div className="grid grid-cols-2 gap-3">
          <PrimaryRuneTree runeString={guide.recommendedRunes.primary} />
          <SecondaryRuneTree runeString={guide.recommendedRunes.secondary} />
        </div>
        <div className="text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)] mt-4">
          {guide.recommendedRunes.note}
        </div>
      </div>

      {/* 아이템 */}
      <div className="glass-card p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
          <span>🛒</span> 추천 아이템
        </h2>
        <div className="space-y-3 text-xs sm:text-sm">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">코어 빌드</div>
            <div className="flex flex-wrap items-center gap-2">
              {guide.recommendedItems.core.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs">{item}</span>
                  {i < guide.recommendedItems.core.length - 1 && <span className="text-[var(--text-muted)]">→</span>}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">상황별 아이템</div>
            <div className="flex flex-wrap gap-1.5">
              {guide.recommendedItems.situational.map((item, i) => (
                <span key={i} className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 출처 영상 */}
      {guide.sources.length > 0 && (
        <div className="glass-card p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
            <span>📺</span> 참고 강의 영상
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-3">
            아래 강의 영상들을 종합하여 정리한 가이드입니다.
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
                  <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] line-clamp-2">
                    {s.title}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                    {s.channel} · {s.duration}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 메인 페이지 =====

export default function ChampionDetailPage({ params }: { params: Promise<{ champion: string }> }) {
  const { champion } = use(params);
  const slug = champion.toLowerCase();
  const searchParams = useSearchParams();
  const posFromUrl = searchParams.get("position");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // 이 챔피언의 모든 포지션 데이터
  const allPositionData = externalStats.filter(
    (s) => s.name.toLowerCase().replace(/[\s']/g, "-") === slug
  );

  // 기본 포지션: URL 쿼리 > 게임수 최다
  const defaultData = (posFromUrl
    ? allPositionData.find(s => s.position === posFromUrl)
    : null
  ) ?? (allPositionData.length > 0
    ? allPositionData.reduce((best, cur) => cur.games > best.games ? cur : best)
    : null);

  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // 선택된 포지션 또는 기본 포지션의 데이터
  const champData = selectedPosition
    ? allPositionData.find(s => s.position === selectedPosition) ?? defaultData
    : defaultData;

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

  // 라인별 게임수 비율 계산
  const totalGames = allPositionData.reduce((sum, s) => sum + s.games, 0);
  const positionRates = allPositionData
    .map(s => ({
      position: s.position,
      rate: Math.round((s.games / totalGames) * 100),
      data: s,
    }))
    .sort((a, b) => b.rate - a.rate);

  const guide = getChampionGuide(champData.name);

  // 선픽 점수
  const wrScore = (champData.winRate - 48) * 1.5;
  const banPenalty = champData.banRate * 0.15;
  const pickBonus = Math.min(champData.pickRate * 0.1, 1);
  const fpScore = Math.min(10, Math.max(0, wrScore - banPenalty + pickBonus + 3));
  const fpScoreRounded = Math.round(fpScore * 10) / 10;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "개요", icon: "📊" },
    { key: "guide", label: "공략", icon: "📖" },
    { key: "matchup", label: "매치업", icon: "⚔️" },
    { key: "build", label: "빌드", icon: "🛒" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
      {/* Back link */}
      <Link href="/stats" className="inline-flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3">
        ← 챔피언 통계
      </Link>

      {/* Sticky 헤더 영역 (이미지 + 통계 + 탭) */}
      <div className="sticky top-12 sm:top-14 z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 pt-2 pb-3 bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        {/* Champion header (compact) */}
        <div className="glass-card p-3 sm:p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-xl border-2 border-[var(--accent-blue)] shrink-0">
              <Image
                src={getChampionImageUrl(champData.name)}
                alt={champData.nameKr}
                width={56}
                height={56}
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{champData.nameKr}</h1>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                  <PositionIcon position={champData.position} size={14} />
                  {POSITION_LABELS[champData.position]}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] sm:text-xs">
                <span className="text-[var(--text-muted)]">승률 <span className={`font-bold ${getWinRateColor(champData.winRate)}`}>{champData.winRate.toFixed(1)}%</span></span>
                <span className="text-[var(--text-muted)]">픽률 <span className="font-bold text-[var(--text-primary)]">{champData.pickRate.toFixed(1)}%</span></span>
                <span className="text-[var(--text-muted)]">밴률 <span className="font-bold text-[var(--text-primary)]">{champData.banRate.toFixed(1)}%</span></span>
              </div>
            </div>
          </div>

          {/* 라인 선택 탭 (op.gg 스타일) */}
          {positionRates.length > 1 && (
            <div className="flex gap-1 mt-2">
              {positionRates.map((pr) => {
                const isActive = (selectedPosition ?? champData.position) === pr.position;
                return (
                  <button
                    key={pr.position}
                    onClick={() => setSelectedPosition(pr.position)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-[var(--accent-blue)] text-white"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <PositionIcon position={pr.position} size={14} className={isActive ? "brightness-200" : "opacity-70"} />
                    <span>{POSITION_LABELS[pr.position]}</span>
                    <span className={`text-[9px] ${isActive ? "text-blue-200" : "text-[var(--text-muted)]"}`}>
                      {pr.rate}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 glass-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--accent-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Warning banner (작게) */}
      <div className="mb-4 mt-2 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 text-[10px]">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="animate-fade-in">
        {activeTab === "overview" && (
          <OverviewTab champData={champData} guide={guide} fpScoreRounded={fpScoreRounded} />
        )}
        {activeTab === "guide" && (
          guide ? <GuideTab guide={guide} /> : (
            <div className="glass-card p-6 text-center text-sm text-[var(--text-muted)]">
              이 챔피언의 공략은 준비 중입니다.
            </div>
          )
        )}
        {activeTab === "matchup" && (
          <MatchupTab champData={champData} guide={guide} />
        )}
        {activeTab === "build" && (
          guide ? <BuildTab guide={guide} /> : (
            <div className="glass-card p-6 text-center text-sm text-[var(--text-muted)]">
              이 챔피언의 빌드 정보는 준비 중입니다.
            </div>
          )
        )}
      </div>

      {/* Data source */}
      <div className="text-center text-[10px] text-[var(--text-muted)] py-6">
        {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.lastUpdated}
      </div>
    </div>
  );
}
