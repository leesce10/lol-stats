const RIOT_API_KEY = process.env.RIOT_API_KEY || "";

// 한국 서버
const KR_PLATFORM = "https://kr.api.riotgames.com";
// 매치 API는 아시아 리전
const ASIA_REGION = "https://asia.api.riotgames.com";

// Rate limit: 20 req/sec, 100 req/2min (Development Key)
let requestCount = 0;
let windowStart = Date.now();

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();

  // 2분 윈도우 리셋
  if (now - windowStart > 120000) {
    requestCount = 0;
    windowStart = now;
  }

  // 100 req/2min 제한 근접 시 대기
  if (requestCount >= 95) {
    const waitTime = 120000 - (now - windowStart) + 1000;
    if (waitTime > 0) {
      await new Promise((r) => setTimeout(r, waitTime));
      requestCount = 0;
      windowStart = Date.now();
    }
  }

  // 요청 간 최소 간격 (20 req/sec → 50ms)
  await new Promise((r) => setTimeout(r, 60));
  requestCount++;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  // 429 Rate Limited → 재시도
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "5", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    requestCount = 0;
    return rateLimitedFetch(url);
  }

  return res;
}

// 챌린저/그랜드마스터 리그 가져오기
export async function getChallengerLeague(): Promise<LeagueList | null> {
  const res = await rateLimitedFetch(
    `${KR_PLATFORM}/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getGrandmasterLeague(): Promise<LeagueList | null> {
  const res = await rateLimitedFetch(
    `${KR_PLATFORM}/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5`
  );
  if (!res.ok) return null;
  return res.json();
}

// 소환사 PUUID 가져오기
export async function getSummonerById(
  summonerId: string
): Promise<Summoner | null> {
  const res = await rateLimitedFetch(
    `${KR_PLATFORM}/lol/summoner/v4/summoners/${summonerId}`
  );
  if (!res.ok) return null;
  return res.json();
}

// 매치 ID 목록 가져오기
export async function getMatchIds(
  puuid: string,
  count: number = 20,
  queue: number = 420 // 솔로랭크
): Promise<string[]> {
  const res = await rateLimitedFetch(
    `${ASIA_REGION}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&count=${count}`
  );
  if (!res.ok) return [];
  return res.json();
}

// 매치 상세 정보 가져오기
export async function getMatchDetail(
  matchId: string
): Promise<MatchDetail | null> {
  const res = await rateLimitedFetch(
    `${ASIA_REGION}/lol/match/v5/matches/${matchId}`
  );
  if (!res.ok) return null;
  return res.json();
}

// ===== 타입 정의 =====

export interface LeagueList {
  tier: string;
  leagueId: string;
  queue: string;
  name: string;
  entries: LeagueEntry[];
}

export interface LeagueEntry {
  summonerId: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  rank: string;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface MatchDetail {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    gameVersion: string;
    queueId: number;
    teams: TeamData[];
    participants: ParticipantData[];
  };
}

export interface TeamData {
  teamId: number;
  win: boolean;
  bans: { championId: number; pickTurn: number }[];
}

export interface ParticipantData {
  puuid: string;
  championId: number;
  championName: string;
  teamPosition: string; // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  goldEarned: number;
  visionScore: number;
  teamId: number;
}
