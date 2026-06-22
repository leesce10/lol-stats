// 자동 생성(scripted): 모든 챔피언 프로파일을 키(id)로 조회하는 공용 인덱스.
// 서버 브리핑(live-analysis)·matchup 등에서 재사용. JSON은 src/data/champion-profiles/*.json.
import type { ChampionProfile } from "@/types/matchup-engine";
import aatrox from "./aatrox.json";
import ahri from "./ahri.json";
import akali from "./akali.json";
import aphelios from "./aphelios.json";
import azir from "./azir.json";
import blitzcrank from "./blitzcrank.json";
import caitlyn from "./caitlyn.json";
import camille from "./camille.json";
import darius from "./darius.json";
import diana from "./diana.json";
import ezreal from "./ezreal.json";
import fiora from "./fiora.json";
import fizz from "./fizz.json";
import galio from "./galio.json";
import gnar from "./gnar.json";
import graves from "./graves.json";
import hecarim from "./hecarim.json";
import irelia from "./irelia.json";
import jax from "./jax.json";
import jinx from "./jinx.json";
import kaisa from "./kaisa.json";
import karma from "./karma.json";
import katarina from "./katarina.json";
import kayn from "./kayn.json";
import khazix from "./khazix.json";
import leblanc from "./leblanc.json";
import leesin from "./leesin.json";
import leona from "./leona.json";
import lucian from "./lucian.json";
import lulu from "./lulu.json";
import malphite from "./malphite.json";
import missfortune from "./missfortune.json";
import nami from "./nami.json";
import nautilus from "./nautilus.json";
import nocturne from "./nocturne.json";
import orianna from "./orianna.json";
import pyke from "./pyke.json";
import renekton from "./renekton.json";
import samira from "./samira.json";
import senna from "./senna.json";
import sett from "./sett.json";
import soraka from "./soraka.json";
import sylas from "./sylas.json";
import syndra from "./syndra.json";
import talon from "./talon.json";
import thresh from "./thresh.json";
import twistedfate from "./twistedfate.json";
import varus from "./varus.json";
import vayne from "./vayne.json";
import vex from "./vex.json";
import viego from "./viego.json";
import viktor from "./viktor.json";
import warwick from "./warwick.json";
import yasuo from "./yasuo.json";
import zed_mid from "./zed-mid.json";
import zed from "./zed.json";

const ALL = [aatrox, ahri, akali, aphelios, azir, blitzcrank, caitlyn, camille, darius, diana, ezreal, fiora, fizz, galio, gnar, graves, hecarim, irelia, jax, jinx, kaisa, karma, katarina, kayn, khazix, leblanc, leesin, leona, lucian, lulu, malphite, missfortune, nami, nautilus, nocturne, orianna, pyke, renekton, samira, senna, sett, soraka, sylas, syndra, talon, thresh, twistedfate, varus, vayne, vex, viego, viktor, warwick, yasuo, zed_mid, zed] as unknown as ChampionProfile[];

// 키(예: "Darius","Zed") → 프로파일 목록. 같은 id가 라인별로 여러 개일 수 있음
// (예: Zed = mid/jungle 둘 다). lane을 주면 그 라인 프로파일을 우선 반환.
const PROFILES_BY_KEY: Record<string, ChampionProfile[]> = {};
for (const p of ALL) {
  if (!p || !p.id) continue;
  if (!PROFILES_BY_KEY[p.id]) PROFILES_BY_KEY[p.id] = [];
  PROFILES_BY_KEY[p.id].push(p);
}

export function getProfileByKey(
  key?: string | null,
  lane?: string | null
): ChampionProfile | null {
  if (!key) return null;
  const list = PROFILES_BY_KEY[key];
  if (!list || !list.length) return null;
  if (lane) {
    const m = list.find((p) => p.position === lane);
    if (m) return m;
  }
  return list[0];
}
