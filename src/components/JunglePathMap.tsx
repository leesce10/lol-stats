"use client";

import Image from "next/image";
import { DDRAGON_VERSION } from "@/data/champions";

/**
 * 정글 동선 미니맵 시각화.
 * DDragon 미니맵 위에 캠프 번호 + 경로선 오버레이.
 */

const MINIMAP_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/map/map11.png`;

// 캠프 위치 (% 기준, DDragon 미니맵 좌표계: 0,0=좌상단 100,100=우하단)
// 블루 사이드 기준 (아군 정글)
const CAMPS: Record<string, { x: number; y: number; label: string }> = {
  blue_blue:   { x: 22, y: 71, label: "블루" },
  blue_gromp:  { x: 15, y: 66, label: "개미" },
  blue_wolves: { x: 26, y: 60, label: "늑대" },
  blue_raptors:{ x: 42, y: 50, label: "닭" },
  blue_red:    { x: 36, y: 46, label: "레드" },
  blue_krugs:  { x: 47, y: 56, label: "두꺼비" },
  // 스커틀
  scuttle_bot: { x: 52, y: 58, label: "바텀게" },
  scuttle_top: { x: 42, y: 38, label: "탑게" },
};

// 텍스트 → 캠프 키 매핑
const CAMP_ALIASES: Record<string, string> = {
  "레드": "blue_red",
  "블루": "blue_blue",
  "개미": "blue_gromp",
  "두꺼비": "blue_krugs",
  "늑대": "blue_wolves",
  "닭": "blue_raptors",
  "바텀게": "scuttle_bot",
  "탑게": "scuttle_top",
  "red": "blue_red",
  "blue": "blue_blue",
  "gromp": "blue_gromp",
  "krugs": "blue_krugs",
  "wolves": "blue_wolves",
  "raptors": "blue_raptors",
};

export default function JunglePathMap({ camps, size = 300 }: { camps: string[]; size?: number }) {
  const resolved = camps
    .map(name => {
      const key = CAMP_ALIASES[name];
      if (!key || !CAMPS[key]) return null;
      return { ...CAMPS[key], key };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (resolved.length === 0) return null;

  return (
    <div>
      <div className="relative inline-block rounded-lg overflow-hidden" style={{ width: size, height: size }}>
        {/* 미니맵 배경 */}
        <Image
          src={MINIMAP_URL}
          alt="미니맵"
          width={size}
          height={size}
          className="block"
          unoptimized
        />

        {/* 오버레이: 경로선 + 캠프 번호 */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
        >
          {/* 경로선 */}
          {resolved.map((camp, i) => {
            if (i === 0) return null;
            const prev = resolved[i - 1];
            return (
              <line
                key={`line-${i}`}
                x1={prev.x} y1={prev.y}
                x2={camp.x} y2={camp.y}
                stroke="#4a9eff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* 캠프 마커 */}
          {resolved.map((camp, i) => (
            <g key={`camp-${i}`}>
              {/* 외곽 원 */}
              <circle cx={camp.x} cy={camp.y} r="4" fill="#1a2332" stroke="#4a9eff" strokeWidth="1" />
              {/* 번호 */}
              <text
                x={camp.x} y={camp.y + 1.5}
                textAnchor="middle"
                fontSize="4.5"
                fontWeight="bold"
                fill="white"
              >
                {i + 1}
              </text>
              {/* 시작점 Start 라벨 */}
              {i === 0 && (
                <g>
                  <rect x={camp.x - 5} y={camp.y + 5} width="10" height="4" rx="1" fill="#4a9eff" />
                  <text x={camp.x} y={camp.y + 8} textAnchor="middle" fontSize="2.5" fontWeight="bold" fill="white">Start</text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
        {resolved.map((camp, i) => (
          <span key={i} className="text-[10px] text-[var(--text-muted)]">
            <span className="text-[#4a9eff] font-bold">{i + 1}</span> {camp.label}
          </span>
        ))}
      </div>
    </div>
  );
}
