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

export default function LiveDemoPage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [status, setStatus] = useState("조합 분석 중…");
  const lastTts = useRef("");

  const speak = useCallback((text: string) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = 1.05;
      const ko = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith("ko"));
      if (ko) u.voice = ko;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

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

        <div className="flex gap-2 mb-4 flex-wrap">
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
      </div>
    </main>
  );
}
