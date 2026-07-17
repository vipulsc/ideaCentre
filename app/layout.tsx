import type { Metadata } from "next";
import {
  Inter,
  Josefin_Sans,
  Geist,
  DM_Serif_Display,
  Ultra,
  Caveat,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { Providers } from "@/app/providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-secondary",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-serif",
  subsets: ["latin"],
});

const ultra = Ultra({
  weight: "400",
  variable: "--font-ultra",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ideaCentre — Your next idea is one swipe away",
    template: "%s · ideaCentre",
  },
  description:
    "Discover startup ideas in seconds. Save the ones that spark something, vote for the best, and turn inspiration into action.",
  applicationName: "ideaCentre",
  openGraph: {
    title: "ideaCentre — Your next idea is one swipe away",
    description:
      "Discover, share, and shape startup ideas in a fast, reel-style feed.",
    siteName: "ideaCentre",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ideaCentre",
    description:
      "Discover, share, and shape startup ideas in a fast, reel-style feed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "bg-canvas",
        "antialiased",
        inter.variable,
        josefinSans.variable,
        dmSerifDisplay.variable,
        ultra.variable,
        caveat.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
