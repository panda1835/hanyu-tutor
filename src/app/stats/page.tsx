'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/src/components/Header'
import { useAuth } from '@/src/components/AuthProvider'
import { createClient } from '@/src/lib/supabase'
import { formatDateForDB } from '@/src/lib/spaced-repetition'
import { 
  BarChart3, 
  Loader2, 
  Flame, 
  BookOpen, 
  RotateCcw, 
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface Stats {
  // Daily
  newWordsToday: number
  reviewsToday: number
  dailyNewGoal: number
  dailyReviewGoal: number
  // Totals
  totalLearning: number
  totalReviewing: number
  totalMastered: number
  totalDueToday: number
  // Streak
  currentStreak: number
  longestStreak: number
}

export default function StatsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const today = formatDateForDB(new Date())

      // Get today's stats
      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      // Get user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Get word progress counts
      const { data: learningWords } = await supabase
        .from('word_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('state', 'learning')

      const { data: reviewingWords } = await supabase
        .from('word_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('state', 'reviewing')

      const { data: masteredWords } = await supabase
        .from('word_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('state', 'mastered')

      // Get due today count
      const { data: dueWords } = await supabase
        .from('word_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .lte('next_review_date', today)

      // Get streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setStats({
        newWordsToday: dailyStats?.new_words_learned || 0,
        reviewsToday: dailyStats?.reviews_completed || 0,
        dailyNewGoal: settings?.daily_new_word_goal || 10,
        dailyReviewGoal: settings?.daily_review_goal || 20,
        totalLearning: learningWords?.length || 0,
        totalReviewing: reviewingWords?.length || 0,
        totalMastered: masteredWords?.length || 0,
        totalDueToday: dueWords?.length || 0,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0
      })

    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user, loadStats])

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  const totalWords = stats 
    ? stats.totalLearning + stats.totalReviewing + stats.totalMastered 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <BarChart3 className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Statistics</h1>
              <p className="text-sm text-muted-foreground">
                Track your learning progress
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Streak Card */}
            <div className="paper-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                    <Flame className="h-7 w-7 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">
                      day streak
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Best streak</div>
                  <div className="text-lg font-semibold">{stats.longestStreak} days</div>
                </div>
              </div>
              {stats.currentStreak > 0 && (
                <div className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                  🔥 Keep learning every day to maintain your streak!
                </div>
              )}
            </div>

            {/* Daily Progress */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* New Words Today */}
              <div className="paper-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">New Words Today</div>
                    <div className="text-2xl font-bold">
                      {stats.newWordsToday}
                      <span className="text-base font-normal text-muted-foreground">
                        {' '}/ {stats.dailyNewGoal}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="progress-bar mt-3">
                  <div 
                    className="progress-bar-fill bg-blue-500" 
                    style={{ 
                      width: `${Math.min((stats.newWordsToday / stats.dailyNewGoal) * 100, 100)}%`,
                      backgroundColor: 'rgb(59, 130, 246)'
                    }}
                  />
                </div>
              </div>

              {/* Reviews Today */}
              <div className="paper-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                    <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Reviews Today</div>
                    <div className="text-2xl font-bold">
                      {stats.reviewsToday}
                      <span className="text-base font-normal text-muted-foreground">
                        {' '}/ {stats.dailyReviewGoal}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="progress-bar mt-3">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min((stats.reviewsToday / stats.dailyReviewGoal) * 100, 100)}%`,
                      backgroundColor: 'rgb(34, 197, 94)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Word Counts */}
            <div className="paper-card">
              <h2 className="mb-4 text-lg font-semibold">Word Progress</h2>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{totalWords}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Total Learned</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalLearning}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Learning</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">{stats.totalReviewing}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Reviewing</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">{stats.totalMastered}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Mastered</div>
                </div>
              </div>
            </div>

            {/* Due Today */}
            <div className="paper-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Due for Review</div>
                    <div className="text-sm text-muted-foreground">
                      Words scheduled for today
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold">{stats.totalDueToday}</div>
              </div>
              {stats.totalDueToday > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/review')}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Start Reviewing
                  </button>
                </div>
              )}
            </div>

            {/* Mastery Progress */}
            {totalWords > 0 && (
              <div className="paper-card">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                  <h2 className="text-lg font-semibold">Mastery Progress</h2>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all"
                    style={{ width: `${(stats.totalLearning / totalWords) * 100}%` }}
                  />
                  <div 
                    className="absolute top-0 h-full bg-amber-500 transition-all"
                    style={{ 
                      left: `${(stats.totalLearning / totalWords) * 100}%`,
                      width: `${(stats.totalReviewing / totalWords) * 100}%` 
                    }}
                  />
                  <div 
                    className="absolute top-0 h-full bg-green-500 transition-all"
                    style={{ 
                      left: `${((stats.totalLearning + stats.totalReviewing) / totalWords) * 100}%`,
                      width: `${(stats.totalMastered / totalWords) * 100}%` 
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Learning ({Math.round((stats.totalLearning / totalWords) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Reviewing ({Math.round((stats.totalReviewing / totalWords) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Mastered ({Math.round((stats.totalMastered / totalWords) * 100)}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
