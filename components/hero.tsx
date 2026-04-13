import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section
      className="px-6 pb-10 sm:pb-12 lg:pb-14 "
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-400">
        <div className="isolate relative overflow-hidden rounded-2xl  bg-palette-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12 md:px-12 md:py-14 lg:px-12 lg:py-16 xl:rounded-3xl xl:px-14 xl:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[url('/texture2.png')] bg-repeat xl:rounded-3xl"
          />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex min-w-0 flex-col gap-6 text-primary-foreground sm:gap-7 lg:max-w-xl lg:gap-8">
              <h1
                id="hero-heading"
                className="text-[2.75rem] font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-6xl lg:text-7xl xl:text-[4.5rem]"
              >
                Grow
                <span className="bg-linear-to-br from-orange-500 to-amber-400 bg-clip-text text-transparent">
                  +
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-primary-foreground/85 sm:text-lg md:text-lg lg:text-xl">
                Ship campaigns faster, prove impact with live metrics, and keep
                your team aligned in one calm workspace.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex -space-x-2" aria-hidden>
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-foreground/35 bg-primary-foreground/12 text-[10px] font-semibold text-primary-foreground/75"
                    >
                      {String.fromCharCode(64 + i)}
                    </span>
                  ))}
                </div>
                <p className="max-w-xs text-sm leading-snug text-primary-foreground/80 sm:text-[15px]">
                  “We replaced three tools and still ship twice as fast.”
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="#get-started"
                  className="inline-flex w-fit items-center justify-center rounded-lg bg-primary-foreground px-7 py-3 text-sm font-medium text-primary transition-opacity hover:opacity-90 sm:px-8 sm:py-3.5 sm:text-[15px]"
                >
                  Start free trial
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary-foreground underline-offset-4 hover:underline sm:text-[15px]"
                >
                  Book a demo
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div
                className="pointer-events-none absolute -bottom-4 -right-2 z-0 h-[78%] w-[58%] rounded-md bg-linear-to-br from-orange-400 via-orange-300 to-[#ffd8b8] sm:-bottom-6 sm:-right-4 sm:rounded-lg lg:h-[82%] lg:w-[52%] lg:rounded-lg"
                aria-hidden
              />

              <div className="relative z-10 mx-auto aspect-4/5 w-full max-w-[min(100%,20rem)] overflow-hidden rounded-md sm:max-w-xs sm:rounded-lg md:max-w-sm lg:ml-auto lg:mr-0 lg:max-w-md xl:max-w-lg">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80"
                  alt="Team lead reviewing growth metrics"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 90vw, 480px"
                  priority
                />
              </div>

              <div className="absolute right-0 top-6 z-20 w-[min(100%,11rem)] rounded-lg border border-primary/15 bg-primary-foreground/95 px-4 py-3 backdrop-blur-md sm:right-2 sm:top-8 sm:w-44">
                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  60%
                </p>
                <p className="text-xs font-medium text-primary/70 sm:text-sm">
                  Pipeline won this quarter
                </p>
              </div>

              <div className="absolute bottom-[18%] left-0 z-20 flex max-w-44 items-center gap-3 rounded-lg border border-primary/15 bg-primary-foreground/95 px-3 py-2.5 backdrop-blur-md sm:bottom-[20%] sm:left-2 sm:max-w-xs sm:px-4 sm:py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-lg text-primary-foreground">
                  ✓
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    Nike Air Max
                  </p>
                  <p className="text-xs text-primary/70">Featured launch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
