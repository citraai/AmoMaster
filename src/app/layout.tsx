import type { Metadata } from "next";
import { Zen_Maru_Gothic, Kiwi_Maru } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const kiwiMaru = Kiwi_Maru({
  variable: "--font-kiwi-maru",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AmoMaster - パートナーを世界一幸せに",
  description: "厳しく愛ある指導で、あなたを最高のパートナーへ育成するスパルタ・コンシェルジュ",
  keywords: ["恋愛", "パートナー", "デート", "プレゼント", "記念日"],
  authors: [{ name: "AmoMaster" }],
  verification: {
    google: "kf_T_Cu27UkStf050FDbHcy0s-eWqZxxteD6wZVb4z8",
  },
  openGraph: {
    title: "AmoMaster - パートナーを世界一幸せに",
    description: "厳しく愛ある指導で、あなたを最高のパートナーへ育成するスパルタ・コンシェルジュ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} ${kiwiMaru.variable} antialiased min-h-screen`}
        style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
