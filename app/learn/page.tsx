'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Flashcard } from '@/components/Flashcard'
import { FilterBar } from '@/components/FilterBar'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { getWordsByFilters, getVocabularyCount, type VocabularyItem } from '@/lib/vocabulary'
import { calculateNextReviewDate, formatDateForDB } from '@/lib/spaced-repetition'
import { BookOpen, PartyPopper, Loader2 } from 'lucide-react'

export default function LearnPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  // Filter state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Words state
  const [newWords, setNewWords] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set())
  const [learnedToday, setLearnedToday] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(10)

  const totalVocabulary = getVocabularyCount()
  const currentWord = newWords[currentIndex]
  const remainingWords = newWords.length - currentIndex

  // Load user's learned words and filter to find new ones
  const loadNewWords = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      // Get all words matching filters
      const filteredWords = getWordsByFilters(selectedLevel, selectedCategory)

      // Get user's existing word progress
      const { data: progressData } = await supabase
        .from('word_progress')
        .select('word_character')
        .eq('user_id', user.id)

      const learnedCharacters = new Set(progressData?.map((p: { word_character: string }) => p.word_character) || [])

      // Filter to only new words
      const newWordsFiltered = filteredWords.filter(
        word => !learnedCharacters.has(word.character)
      )

      // Shuffle for variety
      const shuffled = [...newWordsFiltered].sort(() => Math.random() - 0.5)

      setNewWords(shuffled)
      setCurrentIndex(0)

      // Get bookmarks
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('word_character')
        .eq('user_id', user.id)

      setBookmarkedWords(new Set(bookmarkData?.map((b: { word_character: string }) => b.word_character) || []))

      // Get today's stats
      const today = formatDateForDB(new Date())
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('new_words_learned')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      setLearnedToday(statsData?.new_words_learned || 0)

      // Get user settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('daily_new_word_goal')
        .eq('user_id', user.id)
        .single()

      setDailyGoal(settingsData?.daily_new_word_goal || 10)

    } catch (error) {
      console.error('Error loading words:', error)
    } finally {
      setLoading(false)
    }
  }, [user, selectedLevel, selectedCategory, supabase])

  // Load words when filters change
  useEffect(() => {
    if (user) {
      loadNewWords()
    }
  }, [user, selectedLevel, selectedCategory, loadNewWords])

  // Handle answer (learn word)
  const handleAnswer = async (correct: boolean) => {
    if (!user || !currentWord) return

    try {
      const today = new Date()
      const nextReviewDate = calculateNextReviewDate(0)

      // Create word progress record
      await supabase.from('word_progress').insert({
        user_id: user.id,
        word_character: currentWord.character,
        state: 'learning',
        interval_index: correct ? 1 : 0,
        next_review_date: formatDateForDB(nextReviewDate),
        last_reviewed_at: today.toISOString(),
        correct_count: correct ? 1 : 0,
        incorrect_count: correct ? 0 : 1
      })

      // Update daily stats
      const todayStr = formatDateForDB(today)
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .single()

      if (existingStats) {
        await supabase
          .from('daily_stats')
          .update({ new_words_learned: existingStats.new_words_learned + 1 })
          .eq('id', existingStats.id)
      } else {
        await supabase.from('daily_stats').insert({
          user_id: user.id,
          date: todayStr,
          new_words_learned: 1,
          reviews_completed: 0
        })
      }

      // Update streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakData) {
        const lastDate = streakData.last_activity_date
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = formatDateForDB(yesterday)

        let newStreak = streakData.current_streak
        if (lastDate === todayStr) {
          // Already counted today
        } else if (lastDate === yesterdayStr) {
          // Consecutive day
          newStreak += 1
        } else if (!lastDate) {
          // First activity
          newStreak = 1
        } else {
          // Streak broken
          newStreak = 1
        }

        await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_activity_date: todayStr
          })
          .eq('id', streakData.id)
      }

      setLearnedToday(prev => prev + 1)
      setCurrentIndex(prev => prev + 1)

    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!user || !currentWord) return

    const isBookmarked = bookmarkedWords.has(currentWord.character)

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('word_character', currentWord.character)

        setBookmarkedWords(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentWord.character)
          return newSet
        })
      } else {
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          word_character: currentWord.character
        })

        setBookmarkedWords(prev => new Set(prev).add(currentWord.character))
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

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
              style={{ width: `${Math.min((learnedToday / dailyGoal) * 100, 100)}%` }}
            />
          </div>
          {learnedToday >= dailyGoal && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <PartyPopper className="h-4 w-4" />
              Daily goal reached! Keep going!
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            selectedLevel={selectedLevel}
            selectedCategory={selectedCategory}
            onLevelChange={setSelectedLevel}
            onCategoryChange={setSelectedCategory}
            totalCount={totalVocabulary}
            filteredCount={newWords.length}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading words...</p>
          </div>
        ) : !currentWord ? (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <PartyPopper className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold">All caught up!</h2>
            <p className="mt-2 text-muted-foreground">
              {newWords.length === 0 && (selectedLevel || selectedCategory)
                ? 'No new words match your filters. Try adjusting them.'
                : 'You&apos;ve learned all available words. Check back for reviews!'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {(selectedLevel || selectedCategory) && (
                <button
                  onClick={() => {
                    setSelectedLevel(null)
                    setSelectedCategory(null)
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => router.push('/review')}
                className="btn-primary"
              >
                Go to Review
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Word Counter */}
            <div className="mb-4 text-center text-sm text-muted-foreground">
              {remainingWords} new word{remainingWords !== 1 ? 's' : ''} remaining
            </div>

            {/* Flashcard */}
            <div className="animate-fade-in" key={currentWord.character}>
              <Flashcard
                word={currentWord}
                mode="learn"
                isBookmarked={bookmarkedWords.has(currentWord.character)}
                onBookmarkToggle={toggleBookmark}
                onAnswer={handleAnswer}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
