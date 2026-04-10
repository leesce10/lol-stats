import ChampionTable from "@/components/ChampionTable";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">챔피언 통계</h1>
        <p className="text-[var(--text-secondary)]">
          모든 챔피언의 승률, 픽률, 밴률, 선픽 점수를 한눈에 확인하세요.
        </p>
      </div>

      <ChampionTable />
    </div>
  );
}
