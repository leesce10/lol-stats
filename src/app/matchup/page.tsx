"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { externalStats, EXTERNAL_DATA_INFO, ExternalChampionStats } from "@/data/external-stats";
import { DDRAGON_VERSION } from "@/data/champions";
import { generateMatchupGuide } from "@/lib/matchup-engine";
import type { ChampionProfile } from "@/types/matchup-engine";
import MatchupGuideResult from "@/components/MatchupGuideResult";
import PositionIcon from "@/components/PositionIcon";
import { POSITION_ICON_URLS } from "@/types";

// 정글
import zedProfile from "@/data/champion-profiles/zed.json";
import leesinProfile from "@/data/champion-profiles/leesin.json";
import gravesProfile from "@/data/champion-profiles/graves.json";
import viegoProfile from "@/data/champion-profiles/viego.json";
import khazixProfile from "@/data/champion-profiles/khazix.json";
import kaynProfile from "@/data/champion-profiles/kayn.json";
import hecarimProfile from "@/data/champion-profiles/hecarim.json";
import warwickProfile from "@/data/champion-profiles/warwick.json";
import nocturneProfile from "@/data/champion-profiles/nocturne.json";
import dianaProfile from "@/data/champion-profiles/diana.json";
// 탑
import dariusProfile from "@/data/champion-profiles/darius.json";
import fioraProfile from "@/data/champion-profiles/fiora.json";
import aatroxProfile from "@/data/champion-profiles/aatrox.json";
import jaxProfile from "@/data/champion-profiles/jax.json";
import ireliaProfile from "@/data/champion-profiles/irelia.json";
import camilleProfile from "@/data/champion-profiles/camille.json";
import renektonProfile from "@/data/champion-profiles/renekton.json";
import settProfile from "@/data/champion-profiles/sett.json";
import gnarProfile from "@/data/champion-profiles/gnar.json";
import malphiteProfile from "@/data/champion-profiles/malphite.json";
// 미드
import ahriProfile from "@/data/champion-profiles/ahri.json";
import yasuoProfile from "@/data/champion-profiles/yasuo.json";
import oriannaProfile from "@/data/champion-profiles/orianna.json";
import azirProfile from "@/data/champion-profiles/azir.json";
import syndraProfile from "@/data/champion-profiles/syndra.json";
import sylasProfile from "@/data/champion-profiles/sylas.json";
import viktorProfile from "@/data/champion-profiles/viktor.json";
import katarinaProfile from "@/data/champion-profiles/katarina.json";
import akaliProfile from "@/data/champion-profiles/akali.json";
import leblancProfile from "@/data/champion-profiles/leblanc.json";
import zedMidProfile from "@/data/champion-profiles/zed-mid.json";
import talonProfile from "@/data/champion-profiles/talon.json";
import fizzProfile from "@/data/champion-profiles/fizz.json";
import galioProfile from "@/data/champion-profiles/galio.json";
import vexProfile from "@/data/champion-profiles/vex.json";
// ADC
import jinxProfile from "@/data/champion-profiles/jinx.json";
import caitlynProfile from "@/data/champion-profiles/caitlyn.json";
import apheliosProfile from "@/data/champion-profiles/aphelios.json";
import ezrealProfile from "@/data/champion-profiles/ezreal.json";
import kaisaProfile from "@/data/champion-profiles/kaisa.json";
import lucianProfile from "@/data/champion-profiles/lucian.json";
import missFortuneProfile from "@/data/champion-profiles/missfortune.json";
import vayneProfile from "@/data/champion-profiles/vayne.json";
import varusProfile from "@/data/champion-profiles/varus.json";
import samiraProfile from "@/data/champion-profiles/samira.json";
// 서포터
import leonaProfile from "@/data/champion-profiles/leona.json";
import luluProfile from "@/data/champion-profiles/lulu.json";
import threshProfile from "@/data/champion-profiles/thresh.json";
import nautilusProfile from "@/data/champion-profiles/nautilus.json";
import blitzcrankProfile from "@/data/champion-profiles/blitzcrank.json";
import pykeProfile from "@/data/champion-profiles/pyke.json";
import sennaProfile from "@/data/champion-profiles/senna.json";
import sorakaProfile from "@/data/champion-profiles/soraka.json";
import namiProfile from "@/data/champion-profiles/nami.json";
import karmaProfile from "@/data/champion-profiles/karma.json";

type Lane = "top" | "jungle" | "mid" | "bottom";

type ProfileLane = "top" | "jungle" | "mid" | "adc" | "support";

// 라인별 프로파일 레지스트리 (라인당 10개)
const PROFILE_REGISTRY: Record<ProfileLane, Record<string, ChampionProfile>> = {
  top: {
    Darius: dariusProfile as unknown as ChampionProfile,
    Fiora: fioraProfile as unknown as ChampionProfile,
    Aatrox: aatroxProfile as unknown as ChampionProfile,
    Jax: jaxProfile as unknown as ChampionProfile,
    Irelia: ireliaProfile as unknown as ChampionProfile,
    Camille: camilleProfile as unknown as ChampionProfile,
    Renekton: renektonProfile as unknown as ChampionProfile,
    Sett: settProfile as unknown as ChampionProfile,
    Gnar: gnarProfile as unknown as ChampionProfile,
    Malphite: malphiteProfile as unknown as ChampionProfile,
  },
  jungle: {
    Zed: zedProfile as unknown as ChampionProfile,
    LeeSin: leesinProfile as unknown as ChampionProfile,
    Graves: gravesProfile as unknown as ChampionProfile,
    Viego: viegoProfile as unknown as ChampionProfile,
    Khazix: khazixProfile as unknown as ChampionProfile,
    Kayn: kaynProfile as unknown as ChampionProfile,
    Hecarim: hecarimProfile as unknown as ChampionProfile,
    Warwick: warwickProfile as unknown as ChampionProfile,
    Nocturne: nocturneProfile as unknown as ChampionProfile,
    Diana: dianaProfile as unknown as ChampionProfile,
  },
  mid: {
    Ahri: ahriProfile as unknown as ChampionProfile,
    Yasuo: yasuoProfile as unknown as ChampionProfile,
    Orianna: oriannaProfile as unknown as ChampionProfile,
    Azir: azirProfile as unknown as ChampionProfile,
    Syndra: syndraProfile as unknown as ChampionProfile,
    Sylas: sylasProfile as unknown as ChampionProfile,
    Viktor: viktorProfile as unknown as ChampionProfile,
    Katarina: katarinaProfile as unknown as ChampionProfile,
    Akali: akaliProfile as unknown as ChampionProfile,
    Leblanc: leblancProfile as unknown as ChampionProfile,
    Zed: zedMidProfile as unknown as ChampionProfile,
    Talon: talonProfile as unknown as ChampionProfile,
    Fizz: fizzProfile as unknown as ChampionProfile,
    Galio: galioProfile as unknown as ChampionProfile,
    Vex: vexProfile as unknown as ChampionProfile,
  },
  adc: {
    Jinx: jinxProfile as unknown as ChampionProfile,
    Caitlyn: caitlynProfile as unknown as ChampionProfile,
    Aphelios: apheliosProfile as unknown as ChampionProfile,
    Ezreal: ezrealProfile as unknown as ChampionProfile,
    Kaisa: kaisaProfile as unknown as ChampionProfile,
    Lucian: lucianProfile as unknown as ChampionProfile,
    MissFortune: missFortuneProfile as unknown as ChampionProfile,
    Vayne: vayneProfile as unknown as ChampionProfile,
    Varus: varusProfile as unknown as ChampionProfile,
    Samira: samiraProfile as unknown as ChampionProfile,
  },
  support: {
    Leona: leonaProfile as unknown as ChampionProfile,
    Lulu: luluProfile as unknown as ChampionProfile,
    Thresh: threshProfile as unknown as ChampionProfile,
    Nautilus: nautilusProfile as unknown as ChampionProfile,
    Blitzcrank: blitzcrankProfile as unknown as ChampionProfile,
    Pyke: pykeProfile as unknown as ChampionProfile,
    Senna: sennaProfile as unknown as ChampionProfile,
    Soraka: sorakaProfile as unknown as ChampionProfile,
    Nami: namiProfile as unknown as ChampionProfile,
    Karma: karmaProfile as unknown as ChampionProfile,
  },
};

function getProfile(lane: ProfileLane, champName: string | null): ChampionProfile | null {
  if (!champName) return null;
  return PROFILE_REGISTRY[lane][champName] ?? null;
}

const LANE_CONFIG: { key: Lane; label: string; iconUrl: string }[] = [
  { key: "top", label: "탑", iconUrl: POSITION_ICON_URLS.top },
  { key: "jungle", label: "정글", iconUrl: POSITION_ICON_URLS.jungle },
  { key: "mid", label: "미드", iconUrl: POSITION_ICON_URLS.mid },
  { key: "bottom", label: "바텀", iconUrl: POSITION_ICON_URLS.adc },
];

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

function ChampionGrid({ position, search, onSelect, selectedName, excludeNames, extraChamps }: {
  position: "top" | "jungle" | "mid" | "adc" | "support";
  search: string;
  onSelect: (name: string) => void;
  selectedName: string | null;
  excludeNames: string[];
  extraChamps?: { name: string; nameKr: string }[];
}) {
  const posChamps = externalStats.filter((s) => s.position === position);

  // 프로파일 전용 챔프 추가 (기존 리스트에 없는 것만)
  const existingNames = new Set(posChamps.map(c => c.name));
  const extras = (extraChamps || [])
    .filter(e => !existingNames.has(e.name))
    .map(e => ({ name: e.name, nameKr: e.nameKr, isExtra: true }));

  // 이 라인에서 프로파일(심층 가이드)이 있는 챔프 이름 집합
  const profileNames = new Set(Object.keys(PROFILE_REGISTRY[position]));

  const allChamps = [
    ...posChamps.map(c => ({ name: c.name, nameKr: c.nameKr, isExtra: false, hasGuide: profileNames.has(c.name) })),
    ...extras.map(e => ({ ...e, hasGuide: profileNames.has(e.name) })),
  ];

  // 공략 있는 챔프 먼저 정렬
  allChamps.sort((a, b) => Number(b.hasGuide) - Number(a.hasGuide));

  const filtered = allChamps.filter((c) => {
    if (excludeNames.includes(c.name) && c.name !== selectedName) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.nameKr.includes(q) || c.name.toLowerCase().includes(q);
  });

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
      {filtered.map((c) => (
        <button
          key={c.name}
          onClick={() => onSelect(c.name)}
          title={c.hasGuide ? `${c.nameKr} · 심층 공략 제공` : c.nameKr}
          className={`champion-grid-item relative p-1 flex flex-col items-center ${c.name === selectedName ? "selected" : ""} ${c.hasGuide ? "ring-2 ring-blue-400/70 bg-blue-500/5" : "opacity-60 hover:opacity-100"}`}
        >
          {c.hasGuide && (
            <span className="absolute top-0.5 right-0.5 z-10 text-[8px] font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded px-1 py-0 leading-tight shadow">
              공략
            </span>
          )}
          <div className="relative h-9 w-9 overflow-hidden rounded-lg">
            <Image src={getChampionImageUrl(c.name)} alt={c.nameKr} width={36} height={36} className="object-cover" unoptimized />
          </div>
          <span className="text-[8px] text-[var(--text-secondary)] mt-0.5 truncate w-full text-center">{c.nameKr}</span>
        </button>
      ))}
    </div>
  );
}

function SelectedChampion({ name, position, borderColor }: {
  name: string | null; position: ProfileLane; borderColor: string;
}) {
  const champ = name ? externalStats.find((s) => s.name === name && s.position === position) : null;
  // 프로파일 전용 챔프 폴백 (비주류 포지션 등)
  const profile = getProfile(position, name);
  const displayName = champ?.nameKr ?? profile?.name;
  const displayId = champ?.name ?? profile?.id ?? name;

  if (!displayName || !displayId) return null;

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${borderColor}`}>
      <div className={`relative h-10 w-10 overflow-hidden rounded-lg border-2 ${borderColor}`}>
        <Image src={getChampionImageUrl(displayId)} alt={displayName} width={40} height={40} className="object-cover" unoptimized />
      </div>
      <div>
        <div className="font-bold text-sm">{displayName}</div>
        <div className="text-[10px] text-[var(--text-muted)]">
          {champ ? `${champ.winRate}% 승률` : profile ? "프로파일 분석" : ""}
        </div>
      </div>
    </div>
  );
}

function WinRateBar({ myPct }: { myPct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-bold" style={{ color: myPct >= 50 ? "var(--accent-blue)" : "var(--text-secondary)" }}>{myPct.toFixed(1)}%</span>
        <span className="font-bold" style={{ color: myPct < 50 ? "var(--accent-red)" : "var(--text-secondary)" }}>{(100 - myPct).toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
        <div className="h-full transition-all duration-500" style={{
          width: `${myPct}%`,
          background: myPct >= 50 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : "linear-gradient(90deg, #6b7280, #9ca3af)",
        }} />
        <div className="h-full transition-all duration-500" style={{
          width: `${100 - myPct}%`,
          background: myPct < 50 ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #6b7280, #9ca3af)",
        }} />
      </div>
    </div>
  );
}

function SoloMatchupResult({ myChamp, enemyChamp }: { myChamp: ExternalChampionStats; enemyChamp: ExternalChampionStats }) {
  const counterData = myChamp.counters.find((c) => c.name === enemyChamp.name);
  const easyData = myChamp.easyMatchups.find((e) => e.name === enemyChamp.name);

  let myWinRate: number;
  let games: number;
  if (counterData) { myWinRate = counterData.winRate; games = counterData.games; }
  else if (easyData) { myWinRate = easyData.winRate; games = easyData.games; }
  else {
    const wrDiff = myChamp.winRate - enemyChamp.winRate;
    myWinRate = Math.min(60, Math.max(40, 50 + wrDiff));
    games = Math.min(myChamp.games, enemyChamp.games);
  }

  const advantage = myWinRate >= 53 ? "strong" : myWinRate <= 47 ? "weak" : "even";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-blue-500">
              <Image src={getChampionImageUrl(myChamp.name)} alt={myChamp.nameKr} width={56} height={56} className="object-cover" unoptimized />
            </div>
            <div><div className="font-bold text-lg">{myChamp.nameKr}</div></div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-muted)]">VS</div>
          <div className="flex items-center gap-3">
            <div className="text-right"><div className="font-bold text-lg">{enemyChamp.nameKr}</div></div>
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-red-500">
              <Image src={getChampionImageUrl(enemyChamp.name)} alt={enemyChamp.nameKr} width={56} height={56} className="object-cover" unoptimized />
            </div>
          </div>
        </div>
        <WinRateBar myPct={myWinRate} />
        <div className="text-center mt-4">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            advantage === "strong" ? "bg-green-500/15 text-green-400" :
            advantage === "weak" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {advantage === "strong" ? `${myChamp.nameKr} 유리` : advantage === "weak" ? `${enemyChamp.nameKr} 유리` : "균형 잡힌 매치업"}
          </span>
          {counterData && <p className="text-xs text-red-400 mt-2">상대가 카운터입니다</p>}
          {easyData && <p className="text-xs text-green-400 mt-2">유리한 매치업입니다</p>}
          <p className="text-xs text-[var(--text-muted)] mt-1">{games.toLocaleString()}경기 기준</p>
        </div>
      </div>

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
  );
}

function BottomMatchupResult({ myAdc, mySup, enemyAdc, enemySup }: {
  myAdc: ExternalChampionStats; mySup: ExternalChampionStats;
  enemyAdc: ExternalChampionStats; enemySup: ExternalChampionStats;
}) {
  // 듀오 시너지 계산
  const myAdcWr = myAdc.winRate;
  const mySupWr = mySup.winRate;
  const enemyAdcWr = enemyAdc.winRate;
  const enemySupWr = enemySup.winRate;

  const myDuoAvg = (myAdcWr + mySupWr) / 2;
  const enemyDuoAvg = (enemyAdcWr + enemySupWr) / 2;
  const wrDiff = myDuoAvg - enemyDuoAvg;

  // 서폿 상성 보너스: 이니시 서폿 vs 인챈터, 포크 서폿 vs 이니시 등
  let synergyBonus = 0;
  // 킬압 서폿 + 초반 원딜 = 보너스
  const killSupports = ["Leona", "Nautilus", "Blitzcrank", "Thresh", "Rell", "Alistar", "Pyke"];
  const earlyAdcs = ["Draven", "Lucian", "Samira", "Caitlyn", "MissFortune"];
  const lateAdcs = ["Jinx", "KogMaw", "Aphelios", "Vayne", "Twitch"];
  const enchanters = ["Lulu", "Nami", "Janna", "Soraka", "Yuumi", "Sona", "Milio"];

  if (killSupports.includes(mySup.name) && earlyAdcs.includes(myAdc.name)) synergyBonus += 1.5;
  if (killSupports.includes(enemySup.name) && earlyAdcs.includes(enemyAdc.name)) synergyBonus -= 1.5;
  if (enchanters.includes(mySup.name) && lateAdcs.includes(myAdc.name)) synergyBonus += 1;
  if (enchanters.includes(enemySup.name) && lateAdcs.includes(enemyAdc.name)) synergyBonus -= 1;

  // 서폿 카운터 체크
  const mySupCountered = mySup.counters.some((c) => c.name === enemySup.name || c.name === enemyAdc.name);
  const enemySupCountered = enemySup.counters.some((c) => c.name === mySup.name || c.name === myAdc.name);
  if (mySupCountered) synergyBonus -= 1.5;
  if (enemySupCountered) synergyBonus += 1.5;

  const myWinRate = Math.min(65, Math.max(35, 50 + wrDiff * 0.8 + synergyBonus));
  const advantage = myWinRate >= 53 ? "strong" : myWinRate <= 47 ? "weak" : "even";

  const myStrengths: string[] = [];
  const enemyStrengths: string[] = [];

  if (killSupports.includes(mySup.name)) myStrengths.push("킬압이 강한 라인전");
  if (enchanters.includes(mySup.name) && lateAdcs.includes(myAdc.name)) myStrengths.push("후반 스케일링 우수");
  if (earlyAdcs.includes(myAdc.name)) myStrengths.push("초반 라인 주도권");
  if (lateAdcs.includes(myAdc.name)) myStrengths.push("후반 캐리력 높음");

  if (killSupports.includes(enemySup.name)) enemyStrengths.push("킬압이 강한 라인전");
  if (enchanters.includes(enemySup.name) && lateAdcs.includes(enemyAdc.name)) enemyStrengths.push("후반 스케일링 우수");
  if (earlyAdcs.includes(enemyAdc.name)) enemyStrengths.push("초반 라인 주도권");
  if (lateAdcs.includes(enemyAdc.name)) enemyStrengths.push("후반 캐리력 높음");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        {/* Duo display */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-blue-500">
              <Image src={getChampionImageUrl(myAdc.name)} alt={myAdc.nameKr} width={48} height={48} className="object-cover" unoptimized />
            </div>
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-blue-400">
              <Image src={getChampionImageUrl(mySup.name)} alt={mySup.nameKr} width={48} height={48} className="object-cover" unoptimized />
            </div>
            <div className="ml-1">
              <div className="font-bold text-sm">{myAdc.nameKr} + {mySup.nameKr}</div>
              <div className="text-[10px] text-[var(--text-muted)]">내 바텀</div>
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--text-muted)]">VS</div>
          <div className="flex items-center gap-2">
            <div className="mr-1 text-right">
              <div className="font-bold text-sm">{enemyAdc.nameKr} + {enemySup.nameKr}</div>
              <div className="text-[10px] text-[var(--text-muted)]">상대 바텀</div>
            </div>
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-red-400">
              <Image src={getChampionImageUrl(enemySup.name)} alt={enemySup.nameKr} width={48} height={48} className="object-cover" unoptimized />
            </div>
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-red-500">
              <Image src={getChampionImageUrl(enemyAdc.name)} alt={enemyAdc.nameKr} width={48} height={48} className="object-cover" unoptimized />
            </div>
          </div>
        </div>

        <WinRateBar myPct={Math.round(myWinRate * 10) / 10} />

        <div className="text-center mt-4">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            advantage === "strong" ? "bg-green-500/15 text-green-400" :
            advantage === "weak" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {advantage === "strong" ? "내 바텀 유리" : advantage === "weak" ? "상대 바텀 유리" : "균형 잡힌 바텀 구도"}
          </span>
          {mySupCountered && <p className="text-xs text-red-400 mt-2">내 서포터가 카운터당하고 있습니다</p>}
          {enemySupCountered && <p className="text-xs text-green-400 mt-2">상대 서포터를 카운터하고 있습니다</p>}
        </div>
      </div>

      {/* Duo analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 border-l-4 border-blue-500/30">
          <h3 className="text-sm font-bold text-blue-400 mb-3">내 바텀 분석</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>원딜 승률</span><span className="font-bold">{myAdc.winRate}%</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>서포터 승률</span><span className="font-bold">{mySup.winRate}%</span>
            </div>
            <div className="border-t border-[var(--border-color)] pt-2 mt-2">
              {myStrengths.length > 0 ? myStrengths.map((s, i) => (
                <div key={i} className="text-green-400 text-xs">+ {s}</div>
              )) : <div className="text-xs text-[var(--text-muted)]">특별한 시너지 없음</div>}
            </div>
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-red-500/30">
          <h3 className="text-sm font-bold text-red-400 mb-3">상대 바텀 분석</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>원딜 승률</span><span className="font-bold">{enemyAdc.winRate}%</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>서포터 승률</span><span className="font-bold">{enemySup.winRate}%</span>
            </div>
            <div className="border-t border-[var(--border-color)] pt-2 mt-2">
              {enemyStrengths.length > 0 ? enemyStrengths.map((s, i) => (
                <div key={i} className="text-green-400 text-xs">+ {s}</div>
              )) : <div className="text-xs text-[var(--text-muted)]">특별한 시너지 없음</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchupPage() {
  const [lane, setLane] = useState<Lane>("mid");

  // Solo lanes
  const [myChampName, setMyChampName] = useState<string | null>(null);
  const [enemyChampName, setEnemyChampName] = useState<string | null>(null);
  const [mySearch, setMySearch] = useState("");
  const [enemySearch, setEnemySearch] = useState("");

  // Bottom lane
  const [myAdc, setMyAdc] = useState<string | null>(null);
  const [mySup, setMySup] = useState<string | null>(null);
  const [enemyAdc, setEnemyAdc] = useState<string | null>(null);
  const [enemySup, setEnemySup] = useState<string | null>(null);
  const [myAdcSearch, setMyAdcSearch] = useState("");
  const [mySupSearch, setMySupSearch] = useState("");
  const [enemyAdcSearch, setEnemyAdcSearch] = useState("");
  const [enemySupSearch, setEnemySupSearch] = useState("");

  const isBottom = lane === "bottom";
  const soloPosition = lane as "top" | "jungle" | "mid";

  const myChamp = !isBottom && myChampName ? externalStats.find((s) => s.name === myChampName && s.position === soloPosition) : null;
  const enemyChamp = !isBottom && enemyChampName ? externalStats.find((s) => s.name === enemyChampName && s.position === soloPosition) : null;

  const myAdcChamp = isBottom && myAdc ? externalStats.find((s) => s.name === myAdc && s.position === "adc") : null;
  const mySupChamp = isBottom && mySup ? externalStats.find((s) => s.name === mySup && s.position === "support") : null;
  const enemyAdcChamp = isBottom && enemyAdc ? externalStats.find((s) => s.name === enemyAdc && s.position === "adc") : null;
  const enemySupChamp = isBottom && enemySup ? externalStats.find((s) => s.name === enemySup && s.position === "support") : null;

  const allSelectedBottom = [myAdc, mySup, enemyAdc, enemySup].filter(Boolean) as string[];
  const soloSelected = [myChampName, enemyChampName].filter(Boolean) as string[];

  const hasSoloResult = !isBottom && myChamp && enemyChamp;
  const hasBottomResult = isBottom && myAdcChamp && mySupChamp && enemyAdcChamp && enemySupChamp;

  // 룰 엔진: 솔로라인 (탑/정글/미드)
  const myProfile = !isBottom ? getProfile(soloPosition, myChampName) : null;
  const enemyProfile = !isBottom ? getProfile(soloPosition, enemyChampName) : null;
  const hasSoloMatchupGuide = !!(myProfile && enemyProfile);
  const soloMatchupGuide = useMemo(() => {
    if (!hasSoloMatchupGuide || !myProfile || !enemyProfile) return null;
    return generateMatchupGuide(myProfile, enemyProfile);
  }, [hasSoloMatchupGuide, myProfile, enemyProfile]);

  // 룰 엔진: 바텀 (ADC 1v1, 서포터 1v1 각각)
  const myAdcProfile = isBottom ? getProfile("adc", myAdc) : null;
  const enemyAdcProfile = isBottom ? getProfile("adc", enemyAdc) : null;
  const mySupProfile = isBottom ? getProfile("support", mySup) : null;
  const enemySupProfile = isBottom ? getProfile("support", enemySup) : null;
  const adcMatchupGuide = useMemo(() => {
    if (!myAdcProfile || !enemyAdcProfile) return null;
    return generateMatchupGuide(myAdcProfile, enemyAdcProfile);
  }, [myAdcProfile, enemyAdcProfile]);
  const supMatchupGuide = useMemo(() => {
    if (!mySupProfile || !enemySupProfile) return null;
    return generateMatchupGuide(mySupProfile, enemySupProfile);
  }, [mySupProfile, enemySupProfile]);

  // 라인별 프로파일 전용 챔프 목록 (ChampionGrid extraChamps용)
  const profileExtraChamps = (pos: ProfileLane) =>
    Object.values(PROFILE_REGISTRY[pos]).map(p => ({ name: p.id, nameKr: p.name }));

  function handleLaneChange(l: Lane) {
    setLane(l);
    setMyChampName(null); setEnemyChampName(null);
    setMyAdc(null); setMySup(null); setEnemyAdc(null); setEnemySup(null);
    setMySearch(""); setEnemySearch("");
    setMyAdcSearch(""); setMySupSearch(""); setEnemyAdcSearch(""); setEnemySupSearch("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">맞라인 분석</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          {EXTERNAL_DATA_INFO.source} · 패치 {EXTERNAL_DATA_INFO.patch} · {EXTERNAL_DATA_INFO.totalSamples.toLocaleString()}경기 기준
        </p>
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs">
        <span>&#9888;&#65039;</span>
        <span className="text-[var(--text-muted)]">{EXTERNAL_DATA_INFO.warning}</span>
      </div>

      {/* Lane select */}
      <div className="mb-6">
        <div className="flex items-center gap-1">
          {LANE_CONFIG.map((l) => (
            <button key={l.key} onClick={() => handleLaneChange(l.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                lane === l.key
                  ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}>
              <Image src={l.iconUrl} alt={l.label} width={16} height={16} className={`inline-block ${lane === l.key ? "brightness-200" : "opacity-70"}`} unoptimized />
              <span className="hidden sm:inline">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Solo lane selection */}
      {!isBottom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-400">내 챔피언</span>
              {myChamp && <span className="text-xs text-[var(--text-muted)]">{myChamp.winRate}%</span>}
            </div>
            <SelectedChampion name={myChampName} position={soloPosition} borderColor="border-blue-500/30 bg-blue-500/10" />
            <input type="text" placeholder="검색..." value={mySearch} onChange={(e) => setMySearch(e.target.value)}
              className="champion-search w-full px-3 py-1.5 text-xs my-2" />
            <ChampionGrid position={soloPosition} search={mySearch} onSelect={setMyChampName}
              selectedName={myChampName} excludeNames={soloSelected}
              extraChamps={profileExtraChamps(soloPosition)} />
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-red-400">상대 챔피언</span>
              {enemyChamp && <span className="text-xs text-[var(--text-muted)]">{enemyChamp.winRate}%</span>}
            </div>
            <SelectedChampion name={enemyChampName} position={soloPosition} borderColor="border-red-500/30 bg-red-500/10" />
            <input type="text" placeholder="검색..." value={enemySearch} onChange={(e) => setEnemySearch(e.target.value)}
              className="champion-search w-full px-3 py-1.5 text-xs my-2" />
            <ChampionGrid position={soloPosition} search={enemySearch} onSelect={setEnemyChampName}
              selectedName={enemyChampName} excludeNames={soloSelected}
              extraChamps={profileExtraChamps(soloPosition)} />
          </div>
        </div>
      )}

      {/* Bottom lane selection - 2v2 */}
      {isBottom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* My bottom */}
          <div className="glass-card p-4">
            <div className="text-sm font-medium text-blue-400 mb-3">내 바텀</div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1"><PositionIcon position="adc" size={12} className="opacity-60" /> 원딜</div>
                <SelectedChampion name={myAdc} position="adc" borderColor="border-blue-500/30 bg-blue-500/10" />
                <input type="text" placeholder="원딜 검색..." value={myAdcSearch} onChange={(e) => setMyAdcSearch(e.target.value)}
                  className="champion-search w-full px-3 py-1.5 text-xs my-1.5" />
                <ChampionGrid position="adc" search={myAdcSearch} onSelect={setMyAdc}
                  selectedName={myAdc} excludeNames={allSelectedBottom}
                  extraChamps={profileExtraChamps("adc")} />
              </div>
              <div className="border-t border-[var(--border-color)] pt-3">
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1"><PositionIcon position="support" size={12} className="opacity-60" /> 서포터</div>
                <SelectedChampion name={mySup} position="support" borderColor="border-blue-400/30 bg-blue-400/10" />
                <input type="text" placeholder="서포터 검색..." value={mySupSearch} onChange={(e) => setMySupSearch(e.target.value)}
                  className="champion-search w-full px-3 py-1.5 text-xs my-1.5" />
                <ChampionGrid position="support" search={mySupSearch} onSelect={setMySup}
                  selectedName={mySup} excludeNames={allSelectedBottom}
                  extraChamps={profileExtraChamps("support")} />
              </div>
            </div>
          </div>

          {/* Enemy bottom */}
          <div className="glass-card p-4">
            <div className="text-sm font-medium text-red-400 mb-3">상대 바텀</div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1"><PositionIcon position="adc" size={12} className="opacity-60" /> 원딜</div>
                <SelectedChampion name={enemyAdc} position="adc" borderColor="border-red-500/30 bg-red-500/10" />
                <input type="text" placeholder="원딜 검색..." value={enemyAdcSearch} onChange={(e) => setEnemyAdcSearch(e.target.value)}
                  className="champion-search w-full px-3 py-1.5 text-xs my-1.5" />
                <ChampionGrid position="adc" search={enemyAdcSearch} onSelect={setEnemyAdc}
                  selectedName={enemyAdc} excludeNames={allSelectedBottom}
                  extraChamps={profileExtraChamps("adc")} />
              </div>
              <div className="border-t border-[var(--border-color)] pt-3">
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1"><PositionIcon position="support" size={12} className="opacity-60" /> 서포터</div>
                <SelectedChampion name={enemySup} position="support" borderColor="border-red-400/30 bg-red-400/10" />
                <input type="text" placeholder="서포터 검색..." value={enemySupSearch} onChange={(e) => setEnemySupSearch(e.target.value)}
                  className="champion-search w-full px-3 py-1.5 text-xs my-1.5" />
                <ChampionGrid position="support" search={enemySupSearch} onSelect={setEnemySup}
                  selectedName={enemySup} excludeNames={allSelectedBottom}
                  extraChamps={profileExtraChamps("support")} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results — 솔로라인: 룰 엔진 가이드 우선, 없으면 기존 방식 폴백 */}
      {soloMatchupGuide && <MatchupGuideResult guide={soloMatchupGuide} myJunglePath={myProfile?.junglePath} />}
      {hasSoloResult && !soloMatchupGuide && <SoloMatchupResult myChamp={myChamp} enemyChamp={enemyChamp} />}

      {/* 바텀: 듀오 분석 (항상 표시) */}
      {hasBottomResult && <BottomMatchupResult myAdc={myAdcChamp} mySup={mySupChamp} enemyAdc={enemyAdcChamp} enemySup={enemySupChamp} />}

      {/* 바텀 ADC 1v1 심층 가이드 */}
      {adcMatchupGuide && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <PositionIcon position="adc" size={18} />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">ADC 매치업 심층 가이드</h2>
          </div>
          <MatchupGuideResult guide={adcMatchupGuide} />
        </div>
      )}

      {/* 바텀 서포터 1v1 심층 가이드 */}
      {supMatchupGuide && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <PositionIcon position="support" size={18} />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">서포터 매치업 심층 가이드</h2>
          </div>
          <MatchupGuideResult guide={supMatchupGuide} />
        </div>
      )}

      {/* 프로파일 없는 선택 안내 (솔로라인에서 룰엔진 폴백 없는 경우) */}
      {!isBottom && hasSoloResult && !soloMatchupGuide && (
        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-[var(--text-muted)]">
          💡 이 매치업은 기본 승률 데이터만 표시됩니다. <b>파란 테두리 + &quot;공략&quot; 배지</b>가 붙은 챔프끼리 선택하면 L0~L4 심층 가이드가 활성화됩니다.
          <div className="mt-1.5 text-[10px]">
            {soloPosition} 라인 공략 제공 챔프: {Object.values(PROFILE_REGISTRY[soloPosition]).map(p => p.name).join(", ")}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasSoloResult && !hasBottomResult && !soloMatchupGuide && (
        <div className="glass-card p-12 text-center">
          <div className="flex justify-center gap-2 mb-4">{isBottom ? (<><PositionIcon position="adc" size={40} /><PositionIcon position="support" size={40} /></>) : <PositionIcon position="top" size={40} />}</div>
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            {isBottom ? "양쪽 원딜 + 서포터를 선택해주세요" : "양쪽 챔피언을 선택해주세요"}
          </p>
        </div>
      )}
    </div>
  );
}
