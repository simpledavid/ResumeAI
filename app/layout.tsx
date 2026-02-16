import type { Metadata } from "next";
import { Noto_Sans_SC, Sora } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "ResumeAI - AI 简历编辑器",
  description: "模板化简历编辑、实时预览与 PDF 导出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSans.variable} ${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
