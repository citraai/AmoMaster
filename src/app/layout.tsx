import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmoMaster - パートナーを世界一幸せに",
  description: "厳しく愛ある指導で、あなたを最高のパートナーへ育成するスパルタ・コンシェルジュ",
  keywords: ["恋愛", "パートナー", "デート", "プレゼント", "記念日"],
  authors: [{ name: "AmoMaster" }],
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
    <html lang="ja" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

