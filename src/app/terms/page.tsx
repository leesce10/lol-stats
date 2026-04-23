import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 · LOL Stats",
  description: "LOL Stats 서비스 이용약관. 서비스의 목적, 이용 조건, 면책 조항에 관한 안내.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-[var(--text-primary)]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">이용약관</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">최종 수정: 2026년 4월 23일</p>

      <section className="space-y-6 text-sm sm:text-base leading-7">
        <div>
          <h2 className="text-lg font-semibold mb-2">제1조 (목적)</h2>
          <p>
            본 약관은 LOL Stats(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 서비스 제공자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제2조 (서비스의 내용)</h2>
          <p>서비스는 리그 오브 레전드의 공개된 게임 데이터를 수집·분석하여 다음 기능을 무료로 제공합니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>챔피언 통계(승률, 픽률, 밴률, 티어)</li>
            <li>맞라인 분석 및 공략 가이드</li>
            <li>팀 조합 분석</li>
            <li>챔피언 상세 가이드</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제3조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>서비스를 자동화된 방법(크롤러, 봇 등)으로 비정상 호출하는 행위</li>
            <li>서비스를 리버스 엔지니어링하거나 무단으로 복제·배포하는 행위</li>
            <li>타인의 개인정보를 도용하거나 서비스에 허위 정보를 등록하는 행위</li>
            <li>서비스 운영을 방해하는 일체의 행위</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제4조 (데이터 출처)</h2>
          <p>
            서비스가 표시하는 게임 데이터는 Riot Games가 제공하는 공개 API를 통해 수집됩니다. 데이터의 정확성은 Riot Games API의 상태에 의존하며,
            서비스는 API 장애로 인한 데이터 공백·오류에 대해 책임지지 않습니다.
          </p>
          <p className="mt-2">
            프로토타입 단계에서 일부 통계는 공개된 집계 데이터를 참고용 벤치마크로 표시할 수 있으며, 이는 Riot Production API Key 승인 이후
            자체 수집 데이터로 순차 교체됩니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제5조 (면책 조항)</h2>
          <p>
            서비스가 제공하는 통계 및 가이드는 참고용이며, 실제 게임 결과를 보장하지 않습니다. 서비스 이용으로 발생한 게임 내외의 손실에 대해 책임지지 않습니다.
          </p>
          <p className="mt-2">
            서비스는 Riot Games로부터 보증되거나 승인되지 않았으며, Riot Games, 리그 오브 레전드 또는 Riot Games와 공식적으로 연관된 그 누구의 견해나 의견을 반영하지 않습니다.
            League of Legends 및 Riot Games는 Riot Games, Inc.의 상표 또는 등록 상표입니다.
          </p>
          <p className="mt-2 text-[var(--text-muted)] text-xs leading-6">
            LOL Stats isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing
            Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제6조 (서비스 변경 및 중단)</h2>
          <p>
            서비스 제공자는 운영상·기술상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 중단할 수 있으며, 사전에 공지하는 것을 원칙으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제7조 (지적재산권)</h2>
          <p>
            서비스가 표시하는 챔피언 이미지·아이콘·룬·아이템 이미지 등은 Riot Games의 자산이며, 해당 권리는 Riot Games에 귀속됩니다.
            서비스가 제작한 분석 알고리즘, 가이드 콘텐츠, UI/UX는 서비스 제공자의 지적재산이며 무단 복제·재배포를 금합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">제8조 (문의)</h2>
          <p>
            이메일: <a href="mailto:hobbying.dev1@gmail.com" className="underline text-[var(--accent-blue)]">hobbying.dev1@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
