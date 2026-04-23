import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOL Stats - 챔셀 60초, 게임 전에 답을 준다",
  description:
    "챔피언 셀렉트 단계에서 승리 전략을 제시합니다. 맞라인 실전 가이드, 팀 조합 분석, 시간대별 운영 지침까지.",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)] animate-pulse" />
          Patch 15.7 · 챔셀 70초 의사결정 도구
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-[var(--text-primary)]">
          챔셀 60초,
          <br />
          <span className="gradient-text">이 판 어떻게 이겨?</span>
        </h1>

        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          다른 통계 사이트는 게임이 <b className="text-[var(--text-primary)]">끝난 뒤 복기</b>,
          <br className="sm:hidden" /> LOL Stats는 게임이{" "}
          <b className="text-[var(--accent-blue)]">시작되기 전 의사결정</b>.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/matchup"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
          >
            <span>⚔️ 맞라인 실전 가이드 시작</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/team"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-3.5 text-sm sm:text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            👥 팀 조합 분석
          </Link>
        </div>
      </section>

      {/* 차별화 포인트 */}
      <section className="py-10 border-t border-[var(--border-color)]">
        <h2 className="text-center text-xs sm:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-8">
          다른 사이트와 뭐가 다른가
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">메커니즘 기반 공략</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              &quot;승률 48%&quot;로 끝나지 않습니다. <b className="text-[var(--text-primary)]">어떤 스킬을 피해야 하고</b>, 어떤 순간에 반격해야 하는지
              까지 알려줍니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <div className="text-2xl mb-3">⏱️</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">시간대별 행동 지침</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              라인전 / 중반 / 후반 각 페이즈에서{" "}
              <b className="text-[var(--text-primary)]">&quot;지금 뭘 해야 이기는지&quot;</b>를 한눈에. 단순 통계 나열이 아닙니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">모바일 · 한국어 · 광고 최소</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              영어 사이트 번역 안 돌려도 되고, PC 앞에 앉을 필요도 없습니다.{" "}
              <b className="text-[var(--text-primary)]">핵심 영역에 광고 없음</b>.
            </p>
          </div>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="py-10 border-t border-[var(--border-color)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">핵심 기능</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          챔피언 셀렉트 70초 안에 의사결정을 돕는 3가지 도구
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/matchup"
            className="group rounded-xl border-2 border-[var(--accent-blue)]/30 bg-gradient-to-br from-blue-500/5 to-purple-600/5 p-5 hover:border-[var(--accent-blue)] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">⚔️</div>
              <span className="rounded-full bg-[var(--accent-blue)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-blue)]">
                대표 기능
              </span>
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">맞라인 실전 가이드</h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1 mb-3">
              <li>• 내 챔프 vs 상대 챔프 승률</li>
              <li>• 필수 회피 스킬 + 반격 윈도우</li>
              <li>• 시간대별 운영 가이드 (L0~L4)</li>
            </ul>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-blue)]">
              바로 시작 <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>

          <Link
            href="/team"
            className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent-blue)]/50 transition-colors"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">팀 조합 분석</h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1 mb-3">
              <li>• 5v5 전체 조합 승률 예측</li>
              <li>• 탱커 / AD / AP 밸런스</li>
              <li>• 강점 · 약점 자동 도출</li>
            </ul>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]">
              시작하기 <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>

          <Link
            href="/stats"
            className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent-blue)]/50 transition-colors"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">챔피언 통계</h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1 mb-3">
              <li>• 패치 15.7 티어 리스트</li>
              <li>• 포지션별 승률/픽률/밴률</li>
              <li>• 160+ 챔피언 상세 가이드</li>
            </ul>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]">
              살펴보기 <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* 예고 */}
      <section className="py-10 border-t border-[var(--border-color)] mb-8">
        <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-5 sm:p-6 text-center">
          <div className="text-xs font-bold text-[var(--accent-blue)] mb-2">COMING SOON</div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
            챔셀 코치 · 10명 조합 동시 분석
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            블루/레드 10명을 한 번에 입력하면, 시간대별 행동 지침 · 흔한 함정 · 한타 우선순위를
            <br className="hidden sm:inline" /> 30초 안에 답합니다. 한국어·모바일·광고 없음.
          </p>
        </div>
      </section>
    </div>
  );
}
