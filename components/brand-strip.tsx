const brands = [
  "Rakuten",
  "NCR",
  "monday.com",
  "Disney",
  "Dropbox",
] as const;

export function BrandStrip() {
  return (
    <section
      className="mt-8 px-2 sm:mt-10 sm:px-3 md:mt-12 md:px-4 lg:mt-14 lg:px-6 xl:mt-16 xl:px-8"
      aria-label="Trusted by"
    >
      <div className="rounded-2xl bg-white px-4 py-8 shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:rounded-3xl sm:px-6 sm:py-9 md:px-8 md:py-10 lg:px-10 lg:py-11 xl:px-12 xl:py-12">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground/45 sm:mb-7 sm:text-sm md:text-left">
          Trusted by teams at
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:justify-between md:gap-x-6 lg:gap-x-10 xl:gap-x-12">
          {brands.map((name) => (
            <li key={name}>
              <span
                className={`block text-center text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-[1.35rem] lg:text-2xl xl:text-[1.65rem] ${
                  name === "monday.com" ? "lowercase" : ""
                }`}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
