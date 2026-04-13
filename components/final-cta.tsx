"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Reveal } from "@/components/reveal";

const footerLinks = {
  Product: [
    { label: "Idea Reel", href: "/reel" },
    { label: "Trending", href: "/trending" },
    { label: "Submit Idea", href: "/submit" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

const socials = [
  { icon: Mail, href: "mailto:hello@ideacentre.app", label: "Email" },
];

export function FinalCta() {
  return (
    <section className="px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-12 lg:pt-16">
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-400">
        <Reveal direction="up">
          <div className="relative isolate overflow-hidden rounded-2xl bg-palette-primary text-primary-foreground xl:rounded-3xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[url('/texture2.png')] bg-repeat"
            />

            <div className="relative z-10">
              {/* CTA */}
              <div className="flex flex-col items-center gap-6 px-6 pt-14 pb-12 text-center sm:px-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16">
                <Reveal direction="up" delay={0.1}>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">
                    Stop overthinking. Start scrolling.
                  </p>
                </Reveal>

                <Reveal direction="up" delay={0.2}>
                  <h2 className="font-display-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
                    Your next idea is
                    <br />
                    one swipe away.
                  </h2>
                </Reveal>

                <Reveal direction="up" delay={0.35}>
                  <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:gap-5">
                    <Link
                      href="/reel"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-9 py-4 text-sm font-bold text-primary shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15 active:translate-y-0 sm:text-base"
                    >
                      Start Reel
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-primary-foreground/80 underline underline-offset-4 transition-colors duration-200 hover:text-primary-foreground sm:text-base"
                    >
                      Sign in to save ideas
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-primary-foreground/15 sm:mx-12" />

              {/* Footer */}
              <div className="px-6 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Brand */}
                  <div className="flex flex-col gap-4 lg:col-span-2">
                    <Link href="/" className="flex items-center gap-2.5">
                      <Image
                        src="/logo.svg"
                        alt=""
                        width={28}
                        height={28}
                        className="brightness-0 invert"
                      />
                      <span className="text-lg font-bold tracking-tight">
                        ideaCentre
                      </span>
                    </Link>
                    <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65">
                      Discover startup ideas in seconds. Swipe, save, vote — and
                      start building what matters.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 transition-colors duration-200 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                        >
                          <s.icon className="size-4" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Link columns */}
                  {Object.entries(footerLinks).map(([title, links]) => (
                    <div key={title} className="flex flex-col gap-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">
                        {title}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/10 pt-6 sm:flex-row">
                  <p className="text-xs text-primary-foreground/45">
                    &copy; {new Date().getFullYear()} ideaCentre. All rights
                    reserved.
                  </p>
                  <p className="text-xs text-primary-foreground/45">
                    Built for builders, by builders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
