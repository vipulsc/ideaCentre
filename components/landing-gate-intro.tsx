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
    setTimeout(() => setGone(true), 1600);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      handleOpen();
    }, 120);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") handleOpen();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400&display=swap');

        .gi-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .gi-gate-left,
        .gi-gate-right {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 1.4s cubic-bezier(0.77, 0, 0.18, 1);
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
          background: linear-gradient(to right, rgba(0, 0, 0, 0.55) 0%, transparent 55%);
        }
        .gi-gate-right .gi-vignette {
          background: linear-gradient(to left, rgba(0, 0, 0, 0.55) 0%, transparent 55%);
        }

        .gi-overlay {
          position: absolute;
          z-index: 20;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }
        .gi-overlay.hidden {
          opacity: 0;
        }

        .gi-split {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 7vw, 80px);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
          display: flex;
          overflow: hidden;
          white-space: nowrap;
        }

        .gi-split-l,
        .gi-split-r {
          display: inline-block;
          transition:
            transform 1.4s cubic-bezier(0.77, 0, 0.18, 1),
            opacity 1.1s ease;
        }
        .gi-split-l {
          color: rgba(255, 255, 255, 0.92);
        }
        .gi-split-r {
          color: #a67a5b;
        }

        .gi-split-l.slide {
          transform: translateX(-140px);
          opacity: 0;
        }
        .gi-split-r.slide {
          transform: translateX(140px);
          opacity: 0;
        }

        .gi-hint-badge {
          margin-top: 14px;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          transition: opacity 0.4s ease;
          animation: gi-pulse 2.2s ease-in-out infinite;
        }
        .gi-hint-badge.hidden {
          opacity: 0;
        }

        @keyframes gi-pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.9;
          }
        }
      `}</style>

      {children}

      {!gone ? (
        <div
          className="gi-root"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          aria-label="Enter ideaCentre"
        >
          <div className={`gi-gate-left${opened ? " open" : ""}`}>
            <div className="gi-panel">
              <div className="gi-texture" />
              <div className="gi-vignette" />
            </div>
          </div>

          <div className={`gi-gate-right${opened ? " open" : ""}`}>
            <div className="gi-panel">
              <div className="gi-texture" />
              <div className="gi-vignette" />
            </div>
          </div>

          <div className={`gi-overlay${opened ? " hidden" : ""}`} aria-hidden="true">
            <div className="gi-split">
              <span className={`gi-split-l${opened ? " slide" : ""}`}>idea</span>
              <span className={`gi-split-r${opened ? " slide" : ""}`}>Centre</span>
            </div>
            <div className={`gi-hint-badge${opened ? " hidden" : ""}`}>
              loading
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
