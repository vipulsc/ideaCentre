import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#a67a5b",
          backgroundImage:
            "radial-gradient(1000px 500px at 15% -10%, #c19770 0%, transparent 55%), radial-gradient(900px 500px at 110% 120%, #8a6144 0%, transparent 55%)",
          color: "#faf0dc",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34 }}>
          <span style={{ fontWeight: 400 }}>idea</span>
          <span style={{ fontWeight: 700, color: "#faf0dc" }}>Centre</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Startup ideas, served like reels.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(250,240,220,0.86)",
              maxWidth: 900,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Discover, save, and upvote startup ideas — and let AI turn any idea
            into a build-ready plan.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "rgba(250,240,220,0.75)",
          }}
        >
          <span
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "rgba(250,240,220,0.14)",
              border: "1px solid rgba(250,240,220,0.35)",
            }}
          >
            Discover. Share. Build.
          </span>
          <span>ideacentre.xyz</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
