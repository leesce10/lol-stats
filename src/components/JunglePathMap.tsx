"use client";

import Image from "next/image";
import { DDRAGON_VERSION } from "@/data/champions";

/**
 * 정글 동선 미니맵 시각화.
 * DDragon 미니맵 위에 캠프 번호 + 경로선 오버레이.
 */

const MINIMAP_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/map/map11.png`;

// 캠프 위치 (% 기준, DDragon map11.png 좌표계: 0,0=좌상단 100,100=우하단)
// 게임 내 좌표를 이미지 좌표로 변환: image_x = game_x/14870*100, image_y = 100 - game_y/14870*100
// 블루 사이드 기준
const CAMPS: Record<string, { x: number; y: number; label: string }> = {
  blue_blue:   { x: 26, y: 47, label: "블루" },    // 좌상단 영역
  blue_gromp:  { x: 14, y: 43, label: "개미" },    // 블루 왼쪽
  blue_wolves: { x: 26, y: 57, label: "늑대" },    // 블루 아래
  blue_raptors:{ x: 47, y: 63, label: "닭" },      // 중앙
  blue_red:    { x: 53, y: 73, label: "레드" },     // 우하단 영역
  blue_krugs:  { x: 57, y: 83, label: "두꺼비" },   // 가장 하단
  // 스커틀
  scuttle_top: { x: 31, y: 36, label: "탑게" },
  scuttle_bot: { x: 68, y: 69, label: "바텀게" },
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
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* 캠프 마커 */}
          {resolved.map((camp, i) => (
            <g key={`camp-${i}`}>
              {/* 외곽 원 (그림자 효과) */}
              <circle cx={camp.x} cy={camp.y} r="5.5" fill="rgba(0,0,0,0.6)" />
              {/* 메인 원 */}
              <circle cx={camp.x} cy={camp.y} r="4.5" fill={i === 0 ? "#4a9eff" : "#1a2332"} stroke="#4a9eff" strokeWidth="1.2" />
              {/* 번호 */}
              <text
                x={camp.x} y={camp.y + 1.8}
                textAnchor="middle"
                fontSize="5"
                fontWeight="bold"
                fill="white"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
              >
                {i + 1}
              </text>
              {/* 시작점 Start 라벨 */}
              {i === 0 && (
                <g>
                  <rect x={camp.x - 6} y={camp.y + 6} width="12" height="5" rx="1.5" fill="#4a9eff" />
                  <text x={camp.x} y={camp.y + 9.5} textAnchor="middle" fontSize="3" fontWeight="bold" fill="white">Start</text>
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
