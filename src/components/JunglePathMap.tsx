"use client";

import Image from "next/image";

/**
 * 정글 동선 미니맵 시각화.
 * 실제 롤 미니맵 이미지 위에 캠프 번호 + 경로선 오버레이.
 */

const MINIMAP_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-match-history/global/default/minimap-ig-sr.png";

// 캠프 위치 (% 기준, 실제 미니맵 좌표)
const CAMPS: Record<string, { x: number; y: number; label: string; color: string }> = {
  // 블루 사이드 (좌하단)
  blue_red:    { x: 36, y: 58, label: "레드", color: "#ef4444" },
  blue_blue:   { x: 22, y: 72, label: "블루", color: "#3b82f6" },
  blue_gromp:  { x: 15, y: 66, label: "개미", color: "#8b5cf6" },
  blue_wolves: { x: 25, y: 64, label: "늑대", color: "#6b7280" },
  blue_raptors:{ x: 40, y: 54, label: "닭", color: "#f59e0b" },
  blue_krugs:  { x: 46, y: 60, label: "두꺼비", color: "#a3a3a3" },
  // 레드 사이드 (우상단)
  red_red:     { x: 64, y: 42, label: "레드", color: "#ef4444" },
  red_blue:    { x: 78, y: 28, label: "블루", color: "#3b82f6" },
  red_gromp:   { x: 85, y: 34, label: "개미", color: "#8b5cf6" },
  red_wolves:  { x: 75, y: 36, label: "늑대", color: "#6b7280" },
  red_raptors: { x: 60, y: 46, label: "닭", color: "#f59e0b" },
  red_krugs:   { x: 54, y: 40, label: "두꺼비", color: "#a3a3a3" },
  // 공용
  scuttle_bot: { x: 52, y: 56, label: "바텀게", color: "#06b6d4" },
  scuttle_top: { x: 48, y: 44, label: "탑게", color: "#06b6d4" },
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
      {/* 실제 미니맵 이미지 */}
      <Image
        src={MINIMAP_URL}
        alt="소환사의 협곡 미니맵"
        width={size}
        height={size}
        className="rounded-lg"
        unoptimized
      />
      {/* SVG 오버레이 */}
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 rounded-lg">
        {/* 모든 캠프 위치 (희미하게) */}
        {Object.entries(CAMPS).map(([key, camp]) => (
          <circle
            key={key}
            cx={camp.x}
            cy={camp.y}
            r="1.5"
            fill={camp.color}
            opacity="0.2"
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
