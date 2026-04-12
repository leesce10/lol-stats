"use client";

/**
 * 정글 동선 미니맵 시각화.
 * SVG 기반. 캠프 위치에 번호 매기고 선으로 연결.
 */

// 캠프 위치 (% 기준, 512x512 맵)
const CAMPS: Record<string, { x: number; y: number; label: string; color: string }> = {
  // 블루 사이드 (좌하단)
  blue_red:    { x: 47, y: 49, label: "레드", color: "#ef4444" },
  blue_blue:   { x: 28, y: 71, label: "블루", color: "#3b82f6" },
  blue_gromp:  { x: 20, y: 66, label: "개미", color: "#8b5cf6" },
  blue_wolves: { x: 30, y: 62, label: "늑대", color: "#6b7280" },
  blue_raptors:{ x: 43, y: 56, label: "닭", color: "#f59e0b" },
  blue_krugs:  { x: 55, y: 54, label: "두꺼비", color: "#a3a3a3" },
  // 레드 사이드 (우상단)
  red_red:     { x: 53, y: 51, label: "레드", color: "#ef4444" },
  red_blue:    { x: 72, y: 29, label: "블루", color: "#3b82f6" },
  red_gromp:   { x: 80, y: 34, label: "개미", color: "#8b5cf6" },
  red_wolves:  { x: 70, y: 38, label: "늑대", color: "#6b7280" },
  red_raptors: { x: 57, y: 44, label: "닭", color: "#f59e0b" },
  red_krugs:   { x: 45, y: 46, label: "두꺼비", color: "#a3a3a3" },
  // 공용
  scuttle_bot: { x: 52, y: 62, label: "바텀게", color: "#06b6d4" },
  scuttle_top: { x: 48, y: 38, label: "탑게", color: "#06b6d4" },
};

// 텍스트 캠프명 → 캠프 키 매핑 (블루 사이드 기준)
const CAMP_ALIASES: Record<string, string> = {
  "레드": "blue_red",
  "블루": "blue_blue",
  "개미": "blue_gromp",
  "두꺼비": "blue_krugs",
  "늑대": "blue_wolves",
  "닭": "blue_raptors",
  "바텀 게": "scuttle_bot",
  "탑 게": "scuttle_top",
  "바텀게": "scuttle_bot",
  "탑게": "scuttle_top",
  // 영어
  "red": "blue_red",
  "blue": "blue_blue",
  "gromp": "blue_gromp",
  "krugs": "blue_krugs",
  "wolves": "blue_wolves",
  "raptors": "blue_raptors",
};

export interface JunglePath {
  camps: string[]; // 순서대로 캠프명 (예: ["레드", "블루", "개미", "두꺼비"])
  side?: "blue" | "red";
}

export default function JunglePathMap({ path, size = 280 }: { path: JunglePath; size?: number }) {
  const resolvedCamps = path.camps
    .map(name => {
      const key = CAMP_ALIASES[name];
      if (!key) return null;
      return { ...CAMPS[key], key };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (resolvedCamps.length === 0) return null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="rounded-lg overflow-hidden">
        {/* 배경 */}
        <rect width="100" height="100" fill="#0a0e13" />

        {/* 강 (대각선) */}
        <line x1="15" y1="85" x2="85" y2="15" stroke="#1a3a4a" strokeWidth="8" strokeLinecap="round" opacity="0.4" />

        {/* 라인 (희미하게) */}
        <line x1="10" y1="10" x2="10" y2="50" stroke="#1e293b" strokeWidth="0.8" /> {/* 탑 */}
        <line x1="10" y1="10" x2="50" y2="10" stroke="#1e293b" strokeWidth="0.8" />
        <line x1="15" y1="15" x2="85" y2="85" stroke="#1e293b" strokeWidth="0.8" /> {/* 미드 */}
        <line x1="90" y1="50" x2="90" y2="90" stroke="#1e293b" strokeWidth="0.8" /> {/* 봇 */}
        <line x1="50" y1="90" x2="90" y2="90" stroke="#1e293b" strokeWidth="0.8" />

        {/* 정글 영역 구분 */}
        <rect x="15" y="45" width="35" height="42" rx="3" fill="#111827" opacity="0.5" /> {/* 블루 정글 */}
        <rect x="50" y="13" width="35" height="42" rx="3" fill="#111827" opacity="0.5" /> {/* 레드 정글 */}

        {/* 모든 캠프 위치 (희미하게) */}
        {Object.entries(CAMPS).map(([key, camp]) => (
          <circle
            key={key}
            cx={camp.x}
            cy={camp.y}
            r="2"
            fill={camp.color}
            opacity="0.15"
          />
        ))}

        {/* 동선 경로선 */}
        {resolvedCamps.map((camp, i) => {
          if (i === 0) return null;
          const prev = resolvedCamps[i - 1];
          return (
            <line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={camp.x}
              y2={camp.y}
              stroke="#3b82f6"
              strokeWidth="1.2"
              strokeDasharray="2 1"
              opacity="0.7"
            />
          );
        })}

        {/* 동선 화살표 (마지막 구간) */}
        {resolvedCamps.length >= 2 && (() => {
          const last = resolvedCamps[resolvedCamps.length - 1];
          const prev = resolvedCamps[resolvedCamps.length - 2];
          const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
          const ax = last.x - Math.cos(angle) * 3;
          const ay = last.y - Math.sin(angle) * 3;
          return (
            <polygon
              points={`${last.x},${last.y} ${ax - Math.cos(angle - 0.5) * 2},${ay - Math.sin(angle - 0.5) * 2} ${ax - Math.cos(angle + 0.5) * 2},${ay - Math.sin(angle + 0.5) * 2}`}
              fill="#3b82f6"
              opacity="0.7"
            />
          );
        })()}

        {/* 캠프 번호 표시 */}
        {resolvedCamps.map((camp, i) => (
          <g key={`camp-${i}`}>
            {/* 배경 원 */}
            <circle
              cx={camp.x}
              cy={camp.y}
              r="3.5"
              fill={i === 0 ? "#3b82f6" : "#1e293b"}
              stroke={camp.color}
              strokeWidth="0.8"
            />
            {/* 번호 */}
            <text
              x={camp.x}
              y={camp.y + 1.2}
              textAnchor="middle"
              fontSize="3.5"
              fontWeight="bold"
              fill="white"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
        {resolvedCamps.map((camp, i) => (
          <span key={i} className="text-[9px] text-[var(--text-muted)]">
            <span className="text-[var(--accent-blue)] font-bold">{i + 1}</span> {camp.label}
          </span>
        ))}
      </div>
    </div>
  );
}
