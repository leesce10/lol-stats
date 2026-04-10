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
        <footer className="border-t border-[var(--border-color)] py-6 text-center text-sm text-[var(--text-muted)]">
          <p>LOL Stats &copy; 2026 | Patch 15.7</p>
          <p className="mt-1">
            This product is not endorsed by Riot Games and does not reflect the
            views or opinions of Riot Games.
          </p>
        </footer>
      </body>
    </html>
  );
}
