"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/src/components/Header";
import { Flashcard, type FlashcardFrontMode } from "@/src/components/Flashcard";
import { useAuth } from "@/src/components/AuthProvider";
import { createClient, type WordProgress } from "@/src/lib/supabase";
import { getWordByCharacter, type VocabularyItem } from "@/src/lib/vocabulary";
import {
  calculateNextReviewDate,
  formatDateForDB,
  getNextIntervalIndex,
  getIntervalDays,
  getWordState,
  isMastered,
} from "@/src/lib/spaced-repetition";
import { RotateCcw, PartyPopper, Loader2, Calendar } from "lucide-react";

interface ReviewWord {
  progress: WordProgress;
  vocabulary: VocabularyItem;
}

export default function ReviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // State
  const [dueWords, setDueWords] = useState<ReviewWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(
    new Set()
  );
  const [reviewedToday, setReviewedToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [flashcardFrontMode, setFlashcardFrontMode] =
    useState<FlashcardFrontMode>("chinese");

  const currentReview = dueWords[currentIndex];
  const remainingReviews = dueWords.length - currentIndex;

  // Load due words
  const loadDueWords = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const today = formatDateForDB(new Date());

      // Get words due for review (today or overdue)
      const { data: progressData } = await supabase
        .from("word_progress")
        .select("*")
        .eq("user_id", user.id)
        .lte("next_review_date", today)
        .order("next_review_date", { ascending: true });

      if (progressData) {
        // Match with vocabulary data
        const reviewWords: ReviewWord[] = [];
        for (const progress of progressData) {
          const vocabulary = getWordByCharacter(progress.word_character);
          if (vocabulary) {
            reviewWords.push({ progress, vocabulary });
          }
        }

        // Shuffle to add variety
        const shuffled = [...reviewWords].sort(() => Math.random() - 0.5);
        setDueWords(shuffled);
      }

      setCurrentIndex(0);

      // Get bookmarks
      const { data: bookmarkData } = await supabase
        .from("bookmarks")
        .select("word_character")
        .eq("user_id", user.id);

      setBookmarkedWords(
        new Set(
          bookmarkData?.map(
            (b: { word_character: string }) => b.word_character
          ) || []
        )
      );

      // Get today's stats
      const { data: statsData } = await supabase
        .from("daily_stats")
        .select("reviews_completed")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      setReviewedToday(statsData?.reviews_completed || 0);

      // Get user settings (only daily goal, flashcard mode is localStorage)
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("daily_review_goal")
        .eq("user_id", user.id)
        .single();

      setDailyGoal(settingsData?.daily_review_goal || 20);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Load on mount
  useEffect(() => {
    if (user) {
      loadDueWords();
    } else if (!authLoading) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Handle answer
  const handleAnswer = async (correct: boolean) => {
    if (!user || !currentReview) return;

    try {
      const today = new Date();
      const todayStr = formatDateForDB(today);
      const { progress } = currentReview;

      // Calculate new interval
      const newIntervalIndex = getNextIntervalIndex(
        progress.interval_index,
        correct
      );
      const newState = getWordState(newIntervalIndex);
      const nextReviewDate = calculateNextReviewDate(newIntervalIndex);

      // Update word progress
      await supabase
        .from("word_progress")
        .update({
          interval_index: newIntervalIndex,
          state: newState,
          next_review_date: formatDateForDB(nextReviewDate),
          last_reviewed_at: today.toISOString(),
          correct_count: correct
            ? progress.correct_count + 1
            : progress.correct_count,
          incorrect_count: correct
            ? progress.incorrect_count
            : progress.incorrect_count + 1,
        })
        .eq("id", progress.id);

      // Update daily stats
      const { data: existingStats } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .single();

      if (existingStats) {
        await supabase
          .from("daily_stats")
          .update({ reviews_completed: existingStats.reviews_completed + 1 })
          .eq("id", existingStats.id);
      } else {
        await supabase.from("daily_stats").insert({
          user_id: user.id,
          date: todayStr,
          new_words_learned: 0,
          reviews_completed: 1,
        });
      }

      // Update streak
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (streakData) {
        const lastDate = streakData.last_activity_date;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateForDB(yesterday);

        let newStreak = streakData.current_streak;
        if (lastDate === todayStr) {
          // Already counted today
        } else if (lastDate === yesterdayStr) {
          // Consecutive day
          newStreak += 1;
        } else if (!lastDate) {
          // First activity
          newStreak = 1;
        } else {
          // Streak broken
          newStreak = 1;
        }

        await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_activity_date: todayStr,
          })
          .eq("id", streakData.id);
      }

      setReviewedToday((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!user || !currentReview) return;

    const character = currentReview.vocabulary.character;
    const isBookmarked = bookmarkedWords.has(character);

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("word_character", character);

        setBookmarkedWords((prev) => {
          const newSet = new Set(prev);
          newSet.delete(character);
          return newSet;
        });
      } else {
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          word_character: character,
        });

        setBookmarkedWords((prev) => new Set(prev).add(character));
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <RotateCcw className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Review</h1>
              <p className="text-sm text-muted-foreground">
                Reinforce words due for review today
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Today&apos;s Reviews</span>
            <span className="text-muted-foreground">
              {reviewedToday} / {dailyGoal} reviews
            </span>
          </div>
          <div className="progress-bar mt-2">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min((reviewedToday / dailyGoal) * 100, 100)}%`,
              }}
            />
          </div>
          {reviewedToday >= dailyGoal && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <PartyPopper className="h-4 w-4" />
              Daily goal reached! Great work!
            </div>
          )}
        </div>

        {/* Flashcard Display Options - Compact */}
        <div className="mb-4 flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground">Front side:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFlashcardFrontMode("chinese")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                flashcardFrontMode === "chinese"
                  ? "bg-[var(--accent)] text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Chinese
            </button>
            <button
              onClick={() => setFlashcardFrontMode("definition")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                flashcardFrontMode === "definition"
                  ? "bg-[var(--accent)] text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Definition
            </button>
            <button
              onClick={() => setFlashcardFrontMode("mixed")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                flashcardFrontMode === "mixed"
                  ? "bg-[var(--accent)] text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Mixed
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading reviews...</p>
          </div>
        ) : !currentReview ? (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Calendar className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold">No reviews due!</h2>
            <p className="mt-2 text-muted-foreground">
              {dueWords.length === 0 && reviewedToday === 0
                ? "Start learning new words to build your review queue."
                : "You've completed all your reviews. Come back tomorrow!"}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/learn")}
                className="btn-primary"
              >
                Learn New Words
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Review Counter */}
            <div className="mb-4 text-center text-sm text-muted-foreground">
              {remainingReviews} review{remainingReviews !== 1 ? "s" : ""}{" "}
              remaining
              {isMastered(currentReview.progress.interval_index) && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ✓ Mastered
                </span>
              )}
            </div>

            {/* Flashcard */}
            <div className="animate-fade-in" key={currentReview.progress.id}>
              <Flashcard
                word={currentReview.vocabulary}
                mode="review"
                frontMode={flashcardFrontMode}
                intervalDays={getIntervalDays(
                  currentReview.progress.interval_index
                )}
                isBookmarked={bookmarkedWords.has(
                  currentReview.vocabulary.character
                )}
                onBookmarkToggle={toggleBookmark}
                onAnswer={handleAnswer}
              />
            </div>

            {/* Interval Info */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span>Correct: advance interval</span>
                <span className="mx-1">•</span>
                <span>Incorrect: reset to 1 day</span>
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
