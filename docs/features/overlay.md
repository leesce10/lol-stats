# 인게임 오버레이 — 마스터 기획/관리 문서

> 이 문서가 오버레이 제품의 **단일 진실 공급원(SSOT)**. 현재 상태·핵심 결정·
> 아키텍처·백로그·이슈를 여기서 관리한다. 깊이별 내용은 하단 서브문서 링크 참고.
> 코드 repo: `lol-overlay` (Electron) · 백엔드: `lol-stats` (`/api/live/*`).
> 최종 갱신 2026-06-22.

---

## 0. 한 줄 정의 & 포지셔닝

> **"게임 화면을 떠나지 않고, 지금 필요한 정보를 눈과 귀(한국어 음성)로 받는다."**

- 타깃: **롤 초보~중급, 한국어**. 차별점 = 한국어 음성 코치 · 무료 · ToS 안전 · 맞라인/교전 특화.
- 경쟁: your.gg(Lumi)·op.gg·Blitz·Mobalytics·Porofessor + 2026 AI음성코치 다수.
  대부분 영어·구독·화면판독(회색) → **우리 빈틈 = 한국어·무료·로컬API만**. (→ [overlay-competitive-roadmap.md](overlay-competitive-roadmap.md))

---

## 1. 핵심 결정 로그 (Decision Log)

| 결정 | 내용 | 이유 |
|---|---|---|
| **플랫폼: Overwolf → Electron 피벗** (2026-06) | 자체 Electron .exe로 배포 | Overwolf가 **영어 기본 강제(음성 코치 포함)** + Riot 승인/화이트리스트 게이트 → 한국어 제품 불가. op.gg도 자체 Electron임 |
| **데이터: Live Client Data API만** | `127.0.0.1:2999` 로컬 API | Riot 공식 서드파티용. 인젝션/메모리/화면판독 ❌ → 밴 안전 (→ [live-api.md](live-api.md)) |
| **ToS 경계** | 클라가 이미 아는 정보만(탭 스코어보드·공개 스폰시간·내 조합) | 적 쿨타임·위치·골드·실시간스탯은 API에 없음 & 금지 → 의도적으로 안 씀 |
| **배포: GitHub Actions → .exe** | Windows에서 자동 빌드 → `release-latest` Release | 맥에서도 빌드 가능. 사이트가 그 .exe 링크 |
| **코드서명: 미적용(베타)** | 무서명 .exe → SmartScreen 경고("추가정보→실행") | 정식화 시 Azure Trusted Signing(~월$10) 또는 MS Store(MSIX, $19 1회)로 해소 |
| **수익화 모델(예정)** | **다운 자유 + 로그인/구독으로 작동 게이트(서버 검증)** | 다운 게이트는 재배포로 무력화. 프리미엄(TTS/분석)이 서버 경유라 서버에서 잠그면 우회 불가. 무료=로컬계산, 유료=서버기능 |
| **공개 배포 전 Riot 서드파티 앱 등록** | 미완 | 정책상 안전장치 + 웹 Production 키 겸용 |

---

## 2. 아키텍처 (Electron)

```
[main.js] 로컬 LCD(127.0.0.1:2999) 1초 폴링 → 게임 감지
   │  창 생성/배치(투명·클릭통과·항상위), 트레이, IPC 중계
   ├─ lcd-update ─▶ [engine.js] (숨은 창) 분석 두뇌 + TTS 재생
   │                   │  background.js 포팅(게임로직 동일, I/O만 교체)
   │                   └─ sendUi ─▶ main ─▶ overlay/timeline 창
   ├─ overlay 창: 적 아이템 토스트  (UI: windows/overlay/overlay.html 재사용)
   └─ timeline 창: 복귀+오브젝트     (UI: windows/timeline/timeline.html 재사용)

[lol-stats 백엔드]  /api/live/team-analysis · fight-analysis · tts(Edge TTS+Supabase 캐시)
```
- UI는 `windows/*.html` 단일 소스 → `sync-ui.js`가 빌드 전 electron/로 복사(.exe 자체완결).
- 데이터 매핑: Riot camelCase(`activePlayer`…) → engine 기대 키(`active_player`…).
- Riot API 키는 **백엔드에만**. 앱엔 절대 안 넣음.

---

## 3. 구현된 기능 (현재 상태)

| # | 기능 | 표시/방식 | 상태 |
|---|---|---|---|
| 1 | **게임시작 조합 브리핑** | 한국어 여성 TTS 자동재생 | ✅ |
| 2 | **적 코어아이템 구매 알림** | 하단 토스트(적+챔프+아이템+"구매"). 1회/코어템/최신버전 | ✅ |
| 3 | **적 라인복귀 타이머** | 세로선 카운트다운→"복귀". 부활+이동(라인/신발 보정), 내 라인만, 타워깨짐/16분 종료 | ✅ |
| 4 | **오브젝트 교전 유불리** | 판정+숫자근거(인원/레벨/템골드)+행동지시. 드래곤↓/유충·전령·바론↑, 우선순위 교체, 살아있는동안 유지 | ✅ |
| 5 | **오브젝트 교전 음성** | 생성 60s/30s전·소환직후 3회, 이유+핵심숫자+권고 | ✅ |
| 6 | **플랫폼/배포** | Electron 자체앱, 트레이, GitHub Actions 자동 .exe | ✅ |

세부: 교전 숫자 표시 → [fight-stats-display.md](fight-stats-display.md).

---

## 4. 백로그 — 완성도 끌어올리기 (우선순위)

**P0 (지금)**
- [ ] **창 위치/크기 적응형** — 해상도·DPI별 어긋남 방지(현재 고정 좌표) + 사용자 미세조정
- [ ] **음성 설정** — on/off·볼륨·카테고리(브리핑/아이템/교전) 토글 (유지율 직결)
- [ ] **실게임 검증** — 적 아이템 우측 잘림(좁은 창), 오브젝트 전령↔바론 교체 타이밍, 복귀 정확도

**P1**
- [ ] **TTS 다듬기** — 멘트 간결화, 동시재생 충돌 정리(큐/인터럽트 정책)
- [ ] **에러/복원력** — 게임 중 API 끊김·재접속, TTS 실패 재시도, 폴링 백오프
- [ ] **설정 UI(작은 창)** — 위치/음성/표시 항목 토글 저장(localStorage/파일)
- [ ] **자동 업데이트** — electron-updater로 .exe 자동 갱신(재다운 불필요)

**P2 (신규 기능 — 경쟁 로드맵에서)**
- [ ] 파워스파이크 음성(적 6/11/16, 코어템 완성 시 대응 한 줄)
- [ ] 귀환/다음코어템 골드 코치 (내 currentGold)
- [ ] 챔프셀렉트 매치업 음성 코치 (웹 맞라인/위협카드 연동)
- [ ] 포스트게임 음성 리캡 + 다음판 과제 1개
(상세 → [overlay-competitive-roadmap.md](overlay-competitive-roadmap.md))

---

## 5. 알려진 이슈 / 미해결
- 무서명 .exe → SmartScreen 경고(베타 허용, "추가정보→실행").
- 전체화면(exclusive)에선 오버레이 안 그려짐 → **Borderless/창 모드 필요**(안내함).
- `position` 빈 값(봇/블라인드) 시 라인 매칭 폴백(전부 표시 / 첫 타워로 종료).
- 유충 처치 이벤트 없음 → 시간기반 정리.
- 라인복귀/오브젝트 좌표 실게임 미세 검증 필요.

---

## 6. 관련 문서
- [ingame-overlay.md](ingame-overlay.md) — 초기 컨셉(플랫폼 부분은 Electron 피벗으로 대체됨)
- [live-api.md](live-api.md) — Live Client Data API 상세
- [fight-stats-display.md](fight-stats-display.md) — 교전 숫자 근거 표시
- [briefing-upgrade.md](briefing-upgrade.md) — 조합 브리핑 현재구조 vs 개선안
- [overlay-competitive-roadmap.md](overlay-competitive-roadmap.md) — 경쟁 지형 + 신규기능 로드맵
- [champ-select-coach.md](champ-select-coach.md) — 챔프셀렉트 코치(예정)

---

## 7. 변경 이력 (요약)
- 2026-06-22 — 마스터 문서 신설. Electron 피벗·배포·수익화 결정 정리.
- 2026-06 — Overwolf→Electron 전환, GitHub Actions 자동빌드, 교전 숫자 근거, 오브젝트 방향분리/우선순위, 라인복귀 정교화, 아이템 무한반복 수정.
