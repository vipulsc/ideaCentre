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
import { StructuredData } from "@/components/structured-data";
import { siteConfig } from "@/lib/site";

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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s · ideaCentre",
  },
  description: siteConfig.description,
  applicationName: "ideaCentre",
  keywords: [...siteConfig.keywords],
  authors: [{ name: "ideaCentre", url: siteConfig.url }],
  creator: "ideaCentre",
  publisher: "ideaCentre",
  category: "technology",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "ideaCentre",
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
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
        <StructuredData />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
