import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Idea Reel — swipe startup ideas",
  description:
    "Swipe a bottomless, reel-style feed of startup ideas. Like, save, and upvote the best — and open AI insights on any idea.",
  alternates: { canonical: "/reel" },
  openGraph: {
    title: "Idea Reel · ideaCentre",
    description:
      "Swipe a bottomless, reel-style feed of startup ideas. Like, save, and upvote the best.",
    url: "/reel",
    type: "website",
  },
};

export default function ReelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
