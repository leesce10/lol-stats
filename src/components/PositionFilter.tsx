"use client";

import { Position, POSITION_LABELS, POSITION_ICONS } from "@/types";

interface PositionFilterProps {
  selected: Position | "all";
  onChange: (position: Position | "all") => void;
}

export default function PositionFilter({
  selected,
  onChange,
}: PositionFilterProps) {
  const positions: (Position | "all")[] = [
    "all",
    "top",
    "jungle",
    "mid",
    "adc",
    "support",
  ];

  return (
    <div className="flex items-center gap-1">
      {positions.map((pos) => {
        const isActive = selected === pos;
        const label = pos === "all" ? "전체" : POSITION_LABELS[pos];
        const icon = pos === "all" ? "🎮" : POSITION_ICONS[pos];

        return (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
