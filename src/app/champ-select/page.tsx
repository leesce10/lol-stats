"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { allChampions, type ChampionMeta } from "@/data/all-champions";
import { DDRAGON_VERSION } from "@/data/champions";
import {
  generateChampSelectGuide,
  type TeamSlot,
  type TeamComp,
} from "@/lib/champ-select-analyzer";

function getChampionImageUrl(name: string): string {
  const normalized = name.replace(/[\s']/g, "").replace("Wukong", "MonkeyKing");
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalized}.png`;
}

function ChampionPicker({
  selected,
  onSelect,
  search,
  setSearch,
  excludeIds,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  search: string;
  setSearch: (v: string) => void;
  excludeIds: Set<string>;
}) {
  const filtered = allChampions.filter((c) => {
    if (c.id !== selected && excludeIds.has(c.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.nameKr.includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="검색..."
        className="champion-search w-full px-2 py-1 text-xs mb-1"
      />
      <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
        {filtered.slice(0, 60).map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            title={c.nameKr}
            className={`champion-grid-item p-0.5 flex flex-col items-center ${
              c.id === selected ? "selected" : ""
            }`}
          >
            <div className="relative h-7 w-7 overflow-hidden rounded">
              <Image
                src={getChampionImageUrl(c.id)}
                alt={c.nameKr}
                width={28}
                height={28}
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-[8px] text-[var(--text-secondary)] mt-0.5 truncate w-full text-center">
              {c.nameKr}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamSlotRow({
  team,
  index,
  label,
  selected,
  onSelect,
  side,
  excludeIds,
}: {
  team: string;
  index: number;
  label: string;
  selected: TeamSlot;
  onSelect: (id: string | null) => void;
  side: "blue" | "red";
  excludeIds: Set<string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const meta = selected ? allChampions.find((c) => c.id === selected) : null;

  const borderClass = side === "blue" ? "border-blue-500/40" : "border-red-500/40";
  const bgClass = side === "blue" ? "bg-blue-500/5" : "bg-red-500/5";

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-2`}>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold ${side === "blue" ? "text-blue-400" : "text-red-400"} w-10 shrink-0`}>
          {label}
        </span>
        {meta ? (
          <>
            <div className="relative h-8 w-8 overflow-hidden rounded">
              <Image src={getChampionImageUrl(meta.id)} alt={meta.nameKr} width={32} height={32} className="object-cover" unoptimized />
            </div>
            <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{meta.nameKr}</span>
            <button
              onClick={() => {
                onSelect(null);
                setExpanded(false);
              }}
              className="text-[10px] text-[var(--text-muted)] hover:text-red-400"
            >
              ×
            </button>
          </>
        ) : (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-xs text-[var(--text-muted)] text-left hover:text-[var(--text-primary)]"
          >
            {expanded ? "닫기" : "+ 선택"}
          </button>
        )}
      </div>
      {expanded && !meta && (
        <div className="mt-2">
          <ChampionPicker
            selected={selected}
            onSelect={(id) => {
              onSelect(id);
              setExpanded(false);
              setSearch("");
            }}
            search={search}
            setSearch={setSearch}
            excludeIds={excludeIds}
          />
        </div>
      )}
    </div>
  );
}

const SLOT_LABELS = ["탑", "정글", "미드", "원딜", "서폿"];

export default function ChampSelectPage() {
  const [comp, setComp] = useState<TeamComp>({
    blue: [null, null, null, null, null],
    red: [null, null, null, null, null],
  });

  const excludeIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of [...comp.blue, ...comp.red]) if (id) s.add(id);
    return s;
  }, [comp]);

  const updateSlot = (side: "blue" | "red", idx: number, id: string | null) => {
    setComp((prev) => {
      const next = { ...prev, [side]: [...prev[side]] };
      next[side][idx] = id;
      return next;
    });
  };

  const filledCount = [...comp.blue, ...comp.red].filter(Boolean).length;
  const guide = useMemo(() => {
    if (filledCount < 6) return null; // 최소 6명 이상
    return generateChampSelectGuide(comp);
  }, [comp, filledCount]);

  const clearAll = () => {
    setComp({
      blue: [null, null, null, null, null],
      red: [null, null, null, null, null],
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 text-[10px] text-[var(--text-secondary)] mb-3">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)] animate-pulse" />
          BETA · 챔셀 코치
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          챔셀 코치
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          블루/레드 10명 입력 → 시간대별 행동 지침과 한타 우선순위까지 30초 안에.
        </p>
      </div>

      {/* 입력 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 블루팀 */}
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-blue-400">🔵 블루팀 (내 팀)</h2>
            <span className="text-[10px] text-[var(--text-muted)]">
              {comp.blue.filter(Boolean).length}/5
            </span>
          </div>
          <div className="space-y-1.5">
            {comp.blue.map((slot, i) => (
              <TeamSlotRow
                key={`blue-${i}`}
                team="blue"
                index={i}
                label={SLOT_LABELS[i]}
                selected={slot}
                side="blue"
                onSelect={(id) => updateSlot("blue", i, id)}
                excludeIds={excludeIds}
              />
            ))}
          </div>
        </div>

        {/* 레드팀 */}
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-red-400">🔴 레드팀 (적)</h2>
            <span className="text-[10px] text-[var(--text-muted)]">
              {comp.red.filter(Boolean).length}/5
            </span>
          </div>
          <div className="space-y-1.5">
            {comp.red.map((slot, i) => (
              <TeamSlotRow
                key={`red-${i}`}
                team="red"
                index={i}
                label={SLOT_LABELS[i]}
                selected={slot}
                side="red"
                onSelect={(id) => updateSlot("red", i, id)}
                excludeIds={excludeIds}
              />
            ))}
          </div>
        </div>
      </div>

      {filledCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs text-[var(--text-muted)] hover:text-red-400 mb-4"
        >
          전부 초기화
        </button>
      )}

      {/* 결과 */}
      {!guide && (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            블루/레드 합쳐 최소 <b className="text-[var(--text-primary)]">6명 이상</b> 선택해야 분석이 활성화됩니다.
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            현재 {filledCount}/10
          </p>
        </div>
      )}

      {guide && (
        <div className="space-y-4 animate-fade-in">
          {/* L0: 한 줄 핵심 */}
          <div className="glass-card p-5 border-l-4 border-[var(--accent-blue)]">
            <h3 className="text-xs font-bold text-[var(--accent-blue)] mb-2">💡 한 줄 핵심</h3>
            <p className="text-base font-bold text-[var(--text-primary)]">{guide.oneLineKey}</p>
          </div>

          {/* 팀 성향 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4 border border-blue-500/30">
              <h3 className="text-xs font-bold text-blue-400 mb-2">블루팀 성향</h3>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {guide.blueAnalysis.archetypeKr}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{guide.blueAnalysis.summary}</p>
            </div>
            <div className="glass-card p-4 border border-red-500/30">
              <h3 className="text-xs font-bold text-red-400 mb-2">레드팀 성향</h3>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {guide.redAnalysis.archetypeKr}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{guide.redAnalysis.summary}</p>
            </div>
          </div>

          {/* 시간대별 행동 */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">⏱️ 시간대별 행동 지침</h3>
            <div className="space-y-3">
              {guide.phases.map((p) => (
                <div key={p.phase}>
                  <div className="text-xs font-bold text-[var(--accent-purple)] mb-1.5">
                    {p.phase === "early" ? "🌅" : p.phase === "mid" ? "⚔️" : "🏆"} {p.label}
                  </div>
                  <ul className="space-y-1">
                    {p.guidance.map((g, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        ✓ {g}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 흔한 함정 */}
          {guide.pitfalls.length > 0 && (
            <div className="glass-card p-5 border-l-4 border-orange-500/50">
              <h3 className="text-sm font-bold text-orange-400 mb-3">⚠️ 흔한 함정</h3>
              <ul className="space-y-2">
                {guide.pitfalls.map((p, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)] leading-relaxed flex gap-2">
                    <span className="text-orange-400 shrink-0">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 한타 우선순위 */}
          {guide.priorityOrder.length > 0 && (
            <div className="glass-card p-5 border-l-4 border-red-500/50">
              <h3 className="text-sm font-bold text-red-400 mb-3">🎯 한타 우선순위 (적 순서)</h3>
              <ol className="space-y-2">
                {guide.priorityOrder.map((p, i) => (
                  <li key={p.championId} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-red-400 w-5 shrink-0 text-center">
                      {i + 1}
                    </span>
                    <div className="relative h-8 w-8 overflow-hidden rounded shrink-0">
                      <Image
                        src={getChampionImageUrl(p.championId)}
                        alt={p.nameKr}
                        width={32}
                        height={32}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{p.nameKr}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{p.reason}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 메타 */}
          <p className="text-center text-[10px] text-[var(--text-muted)]">
            챔셀 코치 BETA · 룰 엔진 기반 분석 · 패치 15.7
          </p>
        </div>
      )}
    </div>
  );
}
