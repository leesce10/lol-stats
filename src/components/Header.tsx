"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/stats", label: "통계", icon: "📊" },
  { href: "/matchup", label: "맞라인", icon: "⚔️" },
  { href: "/team", label: "조합", icon: "👥" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm sm:text-base font-bold text-white">
              L
            </div>
            <span className="text-base sm:text-lg font-bold gradient-text hidden sm:inline">
              LOL Stats
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-sm sm:text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Patch badge */}
          <span className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-[var(--text-secondary)]">
            P15.7
          </span>
        </div>
      </div>
    </header>
  );
}
