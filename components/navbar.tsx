import Link from "next/link";

export function Navbar() {
  return (
    <header className="w-full px-12 py-4">
      <nav
        className="relative isolate min-h-14 w-full text-foreground"
        aria-label="Main"
      >
        <Link
          href="/"
          className="absolute inset-s-0 top-1/2 max-w-[min(45%,11rem)] -translate-y-1/2 truncate text-sm font-semibold tracking-tight text-foreground hover:opacity-80 sm:text-base md:text-lg lg:text-xl"
        >
          ideaCentre
        </Link>
        <Link
          href="#get-started"
          className="absolute inset-e-0 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-primary bg-transparent px-5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 sm:text-sm md:text-base lg:text-lg"
        >
          Get it Now — It&apos;s Free
        </Link>
      </nav>
    </header>
  );
}
