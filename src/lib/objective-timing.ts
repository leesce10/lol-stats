// objective-timing.ts — 다음 오브젝트 스폰 시점 추적.
// 게임시간 + 처치 이벤트(events 피드)로 다음 스폰을 계산한다.
// ⚠️ 스폰 스케줄은 패치마다 달라지므로 SCHEDULE 상수로 관리(추정). 필요 시 한 곳만 수정.

export interface ObjectiveDef {
  key: string;
  label: string;
  first: number; // 첫 스폰(초)
  respawn: number | null; // 처치 후 재스폰 간격(초). null이면 1회성
  killEvent: string; // live_client_data 이벤트명
}

// 초 단위 (현재 패치 기준 근사값)
export const SCHEDULE: ObjectiveDef[] = [
  { key: "grubs", label: "유충", first: 360, respawn: null, killEvent: "HordeKill" }, // 6:00
  { key: "herald", label: "전령", first: 840, respawn: null, killEvent: "HeraldKill" }, // 14:00
  { key: "dragon", label: "드래곤", first: 300, respawn: 300, killEvent: "DragonKill" }, // 5:00, +5:00
  { key: "baron", label: "바론", first: 1200, respawn: 360, killEvent: "BaronKill" }, // 20:00, +6:00
];

export interface UpcomingObjective {
  key: string;
  label: string;
  spawnAt: number; // 게임시간(초) 기준 스폰 시각
  secondsTo: number; // 남은 초 (음수면 이미 스폰됨/활성)
}

// lastKills: { [objectiveKey]: 마지막 처치 시각(초) }
export function nextObjectives(
  gameTime: number,
  lastKills: Record<string, number> = {}
): UpcomingObjective[] {
  const out: UpcomingObjective[] = [];
  for (const def of SCHEDULE) {
    const killed = lastKills[def.key];
    let spawnAt: number;
    if (killed == null) {
      spawnAt = def.first; // 아직 한 번도 안 잡힘 → 첫 스폰
    } else if (def.respawn != null) {
      spawnAt = killed + def.respawn; // 재스폰
    } else {
      continue; // 1회성인데 이미 처치됨 → 더 안 나옴
    }
    out.push({
      key: def.key,
      label: def.label,
      spawnAt,
      secondsTo: Math.round(spawnAt - gameTime),
    });
  }
  // 곧 나오는 순서대로
  return out.sort((a, b) => a.secondsTo - b.secondsTo);
}

// 스폰 window(기본 60초) 안에 들어온 오브젝트(아직 안 나온 것 우선)
export function objectivesInWindow(
  gameTime: number,
  lastKills: Record<string, number> = {},
  window = 60
): UpcomingObjective[] {
  return nextObjectives(gameTime, lastKills).filter(
    (o) => o.secondsTo <= window && o.secondsTo > -20
  );
}
