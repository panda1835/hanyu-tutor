// app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/src/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Flashcard } from "@/src/components/Flashcard";
import { getRandomWords } from "@/src/lib/vocabulary";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Get a random word (memoized so it doesn't change on re-renders)
  const randomWord = useMemo(() => getRandomWords(1)[0], []);

  useEffect(() => {
    // If user is signed in, redirect to learn page
    if (!loading && user) {
      router.push("/learn");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

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
            {/* "Seal" mark */}
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
              Try it for free
            </Link>

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
              Filter by level or topic, flip a card, mark what you know, and
              review only what&apos;s due.
            </p>
          </div>

          {/* Preview panel */}
          <div className="">
            <div className="relative mx-auto max-w-md">
              {/* "Rice paper" glow */}
              <div className="absolute -inset-6 rounded-[34px] bg-gradient-to-b from-[#EADBCB] to-transparent blur-2xl opacity-70 dark:from-[#92400E]/15" />

              <div className="relative">
                {randomWord && (
                  <Flashcard
                    word={randomWord}
                    mode="learn"
                    frontMode="chinese"
                    onAnswer={() => {}} // No-op for the demo
                    showActions={false} // Hide action buttons on landing page
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Index" feature strip */}
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
              desc="Keep decisions simple: know / don't."
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
