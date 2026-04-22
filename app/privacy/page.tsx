const LAST_UPDATED = "April 22, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6">
      <article className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              What we collect
            </h2>
            <p className="mt-2">
              We collect account details from your sign-in provider, ideas you
              submit, and activity such as likes, comments, and bookmarks.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              How we use your data
            </h2>
            <p className="mt-2">
              We use data to run Idea Reel, personalize feeds, show engagement
              metrics, and improve product quality and safety.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Contact
            </h2>
            <p className="mt-2">
              For privacy questions, contact{" "}
              <a
                href="mailto:hello@ideacentre.app"
                className="underline underline-offset-4 hover:text-foreground"
              >
                hello@ideacentre.app
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
