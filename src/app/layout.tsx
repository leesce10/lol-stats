import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOL Stats - 리그 오브 레전드 통계",
  description:
    "챔피언 통계, 맞라인 분석, 팀 조합 분석기 - 당신의 솔로랭크를 위한 데이터 기반 가이드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border-color)] py-6 px-4 text-center text-xs sm:text-sm text-[var(--text-muted)]">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <a href="/privacy" className="hover:text-[var(--text-primary)] underline-offset-2 hover:underline">개인정보처리방침</a>
              <span aria-hidden="true">·</span>
              <a href="/terms" className="hover:text-[var(--text-primary)] underline-offset-2 hover:underline">이용약관</a>
              <span aria-hidden="true">·</span>
              <a href="mailto:hobbying.dev1@gmail.com" className="hover:text-[var(--text-primary)] underline-offset-2 hover:underline">문의</a>
            </div>
            <p>LOL Stats &copy; 2026 · Patch 15.7</p>
            <p className="leading-6">
              LOL Stats는 Riot Games로부터 보증되지 않으며, Riot Games, League of Legends 또는 Riot Games와
              공식적으로 연관된 그 누구의 견해나 의견을 반영하지 않습니다.
              League of Legends와 Riot Games는 Riot Games, Inc.의 상표 또는 등록 상표입니다.
            </p>
            <p className="leading-6 text-[10px] sm:text-xs">
              LOL Stats isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
              anyone officially involved in producing or managing Riot Games properties.
              League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
