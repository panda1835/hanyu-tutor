'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/src/components/Header'
import { useAuth } from '@/src/components/AuthProvider'
import { useTheme } from '@/src/components/ThemeProvider'
import { createClient } from '@/src/lib/supabase'
import type { FlashcardFrontMode } from '@/src/components/Flashcard'
import { 
  Settings as SettingsIcon, 
  Loader2, 
  Save,
  Sun,
  Moon,
  Monitor,
  Check,
  Languages,
  BookOpen,
  Shuffle
} from 'lucide-react'

// Helper for localStorage flashcard mode
const FLASHCARD_MODE_KEY = 'hanzi-ledger-flashcard-mode'

export function getFlashcardFrontMode(): FlashcardFrontMode {
  if (typeof window === 'undefined') return 'chinese'
  return (localStorage.getItem(FLASHCARD_MODE_KEY) as FlashcardFrontMode) || 'chinese'
}

export function setFlashcardFrontMode(mode: FlashcardFrontMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(FLASHCARD_MODE_KEY, mode)
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('flashcard-mode-change', { detail: mode }))
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [dailyNewGoal, setDailyNewGoal] = useState(10)
  const [dailyReviewGoal, setDailyReviewGoal] = useState(20)
  const [flashcardMode, setFlashcardModeState] = useState<FlashcardFrontMode>('chinese')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load settings from Supabase and localStorage
  const loadSettings = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setDailyNewGoal(data.daily_new_word_goal)
        setDailyReviewGoal(data.daily_review_goal)
      }
      
      // Load flashcard mode from localStorage (client-side only)
      setFlashcardModeState(getFlashcardFrontMode())
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadSettings()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading, loadSettings])

  // Handle flashcard mode change (instant, no save needed)
  const handleFlashcardModeChange = (mode: FlashcardFrontMode) => {
    setFlashcardModeState(mode)
    setFlashcardFrontMode(mode)
  }

  // Save Supabase settings (daily goals only)
  const saveSettings = async () => {
    if (!user) return

    setSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          daily_new_word_goal: dailyNewGoal,
          daily_review_goal: dailyReviewGoal
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)

    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ] as const

  const flashcardModeOptions = [
    { value: 'chinese' as FlashcardFrontMode, label: 'Chinese Only', icon: Languages, description: 'Show Chinese character on front' },
    { value: 'definition' as FlashcardFrontMode, label: 'Definition Only', icon: BookOpen, description: 'Show English definition on front' },
    { value: 'mixed' as FlashcardFrontMode, label: 'Mixed', icon: Shuffle, description: 'Randomly show Chinese or definition' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <SettingsIcon className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your learning experience
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Flashcard Front Mode - Client-side, instant */}
            <div className="paper-card">
              <h2 className="mb-2 text-lg font-semibold">Flashcard Display</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Choose what to show on the front of flashcards. Changes apply instantly.
              </p>

              <div className="space-y-3">
                {flashcardModeOptions.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => handleFlashcardModeChange(value)}
                    className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      flashcardMode === value
                        ? 'border-[var(--accent)] bg-accent/10'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      flashcardMode === value ? 'bg-[var(--accent)] text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${flashcardMode === value ? 'text-[var(--accent)]' : ''}`}>
                        {label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {description}
                      </div>
                    </div>
                    {flashcardMode === value && (
                      <Check className="h-5 w-5 text-[var(--accent)] shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goals - Stored in Supabase */}
            <div className="paper-card">
              <h2 className="mb-4 text-lg font-semibold">Daily Goals</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Set your daily learning targets. These are used to track your progress on the stats page.
              </p>

              <div className="space-y-4">
                {/* New Words Goal */}
                <div>
                  <label htmlFor="newGoal" className="mb-1.5 block text-sm font-medium">
                    New words per day
                  </label>
                  <input
                    id="newGoal"
                    type="number"
                    min={1}
                    max={100}
                    value={dailyNewGoal}
                    onChange={(e) => setDailyNewGoal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended: 5-20 words for sustainable learning
                  </p>
                </div>

                {/* Review Goal */}
                <div>
                  <label htmlFor="reviewGoal" className="mb-1.5 block text-sm font-medium">
                    Reviews per day
                  </label>
                  <input
                    id="reviewGoal"
                    type="number"
                    min={1}
                    max={200}
                    value={dailyReviewGoal}
                    onChange={(e) => setDailyReviewGoal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended: 10-50 reviews to reinforce memory
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Goals
                    </>
                  )}
                </button>
                {saved && (
                  <span className="text-sm text-green-600">
                    Goals updated successfully
                  </span>
                )}
              </div>
            </div>

            {/* Appearance */}
            <div className="paper-card">
              <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose your preferred color scheme.
              </p>

              <div className="flex flex-wrap gap-3">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      theme === value
                        ? 'border-[var(--accent)] bg-accent/10 text-[var(--accent)]'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="paper-card">
              <h2 className="mb-4 text-lg font-semibold">Account</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="paper-card">
              <h2 className="mb-4 text-lg font-semibold">About Hanzi Ledger</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  A Chinese vocabulary learning app using flashcards and spaced repetition.
                </p>
                <p>
                  The spaced repetition system uses Fibonacci intervals (1, 2, 3, 5, 8, 13, 21, 34, 55 days) 
                  to help you remember words long-term. Words are considered mastered after successfully 
                  reviewing at the 55-day interval.
                </p>
                <div className="pt-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    Version 1.0.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
