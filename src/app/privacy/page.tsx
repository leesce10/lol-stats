import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 · LOL Stats",
  description: "LOL Stats의 개인정보처리방침. 수집하는 정보, 사용 목적, 보관 기간, 제3자 제공에 관한 안내.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-[var(--text-primary)]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">최종 수정: 2026년 4월 23일</p>

      <section className="space-y-6 text-sm sm:text-base leading-7">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. 수집하는 정보</h2>
          <p>
            LOL Stats(이하 &quot;서비스&quot;)는 리그 오브 레전드 통계 분석을 제공합니다. 본 서비스는 회원가입이 필요하지 않으며,
            개인 식별 정보(이름, 이메일, 전화번호 등)를 수집하지 않습니다.
          </p>
          <p className="mt-2">
            이용자가 소환사명 검색 기능을 사용할 경우, Riot Games의 공개 API를 통해 공개된 전적 정보만 조회하며,
            해당 정보는 서버에 별도로 저장하지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. 자동 수집 정보</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>접속 IP 주소 (서버 로그, 보안 목적)</li>
            <li>브라우저 종류 및 OS</li>
            <li>방문 페이지 및 체류 시간 (익명화된 분석 용도)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. 게임 데이터 수집</h2>
          <p>
            서비스는 Riot Games API를 통해 리그 오브 레전드 공개 매치 데이터(소환사명, 챔피언, 승패, KDA 등)를 수집하여
            통계 분석에 사용합니다. 이 데이터는 Riot Games의 <a href="https://developer.riotgames.com/terms" className="underline text-[var(--accent-blue)]">개발자 약관</a>에
            따라 공개된 정보이며, 서비스는 Riot Games의 가이드라인을 준수합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. 쿠키 및 로컬 스토리지</h2>
          <p>
            서비스는 이용자 경험 향상을 위해 브라우저 로컬 스토리지에 사용자 설정(테마, 필터 등)을 저장할 수 있으며,
            이 정보는 서버로 전송되지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. 제3자 제공</h2>
          <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우 예외로 합니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>법령에 의거한 수사기관의 적법한 요청이 있는 경우</li>
            <li>이용자가 사전에 명시적으로 동의한 경우</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. 보관 및 파기</h2>
          <p>
            수집된 공개 매치 데이터는 통계 분석을 위해 최대 6개월간 보관되며, 이후 자동으로 집계 처리 후 원본은 파기됩니다.
            서버 로그는 3개월 후 자동 삭제됩니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">7. 이용자 권리</h2>
          <p>
            이용자는 언제든지 서비스 이용을 중단할 수 있으며, 본인 소환사명과 관련된 데이터 삭제를 요청할 수 있습니다.
            요청은 아래 문의처로 연락주시기 바랍니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">8. 문의처</h2>
          <p>
            이메일: <a href="mailto:hobbying.dev1@gmail.com" className="underline text-[var(--accent-blue)]">hobbying.dev1@gmail.com</a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">9. 고지의 의무</h2>
          <p>
            본 방침은 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 본 페이지에 공지합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
