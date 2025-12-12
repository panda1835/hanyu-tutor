import { createBrowserClient } from '@supabase/ssr'

// Create a Supabase client for browser-side operations
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time / when env vars are not set
    // This allows the build to complete without actual Supabase credentials
    console.warn('Supabase environment variables not set. Using mock client.')
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => {},
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), data: [], error: null }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
        delete: () => ({ eq: async () => ({ error: null }) }),
        eq: () => ({ single: async () => ({ data: null, error: null }) })
      })
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Types for database tables
export interface UserSettings {
  id: string
  user_id: string
  daily_new_word_goal: number
  daily_review_goal: number
  created_at: string
  updated_at: string
}

export interface WordProgress {
  id: string
  user_id: string
  word_character: string
  state: 'learning' | 'reviewing' | 'mastered'
  interval_index: number
  next_review_date: string | null
  last_reviewed_at: string | null
  correct_count: number
  incorrect_count: number
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  word_character: string
  created_at: string
}

export interface DailyStats {
  id: string
  user_id: string
  date: string
  new_words_learned: number
  reviews_completed: number
  created_at: string
  updated_at: string
}

export interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}
