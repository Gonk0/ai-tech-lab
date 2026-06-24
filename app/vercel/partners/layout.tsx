import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner review",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VercelPartnersLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 min-h-screen">{children}</div>;
}
