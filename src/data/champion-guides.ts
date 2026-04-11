// 챔피언 공략 가이드 데이터
// 출처: 한국 롤 강의 유튜브 영상 자막 + 메타 지식 종합
// 영상 출처는 각 가이드의 sources 배열에 명시

import { championGuidesBatch2 } from "./champion-guides-batch2";
import { championGuidesBatch3 } from "./champion-guides-batch3";

export interface VideoSource {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  viewCount: string;
}

export interface ChampionGuide {
  championId: string;
  championKr: string;
  position: "top" | "jungle" | "mid" | "adc" | "support";
  oneLine: string;                    // 한 줄 핵심
  difficulty: 1 | 2 | 3 | 4 | 5;     // 난이도
  damageType: "AD" | "AP" | "Mixed";
  strengths: string[];                // 장점 3~4개
  weaknesses: string[];               // 단점 3~4개
  combos: { name: string; sequence: string; description: string }[];
  earlyGame: string[];                // 라인전 핵심 (3~5개)
  midGame: string[];                  // 중반 운영
  lateGame: string[];                 // 후반 운영
  tips: string[];                     // 실전 팁
  goodAgainst: string[];              // 강한 상대
  badAgainst: string[];               // 약한 상대
  recommendedRunes: { primary: string; secondary: string; note: string };
  recommendedItems: { core: string[]; situational: string[] };
  sources: VideoSource[];
}

export const championGuides: ChampionGuide[] = [
  // ===== 제드 =====
  {
    championId: "Zed",
    championKr: "제드",
    position: "mid",
    oneLine: "초반은 받아먹고 2코어 이후 사이드 운영으로 캐리하는 챔피언",
    difficulty: 4,
    damageType: "AD",
    strengths: [
      "2코어 이후 폭딜이 매우 강력함",
      "사이드 운영으로 라인 압박 능력 최상",
      "암살자 메타에서 살아남는 메커니즘 보유",
      "후반 마무리 능력 (궁 + 충격포자 콤보)",
    ],
    weaknesses: [
      "초반 라인전이 약해 받아먹어야 함",
      "탱커가 많은 적팀 조합에서 무력해짐",
      "단단한 챔프 (사이온, 말파이트) 상대로 어려움",
      "실드/회피 스킬 보유 챔프 (라이즈, 카사딘) 상대로 약함",
    ],
    combos: [
      {
        name: "기본 표창 콤보",
        sequence: "W → Q → E → 평타",
        description: "그림자 던지고 표창 두 번 맞춘 뒤 평타로 마무리. 가장 기본적인 딜교환.",
      },
      {
        name: "올인 콤보",
        sequence: "R → W → E → Q → 평타 → Q",
        description: "궁으로 진입 후 그림자 위치에서 표창 두 번. 상대 처치용.",
      },
      {
        name: "이렙 딜교 (1렙)",
        sequence: "Q → 평타 (감전 룬 발동)",
        description: "1렙 표창 하나만 맞춰도 감전 룬 발동으로 큰 데미지. 라인 미는 상대에게 효과적.",
      },
      {
        name: "탈출 콤보",
        sequence: "W → R → 그림자 위치로 귀환",
        description: "위험 상황에서 그림자 미리 깔아두고 탈출.",
      },
    ],
    earlyGame: [
      "초반 라인전은 절대 무리하지 마세요. 받아먹는 게 우선",
      "1~2렙은 W로 안전하게 CS 챙기기",
      "3렙 표창 하나 맞춰도 감전 룬으로 딜교가 됩니다",
      "6렙 즉시 궁 사용 금지. 상대 점멸 빠진 후가 골든타임",
      "정글러 갱크 호응을 우선시 (솔킬 노리면 라인이 밀림)",
    ],
    midGame: [
      "2코어 (먹완 + 이실라이) 완성 후가 진정한 파워 스파이크",
      "사이드 라인으로 빠져서 1번 스플릿 운영",
      "오브젝트 시야 잡고 한타 합류 vs 사이드 압박 선택",
      "적 ADC 위치 추적 후 컷 시도",
      "팀 한타 시 그림자로 진입 → 즉시 백 (절대 머무르지 말 것)",
    ],
    lateGame: [
      "한타에서는 적 캐리 컷이 최우선",
      "궁 표식 + 충격포자가 풀템 적 캐리 한 방 컷의 핵심",
      "스플릿 푸셔로서 적팀의 대응을 분산시키기",
      "5:5 한타보다 4:5 만들기 (적 1명 잡아먹고 합류)",
      "탱커가 많으면 데스댄스/마법사의 신발 등 생존템 우선",
    ],
    tips: [
      "표창 두 개 다 맞추는 것보다 하나 맞춰도 감전 발동시키는 게 중요",
      "그림자는 단순 데미지가 아닌 위치 변환의 도구로 활용",
      "라인 클리어 후 즉시 사이드 + 정글 침투 동선 짜기",
      "적 정글러 위치 모르면 절대 사이드에서 무리하지 말 것",
      "솔킬 노릴 때는 항상 본인 점멸/궁 쿨타임 확인",
    ],
    goodAgainst: ["빅토르", "오리아나", "라이즈", "아지르", "베이가"],
    badAgainst: ["갈리오", "리산드라", "말자하", "카사딘", "신드라"],
    recommendedRunes: {
      primary: "지배 - 감전 / 피의 맛 / 사냥의 증표 / 굶주린 사냥꾼",
      secondary: "정밀 - 침착 / 최후의 일격",
      note: "이렙 딜교를 위해 감전 필수. 피의 맛으로 라인전 회복.",
    },
    recommendedItems: {
      core: ["먹물 검 (이클립스)", "요우무의 유령검", "콜렉터"],
      situational: ["가시 갑옷 (적 AD 많을 때)", "수은 장식띠 (CC 많을 때)", "데스 댄스 (한타 위주)"],
    },
    sources: [
      { videoId: "E7VAiWF9YcQ", title: "제드로 라인전을 '지는' 22가지 방법", channel: "발__젭", duration: "8:45", viewCount: "조회수 3,000,000회" },
      { videoId: "gQ1OkSKeeL0", title: "[제드 강의] 미드 꿀팁 & 콤보 총 정리", channel: "율드댕 / Yuldeu", duration: "15:30", viewCount: "조회수 500,000회" },
      { videoId: "DP8yoRySrWM", title: "챌린저 제드 원챔 840시간 노력", channel: "율드댕 / Yuldeu", duration: "20:00", viewCount: "조회수 400,000회" },
    ],
  },

  // ===== 바이 =====
  {
    championId: "Vi",
    championKr: "바이",
    position: "jungle",
    oneLine: "확실한 갱킹과 한타 이니시로 게임을 굴리는 정글러",
    difficulty: 2,
    damageType: "AD",
    strengths: [
      "궁극기로 확정적인 픽 가능",
      "단단한 체력으로 진입 부담 적음",
      "Q-R 콤보로 ADC 컷 능력 우수",
      "초중반 갱킹 성공률 매우 높음",
    ],
    weaknesses: [
      "거리 유지 능력이 부족 (CC 회피 어려움)",
      "후반 한타 시 진입 후 즉사 가능성",
      "Q 차징 중 위치 노출",
      "스케일링이 마법사/원딜 중심 팀에 비해 약함",
    ],
    combos: [
      {
        name: "갱킹 콤보",
        sequence: "E → Q → A → R → 이그나이트",
        description: "거리 좁히고 차징 펀치 → 평타 → 궁 마무리.",
      },
      {
        name: "한타 진입",
        sequence: "Q (차징 풀) → R (적 캐리) → E → 평타",
        description: "차징 펀치로 진입 후 궁으로 적 캐리 락온.",
      },
    ],
    earlyGame: [
      "1~2렙 정글링 안전하게 (체력 관리 중요)",
      "3렙 풀 정글 후 첫 갱킹 시도 (3분 30초~4분)",
      "Q 차징 시간 활용해 부쉬 안에서 대기",
      "라인 푸시된 라인부터 갱킹 (탑/미드 우선순위)",
      "킬보다 점멸 빼는 것을 목표로",
    ],
    midGame: [
      "오브젝트 (드래곤/전령) 우선 챙기기",
      "상대 정글러 위치 추적 (시야 우선)",
      "한타 시작 전 와드로 적 진형 확인",
      "Q 차징 자세는 부쉬에서만",
      "팀 합류 타이밍 절대 놓치지 말 것",
    ],
    lateGame: [
      "한타에서 가장 위협적인 적 캐리 락온",
      "궁극기는 적 ADC 또는 메인 딜러에게",
      "진입 후 즉사 위험 → 데스댄스 필수",
      "수비 시 본인이 먼저 진입 금지 (탱커 활용)",
      "적이 한타 회피하면 오브젝트 압박",
    ],
    tips: [
      "Q 차징은 부쉬에서 시작 (적이 회피 어려움)",
      "갱킹 시 라인 푸시 상황 확인 (받아먹을 라인 우선)",
      "궁 적중 후 자동 평타 캔슬로 딜 극대화",
      "탱커 빌드보다 피의 칼날 + 데스댄스가 더 강력",
      "오브젝트 시야 잡을 때 Q로 싸움 시작 가능",
    ],
    goodAgainst: ["니달리", "엘리스", "그레이브즈", "카직스", "이블린"],
    badAgainst: ["워윅", "쉔", "람머스", "아무무", "마오카이"],
    recommendedRunes: {
      primary: "정밀 - 정복자 / 침착 / 전설: 강인함 / 최후의 일격",
      secondary: "결의 - 재생의 바람 / 소생",
      note: "정복자로 지속 딜, 결의로 생존력 보강",
    },
    recommendedItems: {
      core: ["삼위일체", "스테락의 도전", "데스 댄스"],
      situational: ["수은 장식띠 (CC 많을 때)", "가시 갑옷 (적 AD 위주)", "타곤 산의 수호물"],
    },
    sources: [
      { videoId: "K8aqf-iY0Z4", title: "바이 1분 스킬 요약", channel: "롤 사관학교", duration: "1:00", viewCount: "조회수 100,000회" },
    ],
  },

  // ===== 미스 포츈 =====
  {
    championId: "MissFortune",
    championKr: "미스 포츈",
    position: "adc",
    oneLine: "라인전 강한 평타 원딜. 패시브 활용한 딜교환이 핵심",
    difficulty: 2,
    damageType: "AD",
    strengths: [
      "라인전 압박 매우 강함 (Q 튕김 + 평타 패시브)",
      "한타 궁으로 광역 딜 압도적",
      "풀템 시 평타 깡딜 매우 강력",
      "초보자도 다루기 쉬운 직관적 챔피언",
    ],
    weaknesses: [
      "이동기 없음 (점멸만 의존)",
      "포지셔닝 실수 시 즉사",
      "후반 캐리 능력은 다른 원딜보다 약함",
      "강한 포커/카운터 인게이저 상대 어려움",
    ],
    combos: [
      {
        name: "기본 딜교",
        sequence: "패시브 평타 → Q (튕김 활용) → 평타",
        description: "패시브 첫 평타 강화 후 Q로 추가 딜.",
      },
      {
        name: "한타 콤보",
        sequence: "E (감속) → R (채널링)",
        description: "적 모인 곳에 E 깔고 궁극기 풀 채널링.",
      },
    ],
    earlyGame: [
      "1~2렙은 패시브 활용 적극적으로 (첫 평타 강화)",
      "Q는 미니언 통해 상대에게 튕겨서 사용",
      "3렙 부터 강한 딜교환 가능",
      "6렙 직후 궁극기로 라인 클리어 + 압박",
      "사거리 우위로 견제, 항상 미니언 라인 확인",
    ],
    midGame: [
      "팀 합류 우선 (이동기 없으므로 항상 팀과 함께)",
      "오브젝트 한타 시 후방 포지션 유지",
      "궁극기 타이밍 신중히 (적 모일 때만)",
      "사이드 라인 가지 말 것 (단독 행동 위험)",
      "와드 자주 박기 (시야 확보 필수)",
    ],
    lateGame: [
      "한타에서 후방 위치 절대 사수",
      "궁극기는 적 5명 모인 한타에 사용",
      "탱커가 진입한 직후 궁 시작",
      "삼위일체 + 무한의 대검 빌드로 평타 캐리",
      "수은 장식띠/거울 갑옷으로 CC 방어",
    ],
    tips: [
      "Q는 직접 사거리 + 튕김 사거리 모두 활용",
      "패시브 첫 평타는 주기적으로 미니언에 사용 후 적에게",
      "궁극기는 최소 2명 이상 적이 있을 때 사용",
      "한타 전 항상 점멸 쿨타임 체크",
      "초반 부쉬 견제 활용 (시야 차단)",
    ],
    goodAgainst: ["케이틀린", "베인", "이즈리얼", "코그모", "트리스타나"],
    badAgainst: ["드레이븐", "루시안", "사미라", "퀸", "징크스"],
    recommendedRunes: {
      primary: "정밀 - 치명적 속도 / 침착 / 전설: 핏빛 / 최후의 일격",
      secondary: "지배 - 피의 맛 / 사냥의 증표",
      note: "치명적 속도로 평타 캐리, 피의 맛으로 라인전 회복",
    },
    recommendedItems: {
      core: ["크라켄 학살자", "광전사의 군화", "무한의 대검"],
      situational: ["수은 장식띠", "고통의 지팡이 (적 마저)", "구인수의 격노검 (포커 상대)"],
    },
    sources: [
      { videoId: "KaJlKhPNu5U", title: "미스 포츈 강의 - 입문 강의", channel: "땅우양", duration: "20:00", viewCount: "조회수 75,000회" },
      { videoId: "JpEHfqKBrVk", title: "현 메타 미스 포츈 기초 강의", channel: "땅우양", duration: "23:00", viewCount: "조회수 65,000회" },
      { videoId: "-AUKrcG2ZOQ", title: "미포외길인생 장인초대석", channel: "테스터훈 TesterHoon", duration: "16:23", viewCount: "조회수 50,000회" },
    ],
  },

  // ===== 이즈리얼 =====
  {
    championId: "Ezreal",
    championKr: "이즈리얼",
    position: "adc",
    oneLine: "안전한 포커형 원딜. E 점멸로 생존하며 1코어 후 본격 캐리",
    difficulty: 3,
    damageType: "Mixed",
    strengths: [
      "E (비전 이동) 으로 생존력 최상",
      "사거리 긴 Q로 안전한 포킹",
      "꽁승 관리에 가장 강한 원딜",
      "어떤 상황에서도 전선 이탈 가능",
    ],
    weaknesses: [
      "1코어 (먹완) 전 데미지 매우 약함",
      "스킬샷 의존도 100% (실력 차이 큼)",
      "한타에서 진입 시 위험",
      "강한 인게이지팀 상대로 어려움",
    ],
    combos: [
      {
        name: "기본 포커",
        sequence: "Q (미니언 통해) → 평타",
        description: "미니언 사이로 Q로 견제 후 평타. 일반적 라인전.",
      },
      {
        name: "올인 콤보",
        sequence: "W → Q → R → E",
        description: "W 표식 후 Q로 발동, 궁으로 마무리, E로 탈출.",
      },
      {
        name: "탈출",
        sequence: "E → R (필요시)",
        description: "위험 시 E로 점멸하고 궁으로 추가 거리 확보.",
      },
    ],
    earlyGame: [
      "1~2렙은 절대 무리하지 말 것 (Q만 사용)",
      "Q 맞추기 연습 (CS + 견제 동시에)",
      "3렙 W 배운 후 W-Q 콤보 가능",
      "초반 킬은 우선시하지 말고 CS와 안전 우선",
      "정글러 갱크 시 E 점멸로 호응",
    ],
    midGame: [
      "1코어 (먹완) 완성 후 본격 캐리 시작",
      "사이드 라인 가지 않고 팀과 함께",
      "한타 시 E로 위치 잡기, 진입 금지",
      "오브젝트 시야 확보 후 Q로 견제",
      "적 ADC와의 거리 유지 우선",
    ],
    lateGame: [
      "후방에서 Q 폭격으로 한타 시작",
      "궁극기는 한타 시작 직전 또는 도주 시",
      "E는 진입이 아닌 탈출용",
      "탱커가 진입한 후 적 캐리 컷 시도",
      "본인이 죽지 않는 게 가장 중요",
    ],
    tips: [
      "Q는 항상 미니언 뒤로 (적이 회피 어려움)",
      "E 점멸은 신중히 (쿨타임 길고 위험)",
      "1코어 전엔 절대 올인 금지",
      "W는 적이나 미니언에 항상 부착해서 Q 폭발 활용",
      "적 점멸 쿨타임 트래킹이 매우 중요",
    ],
    goodAgainst: ["베인", "코그모", "트리스타나", "사미라", "징크스"],
    badAgainst: ["케이틀린", "드레이븐", "루시안", "케일", "퀸"],
    recommendedRunes: {
      primary: "마법 - 신비로운 유성 / 마나순환 팔찌 / 초월 / 폭풍 모으기",
      secondary: "정밀 - 침착 / 전설: 핏빛",
      note: "유성으로 포킹 강화, 폭풍 모으기로 후반 깡딜",
    },
    recommendedItems: {
      core: ["먹물 검 (이클립스)", "광전사의 군화", "삼위일체"],
      situational: ["수호 천사 (한타 위주)", "구인수의 격노검", "라이저의 후광"],
    },
    sources: [
      { videoId: "_zqcZx_F0KQ", title: "11년동안 이즈리얼만 챌린저, 어린이즈 장인초대석", channel: "테스터훈 TesterHoon", duration: "14:57", viewCount: "조회수 55,000회" },
      { videoId: "EzVKWlxlPM4", title: "이즈리얼 기초 강의", channel: "땅우양", duration: "25:21", viewCount: "조회수 45,000회" },
    ],
  },

  // ===== 제리 =====
  {
    championId: "Zeri",
    championKr: "제리",
    position: "adc",
    oneLine: "기동성 + 사거리 카이팅 원딜. 라인전 약하나 후반 매우 강력",
    difficulty: 4,
    damageType: "Mixed",
    strengths: [
      "E (벽 점프) 로 기동성 최상",
      "광역기 사거리로 안전한 카이팅",
      "스킬샷 평타로 미니언 너머 견제 가능",
      "후반 한타 캐리 능력 압도적",
    ],
    weaknesses: [
      "라인전 매우 약함 (이동기 외 생존기 없음)",
      "근접 어쌔신 상대로 즉사",
      "스킬 의존도 높음",
      "강한 포커 상대로 어려움",
    ],
    combos: [
      {
        name: "기본 평타 누적",
        sequence: "Q (스킬샷) → 평타 → 평타",
        description: "Q로 누적 후 강화 평타.",
      },
      {
        name: "올인",
        sequence: "R → W → Q → 평타 도배",
        description: "궁극기 발동 후 W로 적중 → Q 견제 → 평타 무한 도배.",
      },
      {
        name: "도주",
        sequence: "E (벽 점프) → R 발동",
        description: "E로 벽 넘어 도주 후 궁극기 카이팅.",
      },
    ],
    earlyGame: [
      "라인전 절대 무리하지 말 것",
      "Q로 안전한 미니언 막타",
      "이동기 (E) 는 도주용으로만",
      "초반 솔킬 노리지 말고 CS만",
      "정글 갱크 호응에만 적극적",
    ],
    midGame: [
      "1코어 (수은 거울) 완성 후 캐리 시작",
      "광역 한타 우선 합류",
      "사이드 라인 가지 말 것",
      "탱커 뒤에서 Q 누적 후 평타 도배",
      "오브젝트 시야 잡고 한타 강제",
    ],
    lateGame: [
      "한타에서 가장 캐리 가능한 챔피언",
      "탱커 뒤에서 풀 평타 도배",
      "벽 점프로 위치 변환하며 카이팅",
      "궁극기는 한타 시작 직후 사용",
      "절대 본인이 먼저 진입 금지",
    ],
    tips: [
      "Q는 누적 + 평타 강화의 도구",
      "벽 점프 (E) 는 미리 동선 짜놓기",
      "수은 거울 + 광전사의 군화 가장 효율적",
      "1코어 전엔 절대 솔킬 노리지 말 것",
      "탱커 / 인게이저 적극적인 적팀 상대로 픽 신중",
    ],
    goodAgainst: ["코그모", "징크스", "케이틀린", "베인", "트리스타나"],
    badAgainst: ["드레이븐", "루시안", "사미라", "퀸", "이즈리얼"],
    recommendedRunes: {
      primary: "정밀 - 치명적 속도 / 침착 / 전설: 핏빛 / 최후의 일격",
      secondary: "지배 - 피의 맛 / 사냥의 증표",
      note: "치명적 속도로 평타 캐리 극대화",
    },
    recommendedItems: {
      core: ["서풍의 칼날", "광전사의 군화", "수은 거울"],
      situational: ["수호 천사", "고통의 지팡이", "라이저의 후광"],
    },
    sources: [
      { videoId: "JDLiZKEktCk", title: "챌린저 제리 장인의 라인전 터트리는 방법", channel: "테스터훈 TesterHoon", duration: "17:51", viewCount: "조회수 234,000회" },
      { videoId: "VO3SFXnBY3s", title: "천상계 1티어 제리 강의", channel: "이석현", duration: "16:37", viewCount: "조회수 144,000회" },
      { videoId: "tNAjYkWp5oA", title: "제리 기초 강의 - 핵심은 OO입니다", channel: "땅우양", duration: "21:00", viewCount: "조회수 80,000회" },
    ],
  },

  // ===== 드레이븐 =====
  {
    championId: "Draven",
    championKr: "드레이븐",
    position: "adc",
    oneLine: "초반 압도적인 라인전의 화신. 도끼 받기 + 포지셔닝이 핵심",
    difficulty: 4,
    damageType: "AD",
    strengths: [
      "초반 평타 데미지 압도적",
      "도끼 패시브로 평타 극대화",
      "서폿과 시너지 매우 강함 (킬 캐치 능력)",
      "킬 시 추가 골드 (스노우볼 강함)",
    ],
    weaknesses: [
      "도끼 받는 게 매우 어려움 (실력 차이 큼)",
      "포커 상대로 약함",
      "후반 캐리력은 다른 원딜보다 약함",
      "팀의 도움 없으면 캐리 어려움",
    ],
    combos: [
      {
        name: "도끼 도배",
        sequence: "Q → 평타 → 도끼 받기 → 평타",
        description: "Q로 도끼 시작 후 평타마다 도끼 위치 받으며 데미지.",
      },
      {
        name: "올인",
        sequence: "Q → E (속박) → 평타 → R (도주 적 마무리)",
        description: "E로 적 멈추고 평타 도배, 궁으로 도주 적 마무리.",
      },
      {
        name: "탈출",
        sequence: "W (이동속도) → 점멸",
        description: "W로 빠르게 이동, 점멸로 회피.",
      },
    ],
    earlyGame: [
      "Q + 평타로 라인전 압박 (1렙부터 가능)",
      "도끼 받는 위치 미리 계산",
      "적이 점멸 빠지면 즉시 올인",
      "서폿 픽이 좋으면 적극적 킬 시도",
      "초반 킬 1개로도 큰 우위",
    ],
    midGame: [
      "초반 골드로 빠른 코어템",
      "사이드 가지 말고 팀과 함께",
      "오브젝트 한타 우선 합류",
      "도끼 받는 위치 항상 신경 쓸 것",
      "후반 약해지므로 빠른 게임 진행",
    ],
    lateGame: [
      "한타에서 후방 평타 도배",
      "도끼 받는 동선 미리 계산",
      "초반에 골드 격차 만들었으면 캐리 가능",
      "후반엔 다른 원딜보다 약함, 빠른 마무리 필수",
      "본인 죽지 않는 게 가장 중요 (킬 골드 상대에게 줌)",
    ],
    tips: [
      "도끼 받는 위치는 평타 후 즉시 파악",
      "Q는 미리 켜두지 말고 평타 직전 사용",
      "킬 시 추가 골드로 빠른 아이템 회전",
      "후반 약해지므로 초반 압박이 핵심",
      "서폿과 항상 콜 맞추기",
    ],
    goodAgainst: ["베인", "징크스", "코그모", "이즈리얼", "케이틀린"],
    badAgainst: ["애쉬", "사미라", "케일", "퀸", "사이온 (탑)"],
    recommendedRunes: {
      primary: "정밀 - 정복자 / 침착 / 전설: 핏빛 / 최후의 일격",
      secondary: "지배 - 피의 맛 / 사냥의 증표",
      note: "정복자로 지속 딜, 피의 맛으로 라인전 회복",
    },
    recommendedItems: {
      core: ["정수약탈자", "광전사의 군화", "무한의 대검"],
      situational: ["수호 천사", "유령 무희", "고통의 지팡이"],
    },
    sources: [
      { videoId: "yzEiVxLjjxU", title: "드레이븐 전세계 1위, 코뚱잉 장인초대석", channel: "테스터훈 TesterHoon", duration: "20:58", viewCount: "조회수 735,000회" },
      { videoId: "hanRaFIya28", title: "롤 내전 드레이븐", channel: "코뚱잉", duration: "26:54", viewCount: "조회수 393,000회" },
      { videoId: "l40XZCPXrV0", title: "드레이븐 강의 기초편", channel: "크캣", duration: "7:21", viewCount: "조회수 301,000회" },
    ],
  },

  // ===== 징크스 =====
  {
    championId: "Jinx",
    championKr: "징크스",
    position: "adc",
    oneLine: "킬 먹으면 미친 듯이 굴러가는 하이퍼 캐리. 패시브 활용이 핵심",
    difficulty: 2,
    damageType: "AD",
    strengths: [
      "패시브 (이동속도/공속) 로 킬 잡으면 폭주",
      "후반 한타 캐리력 압도적",
      "광역 평타 (로켓 모드) 한타에서 강력",
      "사거리 매우 길어 안전한 견제",
    ],
    weaknesses: [
      "이동기 없음 (패시브 의존)",
      "초반 라인전 평범 (특별히 강하지 않음)",
      "킬 먹기 전엔 평범한 원딜",
      "강한 인게이지팀 상대 어려움",
    ],
    combos: [
      {
        name: "라인전 견제",
        sequence: "Q (로켓 전환) → 평타 → 평타 → Q (미니건 전환)",
        description: "로켓 모드로 견제 후 미니건 모드로 CS.",
      },
      {
        name: "올인",
        sequence: "W (스킬샷) → E (덫) → 평타 도배 → R (마무리)",
        description: "W로 견제 → 적이 들어오면 E로 묶고 평타 도배.",
      },
      {
        name: "한타",
        sequence: "Q (로켓) → 평타 → 패시브 발동 → 평타 도배",
        description: "로켓 평타로 광역 딜, 첫 킬/어시 시 패시브 발동 폭주.",
      },
    ],
    earlyGame: [
      "Q 모드 전환 적극 활용 (CS + 견제)",
      "초반 라인전 평범, 무리 금지",
      "W는 견제 + 시야 확인용",
      "정글러 갱크 시 E로 호응",
      "킬 먹으면 패시브 발동, 즉시 추격",
    ],
    midGame: [
      "킬/어시 누적해서 패시브 자주 발동",
      "팀과 함께 합류 (이동기 없음)",
      "사이드 라인 가지 말 것",
      "오브젝트 한타 우선 합류",
      "1코어 (광속검) 완성 후 본격 캐리",
    ],
    lateGame: [
      "한타에서 후방 로켓 평타 도배",
      "첫 킬/어시 시 패시브 발동 → 폭주",
      "탱커 뒤에서 안전한 위치 사수",
      "광역 평타로 5명 전부 딜",
      "본인 위치가 한타 승패 결정",
    ],
    tips: [
      "로켓 모드는 한타/광역, 미니건 모드는 단일 폭딜",
      "W는 시야 + 견제 + CS 마무리",
      "E는 진입 차단 또는 도주용",
      "패시브 발동 시 가장 강한 추격 가능",
      "치명타 빌드가 가장 효율적",
    ],
    goodAgainst: ["코그모", "베인", "이즈리얼", "트리스타나", "사미라"],
    badAgainst: ["드레이븐", "루시안", "케일", "퀸", "케이틀린"],
    recommendedRunes: {
      primary: "정밀 - 치명적 속도 / 침착 / 전설: 핏빛 / 최후의 일격",
      secondary: "지배 - 피의 맛 / 사냥의 증표",
      note: "치명적 속도로 평타 캐리, 후반 깡딜",
    },
    recommendedItems: {
      core: ["광속검 (스태틱 샷)", "광전사의 군화", "무한의 대검"],
      situational: ["수호 천사", "유령 무희", "고통의 지팡이"],
    },
    sources: [
      { videoId: "YseXzDJwxI8", title: "0티어 징크스 장인초대석", channel: "테스터훈 TesterHoon", duration: "20:08", viewCount: "조회수 306,000회" },
      { videoId: "N9AFgPiNenE", title: "1티어 징크스 강의", channel: "이석현", duration: "16:51", viewCount: "조회수 165,000회" },
    ],
  },

  // ===== 애쉬 =====
  {
    championId: "Ashe",
    championKr: "애쉬",
    position: "adc",
    oneLine: "유틸형 평타 원딜. 슬로우와 궁극기로 픽 + 한타 시작 능력",
    difficulty: 1,
    damageType: "AD",
    strengths: [
      "Q로 광역 평타 패시브 발동 (라인전 강함)",
      "W 슬로우로 카이팅 강함",
      "궁극기 (수정화살) 로 글로벌 픽 가능",
      "초보자도 다루기 쉬움",
    ],
    weaknesses: [
      "이동기 없음 (포지셔닝 매우 중요)",
      "초반 평타 데미지 약함",
      "근접 어쌔신 상대 어려움",
      "치명타 빌드가 아니라 깡딜은 약함",
    ],
    combos: [
      {
        name: "라인전 견제",
        sequence: "W → 평타 (슬로우 발동) → 추격 평타",
        description: "W 슬로우로 적 묶고 평타 견제.",
      },
      {
        name: "Q 발동 한타",
        sequence: "Q → 평타 도배 (광역)",
        description: "Q로 광역 평타 발동, 한타에서 다중 타겟 딜.",
      },
      {
        name: "글로벌 픽",
        sequence: "R (수정화살) → 텔포 갱크 또는 한타 시작",
        description: "궁극기로 멀리서 적 묶고 팀 합류.",
      },
    ],
    earlyGame: [
      "W는 견제 + CS 마무리 우선",
      "1렙부터 W로 강한 견제 가능",
      "Q는 한타 모드, 라인전엔 마나 관리",
      "6렙 궁극기 사이드 라인 픽에 사용 가능",
      "패시브 (느려진 적 추가 데미지) 활용",
    ],
    midGame: [
      "팀 합류 우선 (이동기 없음)",
      "궁극기로 글로벌 픽 시도",
      "오브젝트 한타 시 후방 위치",
      "Q 광역 평타로 한타 시작",
      "사이드 가지 말 것",
    ],
    lateGame: [
      "한타 후방 평타 도배",
      "Q 광역 평타로 다중 타겟 딜",
      "W 슬로우로 적 추격 또는 도주",
      "궁극기 한타 시작 또는 도주 적 마무리",
      "본인이 죽지 않는 게 가장 중요",
    ],
    tips: [
      "Q는 한타 시작 전 항상 준비",
      "W 슬로우 발동 패시브 활용",
      "궁극기는 견제용이 아닌 픽/한타 시작용",
      "치명타보다 평속 빌드가 더 효율적 (메타에 따라)",
      "사거리 길이로 항상 후방에서",
    ],
    goodAgainst: ["베인", "코그모", "트리스타나", "이즈리얼", "징크스"],
    badAgainst: ["드레이븐", "루시안", "사미라", "퀸", "케일"],
    recommendedRunes: {
      primary: "정밀 - 치명적 속도 / 침착 / 전설: 핏빛 / 최후의 일격",
      secondary: "영감 - 비스킷 배달 / 시간 왜곡 물약",
      note: "치명적 속도로 평타 캐리, 비스킷으로 라인전 유지",
    },
    recommendedItems: {
      core: ["크라켄 학살자", "광전사의 군화", "루난의 허리케인"],
      situational: ["수호 천사", "고통의 지팡이", "구인수의 격노검"],
    },
    sources: [
      { videoId: "WH3tYZZyzjA", title: "애쉬 운영법 - 프린스 장인초대석", channel: "테스터훈 TesterHoon", duration: "13:23", viewCount: "조회수 94,000회" },
      { videoId: "iIhrhfGWb20", title: "애쉬 1만판 장인초대석", channel: "테스터훈 TesterHoon", duration: "16:00", viewCount: "조회수 75,000회" },
    ],
  },

  // ===== 아리 =====
  {
    championId: "Ahri",
    championKr: "아리",
    position: "mid",
    oneLine: "안전한 픽형 메이지. 로밍과 픽 능력으로 게임 캐리",
    difficulty: 2,
    damageType: "AP",
    strengths: [
      "궁극기 (영혼 질주) 로 안전한 진입/도주",
      "Q 매혹 + W 자동 추적으로 안정적 견제",
      "라인 클리어 + 로밍 능력 우수",
      "초보자도 안전하게 다룰 수 있음",
    ],
    weaknesses: [
      "스킬 적중 없으면 데미지 약함",
      "한타 시 진입 후 즉사 가능성",
      "단단한 챔프 상대 어려움",
      "매혹 (E) 명중률에 의존",
    ],
    combos: [
      {
        name: "기본 콤보",
        sequence: "E (매혹) → W → Q → 평타",
        description: "매혹 적중 후 W로 자동 추적, Q로 추가 딜.",
      },
      {
        name: "올인",
        sequence: "R (3회) → E → W → Q → 평타",
        description: "궁극기 3번으로 진입 → 매혹 → 콤보 → 마무리.",
      },
      {
        name: "도주",
        sequence: "R (3회) → 안전한 위치로 이동",
        description: "궁극기 3번으로 위험 상황 회피.",
      },
    ],
    earlyGame: [
      "Q로 안전한 라인 클리어",
      "W는 마나 관리하며 견제용",
      "E (매혹) 명중률 연습",
      "6렙 직후 적극적 로밍 (사이드 갱크)",
      "매혹 한 번 명중 시 즉시 올인",
    ],
    midGame: [
      "로밍으로 사이드 라인 압박",
      "오브젝트 시야 잡고 한타 합류",
      "궁극기 3번 활용해 적 캐리 컷",
      "팀 한타 시 진입 → 즉시 백",
      "스플릿보다 합류 우선",
    ],
    lateGame: [
      "한타에서 매혹으로 픽 시도",
      "궁극기 3번 활용해 진입 / 마무리 / 도주",
      "적 캐리 컷 우선",
      "절대 한 번에 다 쏟지 말 것 (궁 1번 남겨두기)",
      "단단한 챔프는 회피하고 스쿼시 우선",
    ],
    tips: [
      "매혹 (E) 은 미니언 사이로 사용 (적이 회피 어려움)",
      "궁극기 3번을 한 번에 쓰지 말고 1번 남겨두기",
      "W는 자동 추적이므로 가까이 가서 사용",
      "로밍 동선 미리 계산",
      "한타 시 진입 → 콤보 → 즉시 백 패턴",
    ],
    goodAgainst: ["빅토르", "오리아나", "라이즈", "아지르", "베이가"],
    badAgainst: ["야스오", "제드", "카타리나", "탈론", "리븐"],
    recommendedRunes: {
      primary: "마법 - 신비로운 유성 / 마나순환 팔찌 / 초월 / 폭풍 모으기",
      secondary: "영감 - 비스킷 배달 / 시간 왜곡 물약",
      note: "유성으로 견제 강화, 폭풍 모으기로 후반 깡딜",
    },
    recommendedItems: {
      core: ["루덴의 메아리", "마법사의 신발", "비전 형광 막대"],
      situational: ["존야의 모래시계 (위험 상황)", "공허의 지팡이", "라반돈의 죽음모자"],
    },
    sources: [
      { videoId: "UyosyMNcYrM", title: "아리 실력차이는 어디서 날까?", channel: "프로관전러 P.S", duration: "16:04", viewCount: "조회수 287,000회" },
      { videoId: "7SBfqsOzUbo", title: "아리 원챔 챌린저 장인초대석", channel: "테스터훈 TesterHoon", duration: "19:15", viewCount: "조회수 186,000회" },
      { videoId: "0kV1NCWcyBw", title: "초보자를 위한 아리 강의", channel: "달스", duration: "19:51", viewCount: "조회수 76,000회" },
    ],
  },

  // ===== 제이스 =====
  {
    championId: "Jayce",
    championKr: "제이스",
    position: "top",
    oneLine: "포커 + 폭딜 가능한 멀티 모드 챔피언. 코어 콤보가 핵심",
    difficulty: 4,
    damageType: "AD",
    strengths: [
      "원거리 모드로 강력한 라인 견제",
      "근거리 모드로 폭딜 + 진입",
      "1렙부터 강한 라인전",
      "사이드 운영 + 한타 모두 가능",
    ],
    weaknesses: [
      "이동기 부족 (E 점프만)",
      "강한 챔프지만 다루기 매우 어려움",
      "후반 캐리력은 일반 탑 챔보다 약함",
      "강한 갱킹 정글러 상대로 약함",
    ],
    combos: [
      {
        name: "QE 포커 (원거리)",
        sequence: "E (가속) → Q (강화 캐넌)",
        description: "E로 Q 데미지 강화, 사거리 + 데미지 모두 강화.",
      },
      {
        name: "올인 콤보",
        sequence: "Q (원거리) → R (근거리 변환) → E (망치 진입) → Q (망치) → A → W (속공)",
        description: "원거리 견제 후 근거리 변환, 망치 진입, 풀콤보.",
      },
      {
        name: "도주",
        sequence: "R (원거리 변환) → E (가속) → 도주",
        description: "근거리에서 위험 시 원거리 변환, E 가속으로 도주.",
      },
    ],
    earlyGame: [
      "1렙부터 Q (원거리) 로 강한 견제",
      "QE 콤보로 라인전 압박",
      "근거리 변환은 적이 약해졌을 때만",
      "킬 노릴 수 있으면 풀콤보 즉시",
      "사이드 라인 우위로 정글 압박",
    ],
    midGame: [
      "사이드 운영 (1번 스플릿)",
      "원거리 모드로 안전한 견제",
      "근거리 모드로 적 캐리 컷",
      "한타 시작 전 원거리 모드로 포킹",
      "오브젝트 시야 잡고 한타 합류",
    ],
    lateGame: [
      "한타에서 원거리 + 근거리 변환 적극 활용",
      "적 캐리 컷 가능 시 근거리 진입",
      "후방 안전한 위치에서 원거리 견제",
      "스플릿 푸셔로서 압박",
      "본인 죽지 않는 게 가장 중요",
    ],
    tips: [
      "QE 콤보 (원거리 모드) 가 라인전의 핵심",
      "근거리 변환은 신중히 (도주기 부족)",
      "초반 솔킬은 풀콤보로 가능",
      "사이드 운영 시 항상 시야 확인",
      "오브젝트 한타에 늦지 말 것",
    ],
    goodAgainst: ["가렌", "사이온", "오른", "마오카이", "초가스"],
    badAgainst: ["피오라", "다리우스", "이렐리아", "잭스", "리븐"],
    recommendedRunes: {
      primary: "지배 - 감전 / 피의 맛 / 사냥의 증표 / 굶주린 사냥꾼",
      secondary: "정밀 - 침착 / 최후의 일격",
      note: "감전으로 폭딜, 피의 맛으로 라인전 회복",
    },
    recommendedItems: {
      core: ["먹물 검 (이클립스)", "광전사의 군화", "콜렉터"],
      situational: ["수호 천사", "데스 댄스", "수은 장식띠"],
    },
    sources: [
      { videoId: "uV7TlQDmqeY", title: "제이스 실력차이는 어디서 날까?", channel: "프로관전러 P.S", duration: "16:25", viewCount: "조회수 268,000회" },
      { videoId: "5_AclKzrU3M", title: "제이스 전세계 1위 김망치 장인초대석", channel: "테스터훈 TesterHoon", duration: "23:06", viewCount: "조회수 267,000회" },
      { videoId: "_wpdRk39tUE", title: "제이스 풀콤보 200% 활용", channel: "테스터훈 TesterHoon", duration: "19:32", viewCount: "조회수 247,000회" },
    ],
  },
];

// 모든 가이드 합치기
export const allChampionGuides: ChampionGuide[] = [
  ...championGuides,
  ...championGuidesBatch2,
  ...championGuidesBatch3,
];

export function getChampionGuide(championId: string): ChampionGuide | undefined {
  return allChampionGuides.find((g) => g.championId === championId);
}
