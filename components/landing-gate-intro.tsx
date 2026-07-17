"use client";

import { useEffect, useRef, useState } from "react";

type LandingGateIntroProps = {
children: React.ReactNode;
};

export function LandingGateIntro({ children }: LandingGateIntroProps) {
const [opened, setOpened] = useState(false);
const [gone, setGone] = useState(false);
const hasOpened = useRef(false);

const handleOpen = () => {
if (hasOpened.current) return;
hasOpened.current = true;
setOpened(true);
setTimeout(() => setGone(true), 550);
};

useEffect(() => {
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (prefersReduced) {
  hasOpened.current = true;
  const reducedTimer = window.setTimeout(() => {
    setOpened(true);
    setGone(true);
  }, 0);
  return () => window.clearTimeout(reducedTimer);
}

const timer = window.setTimeout(() => {
handleOpen();
}, 10);

const handler = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleOpen();
  }
};

window.addEventListener("keydown", handler);

return () => {
  window.clearTimeout(timer);
  window.removeEventListener("keydown", handler);
};
}, []);

return (
<> <style>{`
.gi-root {
position: fixed;
inset: 0;
z-index: 9999;
overflow: hidden;
cursor: pointer;
font-family: var(--font-secondary), ui-sans-serif, sans-serif;
}

    .gi-gate-left,
    .gi-gate-right {
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
      overflow: hidden;
      transition: transform 0.5s cubic-bezier(0.77, 0, 0.18, 1);
      will-change: transform;
    }

    .gi-gate-left {
      left: 0;
    }

    .gi-gate-right {
      right: 0;
    }

    .gi-gate-left.open {
      transform: translateX(-100%);
    }

    .gi-gate-right.open {
      transform: translateX(100%);
    }

    .gi-panel {
      position: absolute;
      inset: 0;
      background: #111a14;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .gi-texture {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .gi-vignette {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .gi-gate-left .gi-vignette {
      background: linear-gradient(to right, rgba(0,0,0,0.55), transparent);
    }

    .gi-gate-right .gi-vignette {
      background: linear-gradient(to left, rgba(0,0,0,0.55), transparent);
    }

    /* TEXT INSIDE GATES */
    .gi-half-text {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      display: flex;
      pointer-events: none;
    }

    .gi-half-text.left {
      justify-content: flex-end;
      padding-right: 12px;
    }

    .gi-half-text.right {
      justify-content: flex-start;
      padding-left: 12px;
    }

    .gi-text {
      font-family: var(--font-serif), Georgia, serif;
      font-size: clamp(40px, 7vw, 80px);
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 1;
      transition: transform 0.5s cubic-bezier(0.77, 0, 0.18, 1),
                  opacity 0.35s ease;
      white-space: nowrap;
    }

    .gi-text.left {
      color: rgba(255,255,255,0.92);
    }

    .gi-text.right {
      color: #a67a5b;
    }

    .gi-text.slide-left {
      transform: translateX(-120px);
      opacity: 0;
    }

    .gi-text.slide-right {
      transform: translateX(120px);
      opacity: 0;
    }

    .gi-hint {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      animation: pulse 2s infinite;
      transition: opacity 0.4s ease;
    }

    .gi-hint.hidden {
      opacity: 0;
    }

    @keyframes pulse {
      0%,100% { opacity: 0.3; }
      50% { opacity: 0.9; }
    }
  `}</style>

  <div style={{ display: "contents" }} inert={!gone ? true : undefined} aria-hidden={!gone ? true : undefined}>
    {children}
  </div>

  {!gone && (
    <div
      className="gi-root"
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label="Open ideaCentre"
    >
      {/* LEFT GATE */}
      <div className={`gi-gate-left ${opened ? "open" : ""}`}>
        <div className="gi-panel">
          <div className="gi-texture" />
          <div className="gi-vignette" />

          <div className="gi-half-text left">
            <span
              className={`gi-text left ${
                opened ? "slide-left" : ""
              }`}
            >
              idea
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT GATE */}
      <div className={`gi-gate-right ${opened ? "open" : ""}`}>
        <div className="gi-panel">
          <div className="gi-texture" />
          <div className="gi-vignette" />

          <div className="gi-half-text right">
            <span
              className={`gi-text right ${
                opened ? "slide-right" : ""
              }`}
            >
              Centre
            </span>
          </div>
        </div>
      </div>

      {/* HINT */}
      <div className={`gi-hint ${opened ? "hidden" : ""}`}>
        click to enter
      </div>
    </div>
  )}
</>
  );
}