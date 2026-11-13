import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CustomCursor } from "@/components/custom-cursor";
import "./globals.css";
import "./marketing.css";
import "./spec.css";
import "./premium.css";
import "./balance.css";
import "./live.css";

// Inter is the only web font. Helvetica Neue / Helvetica lead the stack for display type,
// and Japanese text falls back to the system Japanese UI font.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", adjustFontFallback: true });

export const metadata: Metadata = {
  title: "Anargya Racing | Formula Student EV / フォーミュラ・スチューデントEV",
  description:
    "The Formula Student EV built to train racing drivers: one integrated electric stack, a ¥6,000,000 target price and parts and service planned for Japan. レーシングアカデミー向けの育成用EV。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
