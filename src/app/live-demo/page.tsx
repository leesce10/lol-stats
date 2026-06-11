"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 오버레이 앱(lol-overlay)이 호출하는 것과 동일한 API를 브라우저에서 그대로 호출하는 데모.
// 게임 시작 조합 브리핑 + TTS를 어디서든(원격 포함) 확인할 수 있다.

interface Participant {
  riotId?: string;
  championKey: string;
  teamId: number;
  position: string;
}

interface Briefing {
  compEdge: "ahead" | "behind" | "even";
  ourWinRate: number;
  ourStrengths: string[];
  ourWeaknesses: string[];
  theirStrengths: string[];
  theirWeaknesses: string[];
  timing: "early" | "late" | "balanced";
  gamePlan: string[];
  tts: string;
}

interface AnalysisResponse {
  ok: boolean;
  source: string;
  briefing: Briefing | null;
}

// 프리셋 조합 (teamId 100 = 우리팀/블루, 200 = 상대/레드)
const PRESETS: { label: string; participants: Participant[] }[] = [
  {
    label: "한타·이니시 조합",
    participants: [
      { championKey: "Darius", teamId: 100, position: "TOP" },
      { championKey: "Sejuani", teamId: 100, position: "JUNGLE" },
      { championKey: "Orianna", teamId: 100, position: "MIDDLE" },
      { championKey: "Jinx", teamId: 100, position: "BOTTOM" },
      { championKey: "Leona", teamId: 100, position: "UTILITY" },
      { championKey: "Fiora", teamId: 200, position: "TOP" },
      { championKey: "Graves", teamId: 200, position: "JUNGLE" },
      { championKey: "Zed", teamId: 200, position: "MIDDLE" },
      { championKey: "Ezreal", teamId: 200, position: "BOTTOM" },
      { championKey: "Lulu", teamId: 200, position: "UTILITY" },
    ],
  },
  {
    label: "스플릿·암살 조합",
    participants: [
      { championKey: "Fiora", teamId: 100, position: "TOP" },
      { championKey: "Graves", teamId: 100, position: "JUNGLE" },
      { championKey: "Zed", teamId: 100, position: "MIDDLE" },
      { championKey: "Caitlyn", teamId: 100, position: "BOTTOM" },
      { championKey: "Thresh", teamId: 100, position: "UTILITY" },
      { championKey: "Malphite", teamId: 200, position: "TOP" },
      { championKey: "Sejuani", teamId: 200, position: "JUNGLE" },
      { championKey: "Orianna", teamId: 200, position: "MIDDLE" },
      { championKey: "Jinx", teamId: 200, position: "BOTTOM" },
      { championKey: "Leona", teamId: 200, position: "UTILITY" },
    ],
  },
];

const EDGE_LABEL: Record<string, string> = {
  ahead: "조합 우위",
  behind: "조합 열세",
  even: "조합 호각",
};

const DDV = "15.7.1";

interface Timing {
  ok: boolean;
  incomePerSec: number;
  target: {
    itemId: number;
    name: string;
    image: string;
    totalCost: number;
    investedValue: number;
    remainingCost: number;
  } | null;
  secondsToAfford: number;
}

// 다음 코어 완성 예상 — 아이콘이 남은 초와 함께 내려오는 시각화 (내 기준)
function ItemTimingDemo() {
  const START_GOLD = 1300;
  const [t, setT] = useState<Timing | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // 프리셋: 몰왕검(3153) 빌드 중. 골드를 남은 비용보다 적게 잡아 카운트다운이 보이게.
  useEffect(() => {
    fetch("/api/live/item-timing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameTime: 780,
        currentGold: START_GOLD,
        creepScore: 150,
        items: [1053, 1037],
        targetItemId: 3153,
      }),
    })
      .then((r) => r.json())
      .then((data: Timing) => setT(data))
      .catch(() => {});
  }, []);

  // 매 프레임 경과시간 갱신 → 골드가 연속적으로 차올라 아이콘이 부드럽게 내려옴
  useEffect(() => {
    if (!t?.target) return;
    let raf = 0;
    let start: number | null = null;
    const loop = (ts: number) => {
      if (start === null) start = ts;
      setElapsed((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [t]);

  if (!t?.target) return null;

  const remaining = t.target.remainingCost;
  const income = t.incomePerSec;
  const needTime = Math.max(1, (remaining - START_GOLD) / income); // 완성까지 초
  const e = elapsed % (needTime + 3); // 0s 도달 후 3초 멈췄다 반복
  const simGold = Math.min(remaining, START_GOLD + income * e);
  const secLeft = Math.max(0, Math.ceil((remaining - simGold) / income));
  const affordable = simGold >= remaining;
  // 위(멀었음) → 아래(0s). 경과시간 기반이라 연속적으로 이동.
  const topPct = Math.min(100, (Math.min(e, needTime) / needTime) * 100);

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1">다음 코어 완성 예상</h2>
      <p className="text-[11px] text-slate-400 mb-3">
        내 골드 + 수급속도로 <b>{t.target.name}</b> 완성까지 남은 시간. 아이콘이
        0s까지 내려오면 살 수 있는 골드 확보. (수급 {t.incomePerSec}g/s)
      </p>
      <div className="flex gap-4">
        {/* 세로 트랙 */}
        <div className="relative w-14 h-56 rounded-lg bg-black/40 border border-white/10">
          <div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{ top: `calc(${topPct}% - 22px)` }}
          >
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/item/${t.target.image}`}
              alt={t.target.name}
              style={{ width: 40, height: 40, maxWidth: "none", flexShrink: 0 }}
              className={`rounded-md border ${
                affordable ? "border-emerald-400" : "border-amber-400/60"
              }`}
            />
            <span
              style={{ minWidth: 52, textAlign: "center", whiteSpace: "nowrap" }}
              className={`mt-1 text-xs font-bold px-1.5 rounded ${
                affordable
                  ? "bg-emerald-500/30 text-emerald-100"
                  : "bg-black/70 text-amber-200"
              }`}
            >
              {affordable ? "구매가능" : `${secLeft}s`}
            </span>
          </div>
          {/* 0s 바닥 라인 */}
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-slate-500">
            0s
          </div>
        </div>

        <div className="flex-1 text-[12.5px] text-slate-300 self-center space-y-1">
          <div>
            총 비용 <b>{t.target.totalCost}</b> · 보유분{" "}
            <b>{t.target.investedValue}</b>
          </div>
          <div>
            남은 비용 <b className="text-amber-300">{remaining}</b>
          </div>
          <div>
            현재 골드(시뮬) <b>{Math.floor(simGold)}</b>
          </div>
          {affordable && (
            <div className="text-emerald-300 font-bold">
              지금 {t.target.name} 구매 가능!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 부활 대기시간(초) = 레벨별 기본값 BRW × (1 + 시간증가계수). 레벨·게임시간은 화면에 보이는 값.
function respawnSeconds(level: number, gameSec: number): number {
  const BRW = [
    10, 10, 12, 12, 14, 16, 20, 25, 28.5, 32.5, 35, 37.5, 40, 42.5, 45, 47.5,
    50, 52.5,
  ];
  const lvl = Math.max(1, Math.min(18, Math.round(level)));
  const brw = BRW[lvl - 1];
  const min = gameSec / 60;
  // 15분부터 분당 약 2%씩 증가(최대 +50%) — 추정
  const tif = min > 15 ? Math.min(0.5, (min - 15) * 0.02) : 0;
  return brw * (1 + tif);
}

// 적 처치 후 좌측 타임라인: 챔피언 아이콘이 남은 복귀 시간과 함께 내려옴
function RespawnTimelineDemo() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const loop = (ts: number) => {
      if (start === null) start = ts;
      setElapsed((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 시나리오: 피오라(레벨 11) 처치, 약 16분. 부활 + 라인 복귀 이동(약 12초) = 복귀 예상
  const champ = "Fiora";
  const total = Math.round(respawnSeconds(11, 1000)) + 12;
  const e = elapsed % (total + 3); // 카운트다운 + "복귀" 1초 + 빈 2초 후 반복
  const remaining = Math.max(0, Math.ceil(total - e));
  const back = e >= total;
  const visible = e < total + 1; // "복귀" 표시 1초 뒤 사라짐
  const topPct = Math.min(100, (Math.min(e, total) / total) * 100);

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1">적 처치 후 복귀 타이머</h2>
      <p className="text-[11px] text-slate-400 mb-3">
        적 라이너를 처치하면 좌측 타임라인에 챔피언 아이콘 + 남은 복귀 예상
        시간이 내려옵니다. 무리한 푸시로 손해 보는 걸 줄이는 용도. (레벨·게임시간
        기반 계산)
      </p>
      <div className="flex gap-4">
        <div className="relative w-14 h-64 rounded-lg bg-black/40 border border-white/10">
          {visible && (
          <div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{ top: `calc(${topPct}% - 24px)` }}
          >
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${DDV}/img/champion/${champ}.png`}
              alt={champ}
              style={{ width: 44, height: 44, maxWidth: "none", flexShrink: 0 }}
              className={`rounded-full border-2 ${
                back ? "border-emerald-400" : "border-rose-500/70"
              }`}
            />
            <span
              style={{ minWidth: 52, textAlign: "center", whiteSpace: "nowrap" }}
              className={`mt-1 text-xs font-bold px-1.5 rounded ${
                back
                  ? "bg-emerald-500/30 text-emerald-100"
                  : "bg-black/70 text-rose-200"
              }`}
            >
              {back ? "복귀" : `${remaining}s`}
            </span>
          </div>
          )}
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-slate-500">
            복귀
          </div>
        </div>

        <div className="flex-1 text-[12.5px] text-slate-300 self-center space-y-1">
          <div>
            처치 대상 <b>피오라</b> (레벨 11)
          </div>
          <div>
            복귀 예상 <b className="text-rose-300">{total}초</b>
          </div>
          <div className="text-[11px] text-slate-400">
            = 부활 대기 + 라인 복귀 이동(추정)
          </div>
          {back && (
            <div className="text-emerald-300 font-bold">복귀 — 라인 압박 주의</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FightResult {
  verdict: string;
  score: number;
  reason: string;
  objective: string;
  secondsToObjective: number;
  my: { effective: number };
  enemy: { effective: number };
}

const VERDICT_STYLE: Record<string, string> = {
  "매우 유리": "bg-emerald-500/30 text-emerald-100 border-emerald-400",
  유리: "bg-green-500/25 text-green-100 border-green-400/60",
  호각: "bg-white/10 text-slate-200 border-white/20",
  불리: "bg-amber-500/25 text-amber-100 border-amber-400/60",
  "매우 불리": "bg-rose-500/30 text-rose-100 border-rose-400",
};

// 오브젝트 교전 분석: 스폰 60초 전부터 좌측 타임라인에 오브젝트 + 판정
function ObjectiveFightDemo() {
  const [a, setA] = useState<FightResult | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch("/api/live/fight-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secondsToObjective: 60,
        gameTime: 1500,
        myTeamId: 100,
        objective: "드래곤",
        players: [
          { teamId: 100, level: 13, items: [3153, 3006] },
          { teamId: 100, level: 13, items: [6692] },
          { teamId: 100, level: 12, items: [3157] },
          { teamId: 100, level: 13, items: [3031] },
          { teamId: 100, level: 12, items: [3850] },
          { teamId: 200, level: 12, items: [3153] },
          { teamId: 200, level: 12, items: [6692] },
          { teamId: 200, level: 11, items: [3157] },
          { teamId: 200, level: 12, items: [3031] },
          { teamId: 200, level: 11, items: [3850], isDead: true, respawnTimer: 55 },
        ],
      }),
    })
      .then((r) => r.json())
      .then(setA)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!a) return;
    let raf = 0;
    let start: number | null = null;
    const loop = (ts: number) => {
      if (start === null) start = ts;
      setElapsed((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [a]);

  if (!a) return null;

  const win = a.secondsToObjective; // 60초 창
  const e = elapsed % (win + 4);
  const secToSpawn = Math.max(0, Math.ceil(win - e));
  const spawned = e >= win;
  const topPct = Math.min(100, (Math.min(e, win) / win) * 100);
  const vStyle = VERDICT_STYLE[a.verdict] || VERDICT_STYLE["호각"];

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1">오브젝트 교전 분석</h2>
      <p className="text-[11px] text-slate-400 mb-3">
        오브젝트 스폰 60초 전부터, 핵심 아이템·평균 레벨 차·죽은 팀원 복귀
        가능 여부를 종합해 <b>지금 싸우면 유리한지</b> 판정. (좌측 타임라인)
      </p>
      <div className="flex gap-4">
        <div className="relative w-14 h-64 rounded-lg bg-black/40 border border-white/10">
          <div
            className="absolute left-0 right-0 flex flex-col items-center"
            style={{ top: `calc(${topPct}% - 24px)` }}
          >
            <div
              style={{ width: 44, height: 44, flexShrink: 0 }}
              className="rounded-full border-2 border-purple-400/70 bg-purple-900/50 flex items-center justify-center text-2xl"
            >
              🐉
            </div>
            <span
              style={{ minWidth: 56, textAlign: "center", whiteSpace: "nowrap" }}
              className={`mt-1 text-[11px] font-bold px-1.5 rounded border ${vStyle}`}
            >
              {a.verdict}
            </span>
          </div>
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-slate-500">
            스폰
          </div>
        </div>

        <div className="flex-1 text-[12.5px] text-slate-300 self-center space-y-1">
          <div>
            <b>{a.objective}</b> 스폰까지{" "}
            <b className="text-purple-300">{spawned ? "0s — 지금!" : `${secToSpawn}s`}</b>
          </div>
          <div className="text-[12px]">
            교전 인원 <b>{a.my.effective}</b> : <b>{a.enemy.effective}</b>
          </div>
          <div className="text-[11px] text-slate-400">{a.reason}</div>
          <div
            className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded border ${vStyle}`}
          >
            {a.verdict}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveDemoPage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [voice, setVoice] = useState("hyunsu");
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [status, setStatus] = useState("조합 분석 중…");
  const lastTts = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 브라우저 기본 음성 (성우 TTS 재생 실패 시 폴백)
  const fallbackSpeak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

  // 서버의 성우급 TTS(mp3) 재생
  const speak = useCallback(
    (text: string) => {
      if (!text) return;
      // 이전에 깔린 브라우저 폴백 음성이 있으면 즉시 중단 (이중 재생 방지)
      if (typeof window !== "undefined" && window.speechSynthesis)
        window.speechSynthesis.cancel();

      const url = `/api/live/tts?text=${encodeURIComponent(text)}&voice=${voice}`;
      try {
        if (!audioRef.current) audioRef.current = new Audio();
        const a = audioRef.current;
        a.pause();
        // 폴백은 '진짜 로드 실패(onerror)'일 때만. play() promise의 일시적 reject로는 폴백하지 않음
        a.onerror = () => fallbackSpeak(text);
        a.src = url;
        a.play().catch(() => {
          /* autoplay 정책 등 일시적 거부는 무시 — 실제 실패는 onerror가 처리 */
        });
      } catch {
        fallbackSpeak(text);
      }
    },
    [fallbackSpeak, voice]
  );

  const run = useCallback(
    async (idx: number, withVoice: boolean) => {
      setStatus("조합 분석 중…");
      setData(null);
      try {
        const res = await fetch("/api/live/team-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            myTeamId: 100,
            participants: PRESETS[idx].participants,
          }),
        });
        const json: AnalysisResponse = await res.json();
        setData(json);
        lastTts.current = json.briefing?.tts ?? "";
        if (withVoice) speak(lastTts.current);
      } catch (e) {
        setStatus("분석 실패: " + (e as Error).message);
      }
    },
    [speak]
  );

  useEffect(() => {
    run(presetIdx, false); // 첫 로드는 자동 음성 막힘이 많아 소리 없이 렌더만
  }, [presetIdx, run]);

  const b = data?.briefing;

  return (
    <main className="min-h-screen bg-[#0a0c12] text-slate-100 px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold mb-1">게임 시작 조합 브리핑 (데모)</h1>
        <p className="text-xs text-slate-400 mb-4">
          오버레이 앱이 호출하는 것과 동일한 API. 조합 분석은 실데이터, 라인
          폼/팀운은 추정(mock)이라 음성으로 읽지 않습니다.
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPresetIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                i === presetIdx
                  ? "bg-blue-500/25 border-blue-400/50 text-blue-100"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-400">음성</span>
          {[
            { key: "female", label: "여성(SunHi)" },
            { key: "male", label: "남성(InJoon)" },
            { key: "hyunsu", label: "남성·자연(Hyunsu)" },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => {
                setVoice(v.key);
                if (lastTts.current) {
                  const url = `/api/live/tts?text=${encodeURIComponent(
                    lastTts.current
                  )}&voice=${v.key}`;
                  if (!audioRef.current) audioRef.current = new Audio();
                  audioRef.current.pause();
                  audioRef.current.src = url;
                  audioRef.current.play().catch(() => {});
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs border ${
                v.key === voice
                  ? "bg-emerald-500/25 border-emerald-400/50 text-emerald-100"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-black/40 border border-blue-400/25 shadow-xl p-4">
          {!b ? (
            <div className="text-sm text-slate-400 py-6">{status}</div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold">게임 브리핑</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    b.compEdge === "ahead"
                      ? "bg-green-500/25 text-green-200"
                      : b.compEdge === "behind"
                        ? "bg-red-500/25 text-red-200"
                        : "bg-white/10 text-slate-200"
                  }`}
                >
                  {EDGE_LABEL[b.compEdge]}
                </span>
                <button
                  onClick={() => speak(lastTts.current)}
                  className="ml-auto text-lg"
                  title="음성으로 듣기"
                >
                  🔊
                </button>
              </div>

              <h3 className="text-[13px] text-amber-300 font-semibold mb-1">
                게임 플랜
              </h3>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-[13px]">
                {(b.gamePlan.length
                  ? b.gamePlan
                  : ["특이사항 없음 — 기본에 충실하게"]
                ).map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>

              <div className="flex gap-3 text-[12.5px]">
                <div className="flex-1">
                  <h4 className="text-blue-300 mb-1">우리 강점</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {(b.ourStrengths.length
                      ? b.ourStrengths
                      : ["뚜렷한 강점 없음"]
                    ).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <h4 className="text-rose-300 mb-1">상대 강점 (주의)</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {(b.theirStrengths.length
                      ? b.theirStrengths
                      : ["뚜렷한 강점 없음"]
                    ).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-500">
                🔊 음성: “{b.tts}”
              </p>
            </>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          소리가 안 나면 🔊 버튼을 누르세요 (브라우저가 클릭 없는 자동 음성을
          막습니다).
        </p>

        {/* 인게임 '적 아이템 구매' 알림 미리보기 (모양 확인용) */}
        <div className="mt-6">
          <h2 className="text-sm font-bold mb-1">인게임 알림 미리보기</h2>
          <p className="text-[11px] text-slate-400 mb-2">
            적이 시야에 보였을 때 새로 산 아이템을 이렇게 띄웁니다. (실제로는
            게임 화면 위 오버레이로 표시)
          </p>
          <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/70 border border-blue-400/30 shadow-lg">
            <span className="text-xs font-bold text-white bg-[#c0392b] rounded-md px-1.5 py-0.5">
              적
            </span>
            <img
              src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/Zed.png"
              alt="champion"
              width={36}
              height={36}
              className="rounded-full border border-white/25"
            />
            <img
              src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3157.png"
              alt="item"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="text-[13px] leading-tight">
              <b>존야의 모래시계</b> 구매
            </span>
          </div>
        </div>

        <ItemTimingDemo />

        <RespawnTimelineDemo />

        <ObjectiveFightDemo />
      </div>
    </main>
  );
}
