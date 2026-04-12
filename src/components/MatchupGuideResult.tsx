"use client";

import { useState } from "react";
import type { MatchupGuide } from "@/types/matchup-engine";
import JunglePathMap from "./JunglePathMap";

// ============================================================
// L0 — 한 줄 판정
// ============================================================
function VerdictSection({ guide }: { guide: MatchupGuide }) {
  const { verdict } = guide;
  const colorClass =
    verdict.label === "유리"
      ? "text-green-400 bg-green-500/10 border-green-500/30"
      : verdict.label === "불리"
        ? "text-red-400 bg-red-500/10 border-red-500/30"
        : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

  const barColor =
    verdict.label === "유리"
      ? "from-green-500 to-green-400"
      : verdict.label === "불리"
        ? "from-red-500 to-red-400"
        : "from-yellow-500 to-yellow-400";

  return (
    <div className="glass-card p-5">
      {/* 승률 바 */}
      <div className="flex justify-between text-sm mb-1.5">
        <span
          className="font-bold"
          style={{ color: verdict.winRate >= 50 ? "var(--accent-blue)" : "var(--text-secondary)" }}
        >
          {verdict.winRate}%
        </span>
        <span
          className="font-bold"
          style={{ color: verdict.winRate < 50 ? "var(--accent-red)" : "var(--text-secondary)" }}
        >
          {(100 - verdict.winRate).toFixed(1)}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
        <div
          className={`h-full transition-all duration-500 bg-gradient-to-r ${verdict.winRate >= 50 ? "from-blue-500 to-blue-400" : "from-gray-500 to-gray-400"}`}
          style={{ width: `${verdict.winRate}%` }}
        />
        <div
          className={`h-full transition-all duration-500 bg-gradient-to-r ${verdict.winRate < 50 ? "from-red-500 to-red-400" : "from-gray-500 to-gray-400"}`}
          style={{ width: `${100 - verdict.winRate}%` }}
        />
      </div>

      {/* 라벨 + 본질 */}
      <div className="mt-4 text-center">
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${colorClass}`}>
          {verdict.label}
        </span>
      </div>
      <p className="text-center mt-3 text-sm text-[var(--text-secondary)] font-medium">
        {verdict.essence}
      </p>
    </div>
  );
}

// ============================================================
// L1 — 3줄 요약
// ============================================================
function SummarySection({ guide }: { guide: MatchupGuide }) {
  const { summary } = guide;
  return (
    <div className="glass-card p-5">
      <div className="space-y-2.5">
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-[var(--accent-blue)] bg-blue-500/10 rounded px-1.5 py-0.5 shrink-0">핵심</span>
          <p className="text-sm text-[var(--text-primary)]">{summary.line1}</p>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-[var(--accent-gold)] bg-yellow-500/10 rounded px-1.5 py-0.5 shrink-0">조건</span>
          <p className="text-sm text-[var(--text-primary)]">{summary.line2}</p>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-[var(--accent-purple)] bg-purple-500/10 rounded px-1.5 py-0.5 shrink-0">운영</span>
          <p className="text-sm text-[var(--text-primary)]">{summary.line3}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// L2 — 4개 카드
// ============================================================

function MustDodgeCard({ guide }: { guide: MatchupGuide }) {
  if (guide.mustDodge.length === 0) return null;
  return (
    <div className="glass-card p-4 border-l-4 border-red-500/50">
      <h3 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        필수 회피
      </h3>
      <div className="space-y-3">
        {guide.mustDodge.map((skill) => (
          <div key={skill.skillKey}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {skill.skillKey} — {skill.skillName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                {skill.type}
              </span>
            </div>
            <div className="flex gap-3 text-[10px] text-[var(--text-muted)] mb-1.5">
              {skill.range && <span>사거리 {skill.range}</span>}
              {skill.cooldown && <span>쿨 {skill.cooldown}초</span>}
            </div>
            <p className="text-xs text-red-300/80 mb-1">{skill.hitConsequence}</p>
            <p className="text-xs text-[var(--text-secondary)]">{skill.counterMethod}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PunishWindowCard({ guide }: { guide: MatchupGuide }) {
  if (guide.punishWindows.length === 0) return null;
  return (
    <div className="glass-card p-4 border-l-4 border-green-500/50">
      <h3 className="text-xs font-bold text-green-400 mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        반격 윈도우
      </h3>
      <div className="space-y-3">
        {guide.punishWindows.map((pw, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-[var(--text-primary)]">{pw.condition}</span>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                {pw.windowSec}초
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">{pw.reason}</p>
            <p className="text-xs text-green-300/80">{pw.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PowerSpikeCard({ guide }: { guide: MatchupGuide }) {
  const { powerSpikes } = guide;
  return (
    <div className="glass-card p-4 border-l-4 border-blue-500/50">
      <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        파워 스파이크
      </h3>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400 w-8 shrink-0">나</span>
          <div className="flex gap-1 flex-wrap">
            {powerSpikes.mySpikes.map((lvl) => (
              <span key={lvl} className="text-[10px] font-bold bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded">
                Lv.{lvl}
              </span>
            ))}
            {powerSpikes.myWeakAfter && (
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                {powerSpikes.myWeakAfter}렙 이후 약화
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-red-400 w-8 shrink-0">상대</span>
          <div className="flex gap-1 flex-wrap">
            {powerSpikes.enemySpikes.map((lvl) => (
              <span key={lvl} className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">
                Lv.{lvl}
              </span>
            ))}
            {powerSpikes.enemyWeakAfter && (
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                {powerSpikes.enemyWeakAfter}렙 이후 약화
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">{powerSpikes.summary}</p>
    </div>
  );
}

function BuildAdviceCard({ guide }: { guide: MatchupGuide }) {
  const { buildAdvice } = guide;
  return (
    <div className="glass-card p-4 border-l-4 border-purple-500/50">
      <h3 className="text-xs font-bold text-purple-400 mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        빌드 추천
      </h3>
      <div className="space-y-2">
        <div>
          <span className="text-[10px] text-[var(--text-muted)]">스펠</span>
          <p className="text-xs text-[var(--text-primary)]">{buildAdvice.spellReason}</p>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)]">룬</span>
          <p className="text-xs text-[var(--text-primary)]">{buildAdvice.runeReason}</p>
        </div>
        {buildAdvice.coreItem && (
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">아이템</span>
            <p className="text-xs text-purple-300/80 font-medium">{buildAdvice.coreItem}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{buildAdvice.itemReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// L3 — 페이즈별 운영 (접힘)
// ============================================================
function PhaseGuideSection({ guide }: { guide: MatchupGuide }) {
  const [open, setOpen] = useState(false);
  const [activePhase, setActivePhase] = useState<"early" | "mid" | "late">("early");
  const phase = guide.phases[activePhase];

  const phaseLabels = {
    early: { label: "초반 (1~6)", color: "text-orange-400" },
    mid: { label: "중반 (6~14)", color: "text-blue-400" },
    late: { label: "후반 (14+)", color: "text-purple-400" },
  };

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <h3 className="text-sm font-bold text-[var(--text-primary)]">페이즈별 운영 가이드</h3>
        <span className="text-[var(--text-muted)] text-xs">{open ? "접기" : "펼치기"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {/* 탭 */}
          <div className="flex gap-1 mb-4">
            {(["early", "mid", "late"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePhase(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activePhase === p
                    ? "bg-[var(--accent-blue)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {phaseLabels[p].label}
              </button>
            ))}
          </div>

          {/* 페이즈 내용 */}
          <div className="space-y-3">
            <PhaseRow label="핵심 목표" text={phase.goal} color="text-blue-400" />
            <PhaseRow label="상대의 의도" text={phase.enemyIntent} color="text-red-400" />
            <PhaseRow label="주의 타이밍" text={phase.dangerTiming} color="text-orange-400" />
            <PhaseRow label="활용 타이밍" text={phase.opportunityTiming} color="text-green-400" />
            <PhaseRow label="동선/오브젝트" text={phase.pathing} color="text-cyan-400" />
            <PhaseRow label="카정/갱" text={phase.gankCounterjungle} color="text-yellow-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseRow({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className={`text-[10px] font-bold ${color} bg-[var(--bg-tertiary)] rounded px-1.5 py-0.5 shrink-0 min-w-[72px] text-center`}>
        {label}
      </span>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{text}</p>
    </div>
  );
}

// ============================================================
// L4-B — 매치업 한정 변형 (접힘)
// ============================================================
function ChampOverrideSection({ guide }: { guide: MatchupGuide }) {
  const [open, setOpen] = useState(false);

  if (guide.champOverride.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <h3 className="text-sm font-bold text-[var(--text-primary)]">이 매치업 한정 변형</h3>
        <span className="text-[var(--text-muted)] text-xs">{open ? "접기" : "펼치기"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {guide.champOverride.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-yellow-400 shrink-0 text-xs mt-0.5">*</span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 메인 컴포넌트
// ============================================================
export default function MatchupGuideResult({ guide, myJunglePath }: { guide: MatchupGuide; myJunglePath?: string[] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* L0 */}
      <VerdictSection guide={guide} />

      {/* L1 */}
      <SummarySection guide={guide} />

      {/* L2 — 2x2 그리드 (데스크탑), 스택 (모바일) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MustDodgeCard guide={guide} />
        <PunishWindowCard guide={guide} />
        <PowerSpikeCard guide={guide} />
        <BuildAdviceCard guide={guide} />
      </div>

      {/* 추천 정글 동선 미니맵 */}
      {myJunglePath && myJunglePath.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">추천 초반 동선</h3>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <JunglePathMap camps={myJunglePath} size={260} />
            <div className="flex-1 text-xs text-[var(--text-secondary)] space-y-1.5">
              <p>{guide.phases.early.pathing}</p>
              <p className="text-[var(--text-muted)]">{guide.phases.early.gankCounterjungle}</p>
            </div>
          </div>
        </div>
      )}

      {/* L3 */}
      <PhaseGuideSection guide={guide} />

      {/* L4-B */}
      <ChampOverrideSection guide={guide} />

      {/* 메타 */}
      <p className="text-center text-[10px] text-[var(--text-muted)]">
        룰 엔진 기반 분석 (v2) &middot; 패치 데이터 변경 시 자동 재계산
      </p>
    </div>
  );
}
