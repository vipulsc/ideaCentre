const LAST_UPDATED = "April 22, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6">
      <article className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Using the service
            </h2>
            <p className="mt-2">
              By using ideaCentre, you agree to use the platform lawfully and
              avoid posting harmful, deceptive, or infringing content.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Content ownership
            </h2>
            <p className="mt-2">
              You retain ownership of ideas you post. You grant us permission to
              host, display, and distribute submitted content within the product.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Disclaimer
            </h2>
            <p className="mt-2">
              The service is provided as-is without warranties of any kind. We
              may update, suspend, or remove features at any time.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
