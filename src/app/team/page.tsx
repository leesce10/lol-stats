"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { externalStats, EXTERNAL_DATA_INFO, ExternalChampionStats } from "@/data/external-stats";
import { allChampions } from "@/data/all-champions";
import { DDRAGON_VERSION } from "@/data/champions";
import { Position, POSITION_LABELS, POSITION_ICONS } from "@/types";

const POSITIONS: Position[] = ["top", "jungle", "mid", "adc", "support"];

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

function TeamSlot({ position, selectedName, onSelect, allSelectedNames, teamColor }: {
  position: Position;
  selectedName: string | null;
  onSelect: (name: string) => void;
  allSelectedNames: string[];
  teamColor: "blue" | "red";
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const posChamps = externalStats.filter((s) => s.position === position);
  const filtered = posChamps.filter((c) => {
    if (allSelectedNames.includes(c.name) && c.name !== selectedName) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.nameKr.includes(q) || c.name.toLowerCase().includes(q);
  });

  const selected = selectedName ? posChamps.find((c) => c.name === selectedName) : null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
          teamColor === "blue" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
        }`}>
          {POSITION_ICONS[position]}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-2 glass-card px-3 py-2 text-left hover:border-[var(--accent-blue)] transition-colors text-sm"
        >
          {selected ? (
            <>
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src={getChampionImageUrl(selected.name)} alt={selected.nameKr} width={32} height={32} className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-medium text-xs">{selected.nameKr}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{selected.winRate}% 승률</div>
              </div>
            </>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">{POSITION_LABELS[position]} 선택</span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 glass-card shadow-xl shadow-black/50 animate-fade-in overflow-hidden">
          <div className="p-2 border-b border-[var(--border-color)]">
            <input type="text" placeholder="검색..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="champion-search w-full px-2 py-1 text-xs" autoFocus />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <div className="grid grid-cols-5 gap-1">
              {filtered.map((c) => (
                <button key={c.name} onClick={() => { onSelect(c.name); setIsOpen(false); setSearch(""); }}
                  className="champion-grid-item p-0.5 flex flex-col items-center" title={c.nameKr}>
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image src={getChampionImageUrl(c.name)} alt={c.nameKr} width={40} height={40} className="object-cover" unoptimized />
                  </div>
                  <span className="text-[8px] text-[var(--text-secondary)] truncate w-full text-center">{c.nameKr}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function analyzeTeam(names: (string | null)[], position_list: Position[]): {
  avgWinRate: number;
  totalGames: number;
  adDamage: number;
  apDamage: number;
  hasTank: boolean;
  hasEngage: boolean;
  hasEnchanter: boolean;
  strengths: string[];
  weaknesses: string[];
} {
  const champs: ExternalChampionStats[] = [];
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    if (!n) continue;
    const stat = externalStats.find((s) => s.name === n && s.position === position_list[i]);
    if (stat) champs.push(stat);
  }

  if (champs.length === 0) return { avgWinRate: 50, totalGames: 0, adDamage: 0, apDamage: 0, hasTank: false, hasEngage: false, hasEnchanter: false, strengths: [], weaknesses: [] };

  const avgWinRate = champs.reduce((sum, c) => sum + c.winRate, 0) / champs.length;
  const totalGames = champs.reduce((sum, c) => sum + c.games, 0);

  // 챔피언 태그 분석
  let adDamage = 0, apDamage = 0, hasTank = false, hasEngage = false, hasEnchanter = false;

  for (const c of champs) {
    const meta = allChampions.find((m) => m.id === c.name);
    if (!meta) continue;
    const tags = meta.tags;
    if (tags.includes("Tank")) { hasTank = true; hasEngage = true; }
    if (tags.includes("Fighter")) adDamage++;
    if (tags.includes("Marksman")) adDamage++;
    if (tags.includes("Mage")) apDamage++;
    if (tags.includes("Assassin")) adDamage++;
    if (tags.includes("Support")) hasEnchanter = true;
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (hasTank) strengths.push("프론트라인 보유");
  if (hasEngage) strengths.push("이니시에이팅 가능");
  if (hasEnchanter) strengths.push("아군 보호 가능");
  if (adDamage >= 3 && apDamage >= 1) strengths.push("균형 잡힌 데미지 배분");
  if (avgWinRate >= 51) strengths.push("개별 챔피언 승률 높음");

  if (!hasTank) weaknesses.push("프론트라인 부족");
  if (adDamage >= 4) weaknesses.push("물리 데미지 편중");
  if (apDamage >= 4) weaknesses.push("마법 데미지 편중");
  if (!hasEnchanter && !hasTank) weaknesses.push("아군 보호 능력 부족");
  if (avgWinRate < 49) weaknesses.push("개별 챔피언 승률 낮음");

  return { avgWinRate, totalGames, adDamage, apDamage, hasTank, hasEngage, hasEnchanter, strengths, weaknesses };
}

export default function TeamPage() {
  const [blueTeam, setBlueTeam] = useState<Record<Position, string | null>>({
    top: null, jungle: null, mid: null, adc: null, support: null,
  });
  const [redTeam, setRedTeam] = useState<Record<Position, string | null>>({
    top: null, jungle: null, mid: null, adc: null, support: null,
  });

  const allSelected = [...Object.values(blueTeam), ...Object.values(redTeam)].filter(Boolean) as string[];
  const blueNames = POSITIONS.map((p) => blueTeam[p]);
  const redNames = POSITIONS.map((p) => redTeam[p]);
  const blueFilled = blueNames.filter(Boolean).length;
  const redFilled = redNames.filter(Boolean).length;
  const canAnalyze = blueFilled === 5 && redFilled === 5;

  const result = useMemo(() => {
    if (!canAnalyze) return null;
    const blueAnalysis = analyzeTeam(blueNames, POSITIONS);
    const redAnalysis = analyzeTeam(redNames, POSITIONS);

    const wrDiff = (blueAnalysis.avgWinRate - redAnalysis.avgWinRate) * 0.8;
    let compBonus = 0;
    if (blueAnalysis.hasTank && !redAnalysis.hasTank) compBonus += 1.5;
    if (!blueAnalysis.hasTank && redAnalysis.hasTank) compBonus -= 1.5;
    if (blueAnalysis.strengths.length > blueAnalysis.weaknesses.length) compBonus += 1;
    if (redAnalysis.strengths.length > redAnalysis.weaknesses.length) compBonus -= 1;

    const blueWinRate = Math.min(65, Math.max(35, 50 + wrDiff + compBonus));

    return {
      blueWinRate: Math.round(blueWinRate * 10) / 10,
      redWinRate: Math.round((100 - blueWinRate) * 10) / 10,
      blue: blueAnalysis,
      red: redAnalysis,
    };
  }, [canAnalyze, blueNames.join(","), redNames.join(",")]);

  function handleReset() {
    setBlueTeam({ top: null, jungle: null, mid: null, adc: null, support: null });
    setRedTeam({ top: null, jungle: null, mid: null, adc: null, support: null });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">조합 분석기</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch}
          </p>
        </div>
        <button onClick={handleReset}
          className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          초기화
        </button>
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Team selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h2 className="text-base font-bold text-blue-400">블루팀 (아군)</h2>
          </div>
          <div className="space-y-3">
            {POSITIONS.map((pos) => (
              <TeamSlot key={`blue-${pos}`} position={pos} selectedName={blueTeam[pos]}
                onSelect={(name) => setBlueTeam((prev) => ({ ...prev, [pos]: name }))}
                allSelectedNames={allSelected} teamColor="blue" />
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <h2 className="text-base font-bold text-red-400">레드팀 (상대)</h2>
          </div>
          <div className="space-y-3">
            {POSITIONS.map((pos) => (
              <TeamSlot key={`red-${pos}`} position={pos} selectedName={redTeam[pos]}
                onSelect={(name) => setRedTeam((prev) => ({ ...prev, [pos]: name }))}
                allSelectedNames={allSelected} teamColor="red" />
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      {!canAnalyze && (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-lg font-medium text-[var(--text-secondary)]">양 팀의 챔피언을 모두 선택해주세요</p>
          <p className="text-sm text-[var(--text-muted)]">블루팀 {blueFilled}/5 | 레드팀 {redFilled}/5</p>
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((blueFilled + redFilled) / 10) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Win rate */}
          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-center mb-6">조합 승률 예측</h2>
            <div className="flex items-end justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: result.blueWinRate >= result.redWinRate ? "var(--accent-blue)" : "var(--text-muted)" }}>
                  {result.blueWinRate}%
                </div>
                <div className="text-xs text-blue-400 mt-1">블루팀</div>
              </div>
              <div className="text-2xl text-[var(--text-muted)] font-bold pb-1">VS</div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: result.redWinRate >= result.blueWinRate ? "var(--accent-red)" : "var(--text-muted)" }}>
                  {result.redWinRate}%
                </div>
                <div className="text-xs text-red-400 mt-1">레드팀</div>
              </div>
            </div>
            <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex mx-auto max-w-md">
              <div className="h-full transition-all duration-700" style={{ width: `${result.blueWinRate}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
              <div className="h-full transition-all duration-700" style={{ width: `${result.redWinRate}%`, background: "linear-gradient(90deg, #ef4444, #f87171)" }} />
            </div>
            <p className="text-xs text-center text-[var(--text-muted)] mt-3">개별 챔피언 승률 + 조합 시너지 기반 예측</p>
          </div>

          {/* Team analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "블루팀 분석", color: "blue" as const, data: result.blue },
              { label: "레드팀 분석", color: "red" as const, data: result.red },
            ].map(({ label, color, data }) => (
              <div key={color} className={`glass-card p-5 border-l-4 ${color === "blue" ? "border-blue-500/30" : "border-red-500/30"}`}>
                <h3 className={`font-bold mb-4 ${color === "blue" ? "text-blue-400" : "text-red-400"}`}>{label}</h3>
                <div className="text-xs text-[var(--text-muted)] mb-3">
                  평균 승률: <span className="text-[var(--text-primary)] font-bold">{data.avgWinRate.toFixed(1)}%</span>
                </div>
                {data.strengths.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-[var(--text-muted)] mb-1">강점</div>
                    {data.strengths.map((s, i) => (
                      <div key={i} className="text-sm text-green-400">+ {s}</div>
                    ))}
                  </div>
                )}
                {data.weaknesses.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">약점</div>
                    {data.weaknesses.map((w, i) => (
                      <div key={i} className="text-sm text-red-400">- {w}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Team lineup preview */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">팀 구성</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "블루팀", team: blueTeam, color: "blue" },
                { label: "레드팀", team: redTeam, color: "red" },
              ].map(({ label, team, color }) => (
                <div key={color}>
                  <div className={`text-xs font-medium mb-3 ${color === "blue" ? "text-blue-400" : "text-red-400"}`}>{label}</div>
                  <div className="flex gap-2">
                    {POSITIONS.map((pos) => {
                      const name = team[pos];
                      const stat = name ? externalStats.find((s) => s.name === name && s.position === pos) : null;
                      return (
                        <div key={pos} className="flex flex-col items-center gap-1">
                          <div className={`relative h-10 w-10 overflow-hidden rounded-lg border-2 ${color === "blue" ? "border-blue-500/50" : "border-red-500/50"}`}>
                            {name && <Image src={getChampionImageUrl(name)} alt={stat?.nameKr || name} width={40} height={40} className="object-cover" unoptimized />}
                          </div>
                          <span className="text-[9px] text-[var(--text-muted)]">{stat?.nameKr || ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
