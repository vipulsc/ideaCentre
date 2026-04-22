import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SubmitIdeaPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Submit Idea
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to publish your idea?
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Open Idea Reel and post your startup concept to get feedback, upvotes,
          and comments from the community.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/reel"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open Idea Reel
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
