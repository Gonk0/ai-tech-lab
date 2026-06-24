import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { FluidOrbs } from "@/components/FluidOrbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Tech Lab | Corporate Intelligence Systems",
    template: "%s | AI Tech Lab",
  },
  description:
    "AI systems, digital products and intelligent infrastructure built from Slovakia for the next era of enterprise software.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <FluidOrbs />
        <Nav />
        {children}
        <footer className="relative z-10 border-t border-white/[0.06] px-6 md:px-12 lg:px-20 py-10 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <span className="text-white/22 text-sm">AI Tech Lab © 2026</span>
              <span className="hidden sm:block text-white/15">·</span>
              <span className="text-white/22 text-sm">Corporate Intelligence Systems</span>
            </div>
            <a
              href="https://www.vodicak.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/22 text-sm hover:text-white/55 transition-colors"
            >
              vodicak.pro ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
