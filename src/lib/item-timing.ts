// item-timing.ts — 내 현재 골드 + 보유 아이템 + 수급속도로 "다음 코어 완성 예상 시점" 계산.
// 내 기준(active_player.currentGold)이라 정확하고 ToS 안전.
// Data Dragon item.json(코어 비용·구성요소)을 사용.

import { DDRAGON_VERSION } from "@/data/champions";

interface DDItem {
  name: string;
  gold: { total: number; purchasable: boolean };
  from?: string[];
  into?: string[];
  image: { full: string };
  tags?: string[];
}

let ITEMS: Record<string, DDItem> | null = null;
const treeCache = new Map<string, Set<string>>();

async function loadItems(): Promise<Record<string, DDItem>> {
  if (ITEMS) return ITEMS;
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ko_KR/item.json`,
    { next: { revalidate: 86400 } }
  );
  const json = await res.json();
  ITEMS = json.data as Record<string, DDItem>;
  return ITEMS;
}

// 코어의 모든 하위 구성요소 id 집합(중간 단계 포함, 자신 제외)
function componentTree(id: string, items: Record<string, DDItem>): Set<string> {
  const cached = treeCache.get(id);
  if (cached) return cached;
  const set = new Set<string>();
  const walk = (cur: string) => {
    const it = items[cur];
    if (!it?.from) return;
    for (const f of it.from) {
      if (!set.has(f)) {
        set.add(f);
        walk(f);
      }
    }
  };
  walk(id);
  treeCache.set(id, set);
  return set;
}

function isCoreCandidate(it: DDItem): boolean {
  if (!it?.gold?.purchasable) return false;
  if ((it.into?.length ?? 0) > 0) return false; // 완성 아이템만
  if (it.gold.total < 1000) return false; // 잡템·소비템 제외
  const tags = it.tags || [];
  if (tags.includes("Consumable") || tags.includes("Trinket")) return false;
  return true;
}

// 보유 아이템 중 이 코어에 투자된 가치 (상위 구성요소만 계산해 중복 방지)
function investedValue(
  coreId: string,
  ownedIds: string[],
  items: Record<string, DDItem>
): number {
  const tree = componentTree(coreId, items);
  const ownedInTree = [...new Set(ownedIds)].filter((id) => tree.has(id));
  // 다른 보유 구성요소의 하위인 것은 제외 (예: 큰검을 합친 중간템을 가졌으면 큰검은 중복 제외)
  const maximal = ownedInTree.filter(
    (id) =>
      !ownedInTree.some(
        (other) => other !== id && componentTree(other, items).has(id)
      )
  );
  return maximal.reduce((s, id) => s + (items[id]?.gold.total || 0), 0);
}

export interface TimingResult {
  ok: true;
  incomePerSec: number;
  target: {
    itemId: number;
    name: string;
    image: string;
    totalCost: number;
    investedValue: number;
    remainingCost: number;
  } | null;
  goldNeeded: number;
  secondsToAfford: number; // 0 = 지금 구매 가능
  affordable: boolean;
}

// 패시브 골드(약 2.13/s, ~110초부터) + CS 수급 추정
export function estimateIncome(gameTime: number, creepScore: number): number {
  const passive = gameTime > 110 ? 2.13 : 0;
  const csRate = gameTime > 0 ? (creepScore / gameTime) * 20 : 0;
  return Math.max(1.0, passive + csRate);
}

export interface TimingInput {
  gameTime: number;
  currentGold: number;
  items: number[];
  creepScore?: number;
  incomePerSec?: number; // 클라가 실측한 값이 있으면 우선
  targetItemId?: number; // 특정 코어 강제(추론 대신)
}

export async function computeItemTiming(input: TimingInput): Promise<TimingResult> {
  const items = await loadItems();
  const owned = (input.items || []).map(String);
  const income =
    input.incomePerSec && input.incomePerSec > 0
      ? input.incomePerSec
      : estimateIncome(input.gameTime || 0, input.creepScore || 0);

  // 대상 코어 결정
  let targetId: string | null = null;
  if (input.targetItemId && items[String(input.targetItemId)]) {
    targetId = String(input.targetItemId);
  } else {
    // 보유 구성요소가 가장 많이 투자된 미보유 완성템을 추론
    let best: { id: string; invested: number } | null = null;
    const ownedSet = new Set(owned);
    for (const [id, it] of Object.entries(items)) {
      if (ownedSet.has(id) || !isCoreCandidate(it)) continue;
      const invested = investedValue(id, owned, items);
      if (invested <= 0) continue;
      if (!best || invested > best.invested) best = { id, invested };
    }
    targetId = best?.id ?? null;
  }

  if (!targetId) {
    return {
      ok: true,
      incomePerSec: Math.round(income * 10) / 10,
      target: null,
      goldNeeded: 0,
      secondsToAfford: 0,
      affordable: false,
    };
  }

  const core = items[targetId];
  const invested = investedValue(targetId, owned, items);
  const remainingCost = Math.max(0, core.gold.total - invested);
  const goldNeeded = Math.max(0, remainingCost - input.currentGold);
  const secondsToAfford = goldNeeded <= 0 ? 0 : Math.ceil(goldNeeded / income);

  return {
    ok: true,
    incomePerSec: Math.round(income * 10) / 10,
    target: {
      itemId: Number(targetId),
      name: core.name,
      image: core.image.full,
      totalCost: core.gold.total,
      investedValue: invested,
      remainingCost,
    },
    goldNeeded,
    secondsToAfford,
    affordable: goldNeeded <= 0,
  };
}
