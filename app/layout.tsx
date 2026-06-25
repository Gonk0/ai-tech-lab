import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
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
    "AI systémy, digitálne produkty a inteligentná infraštruktúra zo Slovenska pre ďalšiu éru podnikového softvéru.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <FluidOrbs />
          <Nav />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
