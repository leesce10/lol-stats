"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/stats", label: "챔피언 통계", icon: "📊" },
  { href: "/matchup", label: "맞라인 분석", icon: "⚔️" },
  { href: "/team", label: "조합 분석기", icon: "👥" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
              L
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              LOL Stats
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Patch badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              Patch 15.7
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
