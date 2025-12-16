"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/src/components/Header";
import { Flashcard, type FlashcardFrontMode } from "@/src/components/Flashcard";
import { FilterBar } from "@/src/components/FilterBar";
import { useAuth } from "@/src/components/AuthProvider";
import { createClient } from "@/src/lib/supabase";
import {
  getWordsByFilters,
  getVocabularyCount,
  type VocabularyItem,
} from "@/src/lib/vocabulary";
import {
  calculateNextReviewDate,
  formatDateForDB,
} from "@/src/lib/spaced-repetition";
import { BookOpen, PartyPopper, Loader2 } from "lucide-react";

export default function LearnPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Filter state - now arrays for multi-select
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Words state
  const [allNewWords, setAllNewWords] = useState<VocabularyItem[]>([]);
  const [currentBatch, setCurrentBatch] = useState<VocabularyItem[]>([]);
  const [lastCompletedBatch, setLastCompletedBatch] = useState<
    VocabularyItem[]
  >([]);
  const [dontKnowWords, setDontKnowWords] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(
    new Set()
  );
  const [learnedToday, setLearnedToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [flashcardFrontMode, setFlashcardFrontMode] =
    useState<FlashcardFrontMode>("chinese");

  // Batch state
  const [showBatchComplete, setShowBatchComplete] = useState(false);
  const [isReviewingDontKnow, setIsReviewingDontKnow] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const totalVocabulary = getVocabularyCount();

  // Current word depends on whether we're reviewing "don't know" words
  const activeList = isReviewingDontKnow ? dontKnowWords : currentBatch;
  const currentWord = activeList[currentIndex];
  const remainingInBatch = activeList.length - currentIndex;

  // Load user's learned words and filter to find new ones
  const loadNewWords = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get all words matching filters
      const filteredWords = getWordsByFilters(
        selectedLevels.length > 0 ? selectedLevels : null,
        selectedCategories.length > 0 ? selectedCategories : null
      );

      // Get user's existing word progress
      const { data: progressData } = await supabase
        .from("word_progress")
        .select("word_character")
        .eq("user_id", user.id);

      const learnedCharacters = new Set(
        progressData?.map(
          (p: { word_character: string }) => p.word_character
        ) || []
      );

      // Filter to only new words
      const newWordsFiltered = filteredWords.filter(
        (word) => !learnedCharacters.has(word.character)
      );

      // Shuffle for variety
      const shuffled = [...newWordsFiltered].sort(() => Math.random() - 0.5);
      setAllNewWords(shuffled);

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
      const today = formatDateForDB(new Date());
      const { data: statsData } = await supabase
        .from("daily_stats")
        .select("new_words_learned")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      const todayLearned = statsData?.new_words_learned || 0;
      setLearnedToday(todayLearned);

      // Get user settings (only daily goal, flashcard mode is localStorage)
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("daily_new_word_goal")
        .eq("user_id", user.id)
        .single();

      const goal = settingsData?.daily_new_word_goal || 10;
      setDailyGoal(goal);

      // Calculate remaining to reach goal
      const remainingToGoal = Math.max(0, goal - todayLearned);

      // Determine initial state based on goal and available words
      if (todayLearned >= goal) {
        // Goal already reached on refresh - show completion state with Continue Learning option
        setShowBatchComplete(true);
        setCurrentBatch([]);
        setLastCompletedBatch([]);
      } else if (shuffled.length === 0) {
        // No words available - show empty state
        setCurrentBatch([]);
        setLastCompletedBatch([]);
      } else {
        // Goal not reached - show learning cards
        const batchSize = Math.min(remainingToGoal, shuffled.length);
        setCurrentBatch(shuffled.slice(0, batchSize));
        setShowBatchComplete(false);
        setLastCompletedBatch([]);
      }

      setCurrentIndex(0);
      setDontKnowWords([]);
      setIsReviewingDontKnow(false);
      setIsReviewMode(false);
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedLevels, selectedCategories, supabase]);

  // Load words when filters change or on mount
  useEffect(() => {
    // Add timeout to prevent infinite loading state
    let timeoutId: NodeJS.Timeout | undefined;

    if (user) {
      loadNewWords();
    } else if (!authLoading) {
      setLoading(false);
    } else {
      // Safety timeout if auth is stuck loading
      timeoutId = setTimeout(() => {
        if (loading && !user) {
          console.warn("Learn page loading timeout");
          setLoading(false);
        }
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, selectedLevels, selectedCategories]);

  // Handle answer (learn word)
  const handleAnswer = async (correct: boolean) => {
    if (!user || !currentWord) return;

    if (!correct) {
      // Add to "don't know" list if not already reviewing them
      if (!isReviewingDontKnow) {
        setDontKnowWords((prev) => {
          if (!prev.some((w) => w.character === currentWord.character)) {
            return [...prev, currentWord];
          }
          return prev;
        });
      }
      // Move to next word
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // If in review mode, just move to next word without saving
    if (isReviewMode) {
      // Remove from don't know list if present
      setDontKnowWords((prev) =>
        prev.filter((w) => w.character !== currentWord.character)
      );
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Correct answer - save to database
    try {
      const today = new Date();
      const nextReviewDate = calculateNextReviewDate(0);

      // Create word progress record
      await supabase.from("word_progress").insert({
        user_id: user.id,
        word_character: currentWord.character,
        state: "learning",
        interval_index: 1,
        next_review_date: formatDateForDB(nextReviewDate),
        last_reviewed_at: today.toISOString(),
        correct_count: 1,
        incorrect_count: 0,
      });

      // Update daily stats
      const todayStr = formatDateForDB(today);
      const { data: existingStats } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .single();

      if (existingStats) {
        await supabase
          .from("daily_stats")
          .update({ new_words_learned: existingStats.new_words_learned + 1 })
          .eq("id", existingStats.id);
      } else {
        await supabase.from("daily_stats").insert({
          user_id: user.id,
          date: todayStr,
          new_words_learned: 1,
          reviews_completed: 0,
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
          newStreak += 1;
        } else if (!lastDate) {
          newStreak = 1;
        } else {
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

      // Remove from don't know list if present
      setDontKnowWords((prev) =>
        prev.filter((w) => w.character !== currentWord.character)
      );

      setLearnedToday((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Check if current list is exhausted
  useEffect(() => {
    if (loading) return;

    // If current list is done
    if (currentIndex >= activeList.length && activeList.length > 0) {
      if (isReviewingDontKnow) {
        // Finished reviewing "don't know" words
        if (dontKnowWords.length > 0) {
          // Still have words to review - reset
          setCurrentIndex(0);
        } else {
          // All "don't know" words are now known - show batch complete
          setIsReviewingDontKnow(false);
          setShowBatchComplete(true);
        }
      } else {
        // Finished main batch
        if (dontKnowWords.length > 0) {
          // Switch to reviewing "don't know" words
          setIsReviewingDontKnow(true);
          setCurrentIndex(0);
        } else {
          // No "don't know" words - batch complete
          // Only save batch if not in review mode (to preserve original batch)
          if (!isReviewMode) {
            setLastCompletedBatch(currentBatch);
          }
          setShowBatchComplete(true);
        }
      }
    }
  }, [
    currentIndex,
    activeList.length,
    isReviewingDontKnow,
    dontKnowWords.length,
    loading,
    currentBatch,
    isReviewMode,
  ]);

  // Load next batch
  const loadNextBatch = () => {
    // Find where to continue from
    const batchToUse =
      lastCompletedBatch.length > 0 ? lastCompletedBatch : currentBatch;
    const currentBatchEnd =
      batchToUse.length > 0
        ? allNewWords.indexOf(batchToUse[batchToUse.length - 1]) + 1
        : 0;
    const remainingWords = allNewWords.slice(currentBatchEnd);

    // Always allow continuing learning regardless of daily goal
    const remainingToGoal = Math.max(0, dailyGoal - learnedToday);
    const batchSize =
      remainingToGoal === 0
        ? Math.min(dailyGoal, remainingWords.length) // Goal reached, use daily goal size
        : Math.min(remainingToGoal, remainingWords.length); // Limit to remaining goal

    if (batchSize > 0) {
      setCurrentBatch(remainingWords.slice(0, batchSize));
      setCurrentIndex(0);
      setDontKnowWords([]);
      setIsReviewingDontKnow(false);
      setShowBatchComplete(false);
      setLastCompletedBatch([]);
      setIsReviewMode(false);
    } else {
      // No more words available
      setCurrentBatch([]);
      setLastCompletedBatch([]);
      setShowBatchComplete(true);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!user || !currentWord) return;

    const isBookmarked = bookmarkedWords.has(currentWord.character);

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("word_character", currentWord.character);

        setBookmarkedWords((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentWord.character);
          return newSet;
        });
      } else {
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          word_character: currentWord.character,
        });

        setBookmarkedWords((prev) => new Set(prev).add(currentWord.character));
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

  const canLoadMore = allNewWords.length > currentBatch.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <BookOpen className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Learn New Words</h1>
              <p className="text-sm text-muted-foreground">
                Discover vocabulary you haven&apos;t seen yet
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Today&apos;s Progress</span>
            <span className="text-muted-foreground">
              {learnedToday} / {dailyGoal} words
            </span>
          </div>
          <div className="progress-bar mt-2">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min((learnedToday / dailyGoal) * 100, 100)}%`,
              }}
            />
          </div>
          {learnedToday >= dailyGoal && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <PartyPopper className="h-4 w-4" />
              Daily goal reached!
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            selectedLevels={selectedLevels}
            selectedCategories={selectedCategories}
            onLevelsChange={setSelectedLevels}
            onCategoriesChange={setSelectedCategories}
            totalCount={totalVocabulary}
            filteredCount={allNewWords.length}
          />
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
            <p className="mt-4 text-muted-foreground">Loading words...</p>
          </div>
        ) : showBatchComplete ? (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <PartyPopper className="h-8 w-8 text-[var(--accent)]" />
            </div>

            {learnedToday >= dailyGoal ? (
              <>
                <h2 className="text-xl font-semibold">Daily Goal Reached!</h2>
                <p className="mt-2 text-muted-foreground">
                  You&apos;ve learned {dailyGoal} new words today. Great work!
                  {canLoadMore &&
                    " You can continue learning more if you'd like."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {(currentBatch.length > 0 ||
                    lastCompletedBatch.length > 0) && (
                    <button
                      onClick={() => {
                        // Restart the batch for review with shuffled cards
                        const batchToReview =
                          lastCompletedBatch.length > 0
                            ? lastCompletedBatch
                            : currentBatch;
                        const shuffled = [...batchToReview].sort(
                          () => Math.random() - 0.5
                        );
                        setCurrentBatch(shuffled);
                        setCurrentIndex(0);
                        setDontKnowWords([]);
                        setIsReviewingDontKnow(false);
                        setShowBatchComplete(false);
                        setIsReviewMode(true);
                        // Keep lastCompletedBatch preserved for future reviews
                      }}
                      className="btn-secondary"
                    >
                      Review Batch
                    </button>
                  )}
                  {canLoadMore && (
                    <button
                      onClick={loadNextBatch}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Continue Learning
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Batch Complete!</h2>
                <p className="mt-2 text-muted-foreground">
                  You&apos;ve finished this batch of words.
                  {` ${
                    dailyGoal - learnedToday
                  } more to reach your daily goal.`}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      // Restart the batch for review with shuffled cards
                      const batchToReview =
                        lastCompletedBatch.length > 0
                          ? lastCompletedBatch
                          : currentBatch;
                      const shuffled = [...batchToReview].sort(
                        () => Math.random() - 0.5
                      );
                      setCurrentBatch(shuffled);
                      setCurrentIndex(0);
                      setDontKnowWords([]);
                      setIsReviewingDontKnow(false);
                      setShowBatchComplete(false);
                      setIsReviewMode(true);
                      // Keep lastCompletedBatch preserved for future reviews
                    }}
                    className="btn-secondary"
                  >
                    Review Batch
                  </button>
                  <button
                    onClick={loadNextBatch}
                    disabled={!canLoadMore}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue Learning
                  </button>
                </div>
              </>
            )}
          </div>
        ) : allNewWords.length === 0 ? (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No New Words Available</h2>
            <p className="mt-2 text-muted-foreground">
              You&apos;ve learned all available words matching your filters.
              <br />
              Try adjusting your filters or check back later for more content.
            </p>
          </div>
        ) : currentWord ? (
          <>
            {/* Status indicator */}
            <div className="mb-4 text-center text-sm text-muted-foreground">
              {isReviewingDontKnow ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Reviewing words you didn&apos;t know ({dontKnowWords.length}{" "}
                  remaining)
                </span>
              ) : (
                <span>
                  {remainingInBatch} word{remainingInBatch !== 1 ? "s" : ""} in
                  this batch
                  {dontKnowWords.length > 0 && (
                    <span className="ml-2 text-amber-600">
                      ({dontKnowWords.length} to review)
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Flashcard */}
            <div
              className="animate-fade-in"
              key={
                currentWord.character + (isReviewingDontKnow ? "-review" : "")
              }
            >
              <Flashcard
                word={currentWord}
                mode="learn"
                frontMode={flashcardFrontMode}
                isBookmarked={bookmarkedWords.has(currentWord.character)}
                onBookmarkToggle={toggleBookmark}
                onAnswer={handleAnswer}
              />
            </div>
          </>
        ) : (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Ready to Learn</h2>
            <p className="mt-2 text-muted-foreground">
              Select your preferences above and start learning!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
