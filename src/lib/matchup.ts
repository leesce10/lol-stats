import { champions, getChampionById, generateChampionStats } from "@/data/champions";
import { MatchupResult, Position, ChampionData } from "@/types";

function hashPair(a: string, b: string): number {
  let hash = 0;
  const str = a + "|" + b;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getClassAdvantage(myClasses: string[], enemyClasses: string[]): number {
  let advantage = 0;

  // Tanks beat assassins
  if (myClasses.includes("tank") && enemyClasses.includes("assassin")) advantage += 2;
  if (myClasses.includes("assassin") && enemyClasses.includes("tank")) advantage -= 2;

  // Assassins beat mages/enchanters
  if (myClasses.includes("assassin") && (enemyClasses.includes("mage") || enemyClasses.includes("enchanter"))) advantage += 1.5;
  if ((myClasses.includes("mage") || myClasses.includes("enchanter")) && enemyClasses.includes("assassin")) advantage -= 1.5;

  // Fighters beat tanks in lane
  if (myClasses.includes("fighter") && enemyClasses.includes("tank")) advantage += 1;
  if (myClasses.includes("tank") && enemyClasses.includes("fighter")) advantage -= 1;

  // Ranged vs melee advantage in lane
  return advantage;
}

function getRangeAdvantage(my: ChampionData, enemy: ChampionData): number {
  if (my.range === "ranged" && enemy.range === "melee") return 1.5;
  if (my.range === "melee" && enemy.range === "ranged") return -1;
  return 0;
}

function getPhaseDescription(
  myChamp: ChampionData,
  enemyChamp: ChampionData,
  phase: "early" | "mid" | "late",
  advantage: "strong" | "even" | "weak"
): string {
  const myName = myChamp.name;
  const enemyName = enemyChamp.name;

  const descriptions: Record<string, Record<string, string[]>> = {
    early: {
      strong: [
        `${myName}이(가) 레벨 1~6 구간에서 라인 주도권을 잡을 수 있습니다. 적극적으로 트레이드하세요.`,
        `초반 라인전에서 ${myName}이(가) 유리합니다. CS 차이를 벌려보세요.`,
        `${enemyName}은(는) 초반에 약하므로 레벨 2~3 파워 스파이크를 활용하세요.`,
      ],
      even: [
        `초반 라인전은 비슷한 수준입니다. 실력에 따라 갈립니다.`,
        `레벨 1~6 구간에서는 큰 차이가 없습니다. 정글 개입이 중요합니다.`,
      ],
      weak: [
        `${enemyName}이(가) 초반에 강합니다. 무리한 트레이드를 피하고 CS에 집중하세요.`,
        `초반에는 수비적으로 플레이하면서 경험치와 골드를 확보하세요.`,
        `레벨 6 이전에는 ${enemyName}에게 올인을 당하지 않도록 주의하세요.`,
      ],
    },
    mid: {
      strong: [
        `중반 합류 능력이 ${myName}이(가) 더 뛰어납니다. 오브젝트 싸움에 적극 참여하세요.`,
        `중반부터 ${myName}의 파워 스파이크가 시작됩니다. 팀파이트를 유도하세요.`,
      ],
      even: [
        `중반 교전에서는 비슷한 영향력을 발휘합니다. 포지셔닝이 중요합니다.`,
        `오브젝트 파이트에서 팀 조합에 따라 유불리가 달라질 수 있습니다.`,
      ],
      weak: [
        `${enemyName}의 중반 영향력이 더 큽니다. 단독 교전을 피하세요.`,
        `중반에는 팀과 함께 움직이면서 ${enemyName}의 로밍/합류를 견제하세요.`,
      ],
    },
    late: {
      strong: [
        `후반으로 갈수록 ${myName}이(가) 유리해집니다. 게임을 길게 끌어보세요.`,
        `풀빌드 기준으로 ${myName}이(가) 더 강력합니다. 한타에서 역할을 충실히 하세요.`,
      ],
      even: [
        `후반 팀파이트 결과는 팀 조합과 포지셔닝에 따라 달라집니다.`,
        `후반에는 비슷한 수준이므로 핵심 스킬 적중 여부가 승패를 가릅니다.`,
      ],
      weak: [
        `${enemyName}이(가) 후반에 더 강해집니다. 중반까지 우위를 점하세요.`,
        `후반으로 갈수록 불리해지므로 오브젝트 관리를 통해 빠르게 게임을 끝내세요.`,
      ],
    },
  };

  const options = descriptions[phase][advantage];
  const seed = hashPair(myChamp.id + phase, enemyChamp.id);
  return options[seed % options.length];
}

function generateTips(myChamp: ChampionData, enemyChamp: ChampionData): string[] {
  const tips: string[] = [];

  if (enemyChamp.classes.includes("assassin")) {
    tips.push("방어 아이템을 서브로 빌드하는 것을 고려하세요.");
    tips.push(`${enemyChamp.name}의 핵심 스킬 쿨타임을 파악하고 반격하세요.`);
  }

  if (enemyChamp.range === "ranged" && myChamp.range === "melee") {
    tips.push("미니언 뒤에서 CS를 챙기며 포크 데미지를 최소화하세요.");
    tips.push("레벨 업 시 올인 타이밍을 노려보세요.");
  }

  if (myChamp.range === "ranged" && enemyChamp.range === "melee") {
    tips.push("사거리 이점을 활용해 꾸준히 견제하세요.");
    tips.push("거리 유지가 핵심입니다. 너무 가까이 가지 마세요.");
  }

  if (enemyChamp.strengths.includes("sustain")) {
    tips.push(`${enemyChamp.name}의 체력 회복이 강합니다. 짧은 트레이드보다 올인이 효과적입니다.`);
  }

  if (enemyChamp.strengths.includes("engage")) {
    tips.push(`${enemyChamp.name}의 이니시에이팅을 조심하세요. 와드를 충분히 꽂아두세요.`);
  }

  if (myChamp.strengths.includes("splitpush")) {
    tips.push("스플릿 푸시를 통해 압박하면서 팀에게 오브젝트 기회를 만들어주세요.");
  }

  if (myChamp.strengths.includes("roam")) {
    tips.push("라인을 밀어놓고 로밍으로 다른 라인을 도와주세요.");
  }

  // Always return at least 3 tips
  const genericTips = [
    "미니언 웨이브 관리를 통해 정글러의 갱킹 기회를 만드세요.",
    "상대의 소환사 주문 쿨타임을 트래킹하세요.",
    "핵심 아이템 완성 타이밍에 맞춰 교전을 유도하세요.",
    "시야 확보를 통해 정글 동선을 파악하세요.",
  ];

  while (tips.length < 3) {
    const seed = hashPair(myChamp.id, enemyChamp.id + tips.length);
    tips.push(genericTips[seed % genericTips.length]);
  }

  return tips.slice(0, 5);
}

export function calculateMatchup(
  myChampId: string,
  enemyChampId: string,
  position: Position
): MatchupResult | null {
  const myChamp = getChampionById(myChampId);
  const enemyChamp = getChampionById(enemyChampId);

  if (!myChamp || !enemyChamp) return null;

  // Calculate base win rate from class/range matchup
  const classAdv = getClassAdvantage(myChamp.classes, enemyChamp.classes);
  const rangeAdv = getRangeAdvantage(myChamp, enemyChamp);

  // Get champion stats for additional context
  const allStats = generateChampionStats();
  const myStats = allStats.find((s) => s.championId === myChampId && s.position === position);
  const enemyStats = allStats.find((s) => s.championId === enemyChampId && s.position === position);

  const myBaseWR = myStats?.winRate ?? 50;
  const enemyBaseWR = enemyStats?.winRate ?? 50;

  // Matchup specific adjustment
  const seed = hashPair(myChampId, enemyChampId);
  const randomAdj = (seededRandom(seed) - 0.5) * 6;

  const winRate = Math.min(
    65,
    Math.max(35, 50 + (myBaseWR - enemyBaseWR) + classAdv + rangeAdv + randomAdj)
  );

  // Determine advantages per phase
  function phaseAdvantage(phase: "early" | "mid" | "late"): "strong" | "even" | "weak" {
    const myHasPhase = myChamp!.strengths.includes(phase);
    const enemyHasPhase = enemyChamp!.strengths.includes(phase);

    const phaseSeed = hashPair(myChampId + phase, enemyChampId);
    const rand = seededRandom(phaseSeed) * 2 - 1; // -1 to 1

    let score = rand * 0.5;
    if (myHasPhase) score += 1;
    if (enemyHasPhase) score -= 1;

    if (score > 0.3) return "strong";
    if (score < -0.3) return "weak";
    return "even";
  }

  const earlyAdv = phaseAdvantage("early");
  const midAdv = phaseAdvantage("mid");
  const lateAdv = phaseAdvantage("late");

  const overallAdvantage = winRate >= 53 ? "strong" : winRate >= 47 ? "even" : "weak";

  const keyPoints: string[] = [];
  if (winRate >= 53) {
    keyPoints.push(`${myChamp.name}이(가) 이 매치업에서 통계적으로 유리합니다.`);
  } else if (winRate <= 47) {
    keyPoints.push(`${enemyChamp.name}이(가) 이 매치업에서 통계적으로 유리합니다.`);
  } else {
    keyPoints.push("통계적으로 균형 잡힌 매치업입니다.");
  }

  if (earlyAdv === "strong") keyPoints.push("초반 라인전에서 주도권을 잡을 수 있습니다.");
  if (lateAdv === "strong") keyPoints.push("후반으로 갈수록 더 강해집니다.");
  if (earlyAdv === "weak") keyPoints.push("초반에는 수비적으로 플레이하세요.");

  return {
    myChampion: myChampId,
    enemyChampion: enemyChampId,
    position,
    winRate: Math.round(winRate * 100) / 100,
    laneAdvantage: overallAdvantage,
    phases: {
      early: {
        advantage: earlyAdv,
        description: getPhaseDescription(myChamp, enemyChamp, "early", earlyAdv),
      },
      mid: {
        advantage: midAdv,
        description: getPhaseDescription(myChamp, enemyChamp, "mid", midAdv),
      },
      late: {
        advantage: lateAdv,
        description: getPhaseDescription(myChamp, enemyChamp, "late", lateAdv),
      },
    },
    tips: generateTips(myChamp, enemyChamp),
    keyPoints,
  };
}
