/**
 * Fibonacci-based Spaced Repetition System
 * 
 * Intervals (in days): [1, 2, 3, 5, 8, 13, 21, 34, 55]
 * 
 * Rules:
 * - First review starts at 1 day after learning
 * - Correct answer: advance to next interval
 * - Incorrect answer: reset to interval index 0 (1 day)
 * - Word is mastered when reaching the last interval (55 days)
 */

// Fibonacci-based intervals in days
export const INTERVALS = [1, 2, 3, 5, 8, 13, 21, 34, 55] as const

// Maximum interval index (mastery threshold)
export const MAX_INTERVAL_INDEX = INTERVALS.length - 1

/**
 * Get the next interval index based on answer correctness
 * @param currentIndex - Current interval index
 * @param correct - Whether the user answered correctly
 * @returns New interval index
 */
export function getNextIntervalIndex(currentIndex: number, correct: boolean): number {
  if (!correct) {
    // Reset to beginning on incorrect answer
    return 0
  }
  
  // Advance to next interval, capped at max
  return Math.min(currentIndex + 1, MAX_INTERVAL_INDEX)
}

/**
 * Calculate the next review date
 * @param intervalIndex - The current interval index
 * @returns Date object for next review
 */
export function calculateNextReviewDate(intervalIndex: number): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day
  
  const daysToAdd = INTERVALS[Math.min(intervalIndex, MAX_INTERVAL_INDEX)]
  const nextDate = new Date(today)
  nextDate.setDate(nextDate.getDate() + daysToAdd)
  
  return nextDate
}

/**
 * Format date to ISO string (YYYY-MM-DD) for database storage
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if a word is mastered (reached max interval)
 * @param intervalIndex - Current interval index
 * @returns Whether the word is mastered
 */
export function isMastered(intervalIndex: number): boolean {
  return intervalIndex >= MAX_INTERVAL_INDEX
}

/**
 * Get the interval in days for a given index
 */
export function getIntervalDays(intervalIndex: number): number {
  return INTERVALS[Math.min(intervalIndex, MAX_INTERVAL_INDEX)]
}

/**
 * Check if a word is due for review
 * @param nextReviewDate - The next scheduled review date (ISO string or Date)
 * @returns Whether the word is due today or overdue
 */
export function isDueForReview(nextReviewDate: string | Date | null): boolean {
  if (!nextReviewDate) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const reviewDate = new Date(nextReviewDate)
  reviewDate.setHours(0, 0, 0, 0)
  
  return reviewDate <= today
}

/**
 * Get word state based on interval index
 */
export function getWordState(intervalIndex: number): 'learning' | 'reviewing' | 'mastered' {
  if (intervalIndex === 0) return 'learning'
  if (isMastered(intervalIndex)) return 'mastered'
  return 'reviewing'
}

/**
 * Calculate streak - checks if today is consecutive with last activity
 * @param lastActivityDate - Last activity date (ISO string or null)
 * @param currentStreak - Current streak count
 * @returns Updated streak info
 */
export function calculateStreak(
  lastActivityDate: string | null,
  currentStreak: number
): { newStreak: number; isNewDay: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (!lastActivityDate) {
    // First activity ever
    return { newStreak: 1, isNewDay: true }
  }
  
  const lastDate = new Date(lastActivityDate)
  lastDate.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Same day - no streak change
    return { newStreak: currentStreak, isNewDay: false }
  } else if (diffDays === 1) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, isNewDay: true }
  } else {
    // Streak broken - reset to 1
    return { newStreak: 1, isNewDay: true }
  }
}
