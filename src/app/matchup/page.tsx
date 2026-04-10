"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { externalStats, EXTERNAL_DATA_INFO, ExternalChampionStats } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { Position, POSITION_LABELS, POSITION_ICONS } from "@/types";

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

function MatchupBar({ myWinRate, enemyWinRate, myName, enemyName }: {
  myWinRate: number; enemyWinRate: number; myName: string; enemyName: string;
}) {
  const total = myWinRate + (100 - enemyWinRate);
  const myPct = (myWinRate / (myWinRate + (100 - myWinRate))) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-bold" style={{ color: myPct >= 50 ? "var(--accent-blue)" : "var(--text-secondary)" }}>
          {myWinRate.toFixed(1)}%
        </span>
        <span className="font-bold" style={{ color: myPct < 50 ? "var(--accent-red)" : "var(--text-secondary)" }}>
          {(100 - myWinRate).toFixed(1)}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
        <div className="h-full transition-all duration-500" style={{
          width: `${myWinRate}%`,
          background: myWinRate >= 50 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : "linear-gradient(90deg, #6b7280, #9ca3af)",
        }} />
        <div className="h-full transition-all duration-500" style={{
          width: `${100 - myWinRate}%`,
          background: myWinRate < 50 ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #6b7280, #9ca3af)",
        }} />
      </div>
    </div>
  );
}

export default function MatchupPage() {
  const [position, setPosition] = useState<Position>("mid");
  const [myChampName, setMyChampName] = useState<string | null>(null);
  const [enemyChampName, setEnemyChampName] = useState<string | null>(null);
  const [mySearch, setMySearch] = useState("");
  const [enemySearch, setEnemySearch] = useState("");

  const posChamps = useMemo(() =>
    externalStats.filter((s) => s.position === position),
    [position]
  );

  const myChamp = myChampName ? externalStats.find((s) => s.name === myChampName && s.position === position) : null;
  const enemyChamp = enemyChampName ? externalStats.find((s) => s.name === enemyChampName && s.position === position) : null;

  // 매치업 결과 계산
  const matchupResult = useMemo(() => {
    if (!myChamp || !enemyChamp) return null;

    // 상대가 내 카운터인지 확인
    const isCountered = myChamp.counters.some((c) => c.name === enemyChamp.name);
    const isEasy = myChamp.easyMatchups.some((e) => e.name === enemyChamp.name);

    // 카운터 데이터에서 승률 가져오기
    const counterData = myChamp.counters.find((c) => c.name === enemyChamp.name);
    const easyData = myChamp.easyMatchups.find((e) => e.name === enemyChamp.name);

    let myWinRate: number;
    let games: number;
    if (counterData) {
      myWinRate = counterData.winRate;
      games = counterData.games;
    } else if (easyData) {
      myWinRate = easyData.winRate;
      games = easyData.games;
    } else {
      // 카운터/이지 매치업이 아니면 양쪽 승률로 추정
      const wrDiff = myChamp.winRate - enemyChamp.winRate;
      myWinRate = Math.min(60, Math.max(40, 50 + wrDiff));
      games = Math.min(myChamp.games, enemyChamp.games);
    }

    const advantage = myWinRate >= 53 ? "strong" : myWinRate <= 47 ? "weak" : "even";

    return {
      myWinRate: Math.round(myWinRate * 10) / 10,
      games,
      advantage,
      isCountered,
      isEasy,
    };
  }, [myChamp, enemyChamp]);

  function ChampionGrid({ search, onSelect, selectedName, excludeName }: {
    search: string; onSelect: (name: string) => void; selectedName: string | null; excludeName: string | null;
  }) {
    const filtered = posChamps.filter((c) => {
      if (c.name === excludeName) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return c.nameKr.includes(q) || c.name.toLowerCase().includes(q);
    });

    return (
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 max-h-64 overflow-y-auto p-1">
        {filtered.map((c) => (
          <button
            key={c.name}
            onClick={() => onSelect(c.name)}
            className={`champion-grid-item p-1 flex flex-col items-center ${c.name === selectedName ? "selected" : ""}`}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-lg">
              <Image src={getChampionImageUrl(c.name)} alt={c.nameKr} width={40} height={40} className="object-cover" unoptimized />
            </div>
            <span className="text-[9px] text-[var(--text-secondary)] mt-0.5 truncate w-full text-center">{c.nameKr}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">맞라인 분석</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.totalSamples.toLocaleString()}경기 기준
        </p>
      </div>

      {/* Warning */}
      <div className="mb-5 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Position select */}
      <div className="mb-6">
        <div className="flex items-center gap-1">
          {(["top", "jungle", "mid", "adc", "support"] as Position[]).map((pos) => (
            <button
              key={pos}
              onClick={() => { setPosition(pos); setMyChampName(null); setEnemyChampName(null); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                position === pos
                  ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span>{POSITION_ICONS[pos]}</span>
              <span className="hidden sm:inline">{POSITION_LABELS[pos]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Champion selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* My champion */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-400">내 챔피언</span>
            {myChamp && (
              <span className="text-xs text-[var(--text-muted)]">승률 {myChamp.winRate}%</span>
            )}
          </div>
          {myChamp && (
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-blue-500">
                <Image src={getChampionImageUrl(myChamp.name)} alt={myChamp.nameKr} width={48} height={48} className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-[var(--text-primary)]">{myChamp.nameKr}</div>
                <div className="text-xs text-[var(--text-muted)]">{myChamp.name}</div>
              </div>
            </div>
          )}
          <input
            type="text" placeholder="검색..." value={mySearch}
            onChange={(e) => setMySearch(e.target.value)}
            className="champion-search w-full px-3 py-1.5 text-xs mb-2"
          />
          <ChampionGrid search={mySearch} onSelect={setMyChampName} selectedName={myChampName} excludeName={enemyChampName} />
        </div>

        {/* Enemy champion */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-red-400">상대 챔피언</span>
            {enemyChamp && (
              <span className="text-xs text-[var(--text-muted)]">승률 {enemyChamp.winRate}%</span>
            )}
          </div>
          {enemyChamp && (
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-red-500">
                <Image src={getChampionImageUrl(enemyChamp.name)} alt={enemyChamp.nameKr} width={48} height={48} className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-[var(--text-primary)]">{enemyChamp.nameKr}</div>
                <div className="text-xs text-[var(--text-muted)]">{enemyChamp.name}</div>
              </div>
            </div>
          )}
          <input
            type="text" placeholder="검색..." value={enemySearch}
            onChange={(e) => setEnemySearch(e.target.value)}
            className="champion-search w-full px-3 py-1.5 text-xs mb-2"
          />
          <ChampionGrid search={enemySearch} onSelect={setEnemyChampName} selectedName={enemyChampName} excludeName={myChampName} />
        </div>
      </div>

      {/* Result */}
      {matchupResult && myChamp && enemyChamp && (
        <div className="space-y-6 animate-fade-in">
          {/* Win rate bar */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-blue-500">
                  <Image src={getChampionImageUrl(myChamp.name)} alt={myChamp.nameKr} width={56} height={56} className="object-cover" unoptimized />
                </div>
                <div>
                  <div className="font-bold text-lg">{myChamp.nameKr}</div>
                  <div className="text-xs text-[var(--text-muted)]">{POSITION_LABELS[position]}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-muted)]">VS</div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-lg">{enemyChamp.nameKr}</div>
                  <div className="text-xs text-[var(--text-muted)]">{POSITION_LABELS[position]}</div>
                </div>
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-red-500">
                  <Image src={getChampionImageUrl(enemyChamp.name)} alt={enemyChamp.nameKr} width={56} height={56} className="object-cover" unoptimized />
                </div>
              </div>
            </div>

            <MatchupBar myWinRate={matchupResult.myWinRate} enemyWinRate={100 - matchupResult.myWinRate} myName={myChamp.nameKr} enemyName={enemyChamp.nameKr} />

            <div className="text-center mt-4">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                matchupResult.advantage === "strong" ? "bg-green-500/15 text-green-400" :
                matchupResult.advantage === "weak" ? "bg-red-500/15 text-red-400" :
                "bg-yellow-500/15 text-yellow-400"
              }`}>
                {matchupResult.advantage === "strong" ? `${myChamp.nameKr} 유리` :
                 matchupResult.advantage === "weak" ? `${enemyChamp.nameKr} 유리` :
                 "균형 잡힌 매치업"}
              </span>
              {matchupResult.isCountered && (
                <p className="text-xs text-red-400 mt-2">상대가 카운터 챔피언입니다</p>
              )}
              {matchupResult.isEasy && (
                <p className="text-xs text-green-400 mt-2">유리한 매치업입니다</p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-1">{matchupResult.games.toLocaleString()}경기 기준</p>
            </div>
          </div>

          {/* My champion counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-red-400 mb-3">{myChamp.nameKr}의 카운터</h3>
              <div className="space-y-2">
                {myChamp.counters.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5">
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                      <Image src={getChampionImageUrl(c.name)} alt={c.nameKr} width={32} height={32} className="object-cover" unoptimized />
                    </div>
                    <span className="text-sm flex-1">{c.nameKr}</span>
                    <span className="text-xs font-bold text-red-400">{c.winRate}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-green-400 mb-3">{myChamp.nameKr}이(가) 강한 상대</h3>
              <div className="space-y-2">
                {myChamp.easyMatchups.map((e) => (
                  <div key={e.name} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5">
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                      <Image src={getChampionImageUrl(e.name)} alt={e.nameKr} width={32} height={32} className="object-cover" unoptimized />
                    </div>
                    <span className="text-sm flex-1">{e.nameKr}</span>
                    <span className="text-xs font-bold text-green-400">{e.winRate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!myChamp || !enemyChamp) && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">⚔️</div>
          <p className="text-lg font-medium text-[var(--text-secondary)]">양쪽 챔피언을 선택해주세요</p>
        </div>
      )}
    </div>
  );
}
