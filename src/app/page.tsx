// app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/src/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is signed in, redirect to learn page
    if (!loading && user) {
      router.push("/learn");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EF] dark:bg-[#0B1220]">
        <div className="text-sm text-black/60 dark:text-white/60">
          Loading...
        </div>
      </div>
    );
  }

  // If user is signed in, show nothing (redirect will happen)
  if (user) {
    return null;
  }

  // Show landing page only if user is not signed in
  return (
    <main className="min-h-screen bg-[#F5F3EF] text-[#1F2937] dark:bg-[#0B1220] dark:text-[#E5E7EB]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#F5F3EF]/80 backdrop-blur dark:border-white/10 dark:bg-[#0B1220]/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* “Seal” mark */}
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="text-lg font-semibold tracking-tight">印</span>
            </span>

            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">
                Hanzi Ledger
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/learn"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10 sm:inline-flex"
            >
              Learn
            </Link>
            <Link
              href="/review"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10 sm:inline-flex"
            >
              Review
            </Link>
            <Link
              href="/stats"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-black/70 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10 sm:inline-flex"
            >
              Stats
            </Link>

            {/* Placeholder theme toggle (wire later) */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              <span className="text-base">☾</span>
              <span className="hidden sm:inline">Theme</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-[#92400E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7C2D12]"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#92400E]" />
              A small ledger for steady study
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn Chinese vocabulary with the pace of ink drying.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-black/70 dark:text-white/70">
              Filter by level or topic. Flip a card. Mark what you know. Review
              only what’s due, guided by a Fibonacci schedule—quietly
              consistent, daily.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-2xl bg-[#92400E] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7C2D12]"
              >
                Begin learning
              </Link>
              <Link
                href="/review"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-[#1F2937] shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-[#E5E7EB] dark:hover:bg-white/10"
              >
                Review today
              </Link>
              <div className="text-xs text-black/60 dark:text-white/60 sm:ml-2">
                Paper theme • Dark mode • Mobile-friendly
              </div>
            </div>

            {/* Mini “index cards” */}
            <div className="mt-7 grid grid-cols-3 gap-3 text-xs sm:max-w-md">
              <StatPill label="Filters" value="Level • Category" />
              <StatPill label="Reviews" value="Due-only" />
              <StatPill label="Mastery" value="Reach 34 days" />
            </div>

            {/* Callout */}
            <div className="mt-6 rounded-3xl border border-black/10 bg-white/50 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <span className="text-lg">📜</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">A simple rule</div>
                  <div className="mt-1 text-sm text-black/70 dark:text-white/70">
                    Correct answers advance your interval (1 → 2 → 3 → 5 → 8 →
                    13 → 21 → 34). Incorrect resets to 1.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:justify-self-end">
            <div className="relative mx-auto max-w-md">
              {/* “Rice paper” glow */}
              <div className="absolute -inset-6 rounded-[34px] bg-gradient-to-b from-[#EADBCB] to-transparent blur-2xl opacity-70 dark:from-[#92400E]/15" />

              <div className="relative space-y-4">
                {/* Card: front */}
                <PaperCard headerRight={<BookmarkIcon />}>
                  <div className="mt-6 text-center">
                    <div className="text-6xl font-semibold tracking-tight">
                      你
                    </div>
                    <div className="mt-2 text-lg italic text-black/60 dark:text-white/60">
                      nǐ
                    </div>
                    <div className="mx-auto mt-5 h-px w-16 bg-black/10 dark:bg-white/10" />
                    <div className="mt-4 text-sm text-black/60 dark:text-white/60">
                      Tap to reveal definition
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="cursor-pointer rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-semibold text-black/80 shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      Don’t know
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-2xl bg-[#92400E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7C2D12]"
                    >
                      I know this
                    </button>
                  </div>
                </PaperCard>

                {/* Card: back */}
                <PaperCard
                  headerRight={
                    <span className="rounded-full border border-black/10 bg-white/60 px-2 py-1 text-[11px] font-medium text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                      Interval: 2 days
                    </span>
                  }
                >
                  <div className="mt-6 text-center">
                    <div className="text-6xl font-semibold tracking-tight">
                      学
                    </div>
                    <div className="mt-2 text-lg italic text-black/60 dark:text-white/60">
                      xué
                    </div>
                    <div className="mx-auto mt-5 h-px w-16 bg-black/10 dark:bg-white/10" />
                    <div className="mt-4 text-lg font-medium">to learn</div>
                    <div className="mt-2 text-sm text-black/60 dark:text-white/60">
                      Answer updates the next review date.
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-semibold text-black/80 shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      Incorrect
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-[#92400E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7C2D12]"
                    >
                      Correct
                    </button>
                  </div>
                </PaperCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* “Index” feature strip */}
      <section className="border-t border-black/10 bg-white/30 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon="🗂️"
              title="Curated filters"
              desc="Choose by level and category."
            />
            <Feature
              icon="🖋️"
              title="Binary feedback"
              desc="Keep decisions simple: know / don’t."
            />
            <Feature
              icon="📆"
              title="Fibonacci schedule"
              desc="Intervals: 1,2,3,5,8,13,21,34."
            />
            <Feature
              icon="🏁"
              title="Clear mastery"
              desc="Reach 34 days to master a word."
            />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white/50 p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row">
            <div>
              <div className="text-sm font-semibold">
                Start a gentle routine
              </div>
              <div className="mt-1 text-sm text-black/70 dark:text-white/70">
                Set daily goals for new words and reviews. Keep a streak with
                small, consistent sessions.
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-[#92400E] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7C2D12]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-black/60 dark:text-white/60 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div>© {new Date().getFullYear()} Hanzi Ledger</div>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-black/80 dark:hover:text-white/80"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-black/80 dark:hover:text-white/80"
            >
              Terms
            </Link>
            <Link
              href="/about"
              className="hover:text-black/80 dark:hover:text-white/80"
            >
              About
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PaperCard({
  headerRight,
  children,
}: {
  headerRight: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/5">
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm text-black/70 dark:text-white/70">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/55 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] font-medium text-black/60 dark:text-white/60">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-black/80 dark:text-white/80">
        {value}
      </div>
    </div>
  );
}

function BookmarkIcon() {
  return (
    <button
      type="button"
      className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/10"
      aria-label="Bookmark"
    >
      <span className="text-lg">☆</span>
    </button>
  );
}
