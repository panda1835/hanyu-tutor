import type { 
  VocabularyWord, 
  UserProgress as BaseUserProgress, 
  LearningStats,
  FilterSettings 
} from '../types/schema';
import vocabularyData from '../data/vocabulary.json';

// Local storage interface for user progress - simpler than database schema
interface LocalUserProgress {
  wordId: string;
  status: 'learning' | 'reviewing' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  fibonacciLevel: number;
  nextReview: string | null;
  isBookmarked?: boolean;
}

// Fibonacci sequence for spaced repetition intervals (in days)
const FIBONACCI_INTERVALS = [1, 3, 4, 7, 11, 18, 29];

// Simple hash function for generating stable IDs
function generateStableId(character: string, pinyin: string, definition: string): string {
  const combined = character + '|' + pinyin + '|' + definition;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'word_' + Math.abs(hash).toString();
}

// Seeded random number generator for consistent daily batches
function seededRandom(seed: number): () => number {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

// Get date-based seed for consistent daily batches
function getDailyBatchSeed(): number {
  const today = new Date();
  const dateString = today.getFullYear() + '' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '' + 
                    String(today.getDate()).padStart(2, '0');
  return parseInt(dateString);
}

interface JSONVocabularyItem {
  character: string;
  level: string;
  category: string;
  pinyin: string;
  definition: string;
}

export interface StudyResult {
  wordId: string;
  isCorrect: boolean;
  responseTime: number;
  wasSkipped?: boolean;
}

class VocabularyService {
  private vocabularyWords: VocabularyWord[] = [];
  private userProgress: Map<string, LocalUserProgress> = new Map();
  private learningStats: LearningStats = {
    dailyGoal: 20,
    reviewLimit: 50,
    wordsLearnedToday: 0,
    wordsReviewedToday: 0,
    currentStreak: 0,
    lastStudyDate: null,
  };

  constructor() {
    this.loadFromStorage();
    // Load vocabulary from JSON if not already loaded
    if (this.vocabularyWords.length === 0) {
      this.loadVocabularyFromJSON();
    }
  }

  // Load vocabulary from JSON file
  loadVocabularyFromJSON(): void {
    try {
      const newVocabulary = (vocabularyData as JSONVocabularyItem[])
        .map(item => {
          const character = item.character?.trim() || '';
          const level = item.level?.trim() || '';
          const category = item.category?.trim() || '';
          const pinyin = item.pinyin?.trim() || '';
          const definition = item.definition?.trim() || '';
          
          if (!character || !definition) return null;

          const id = generateStableId(character, pinyin, definition);
          if (!id) {
            console.error('Failed to generate ID for word:', character, pinyin, definition);
            return null;
          }

          return {
            id,
            character,
            level,
            category,
            pinyin,
            definition
          } as VocabularyWord;
        })
        .filter(word => word !== null);

      // Reconcile with existing progress
      this.reconcileVocabulary(newVocabulary);
      this.saveVocabularyToStorage();
      
      console.log(`Loaded ${newVocabulary.length} vocabulary words successfully`);
    } catch (error) {
      console.error('Error loading vocabulary from JSON:', error);
    }
  }

  // Reconcile new vocabulary with existing progress data
  private reconcileVocabulary(newVocabulary: VocabularyWord[]): void {
    const newWordIds = new Set(newVocabulary.map(w => w.id));
    const currentWordIds = new Set(this.vocabularyWords.map(w => w.id));
    
    // Update vocabulary list
    this.vocabularyWords = newVocabulary;
    
    // Clean up orphaned progress entries (words that no longer exist)
    const orphanedProgressEntries: string[] = [];
    this.userProgress.forEach((progress, wordId) => {
      if (!newWordIds.has(wordId)) {
        orphanedProgressEntries.push(wordId);
      }
    });
    
    // Remove orphaned entries
    orphanedProgressEntries.forEach(wordId => {
      this.userProgress.delete(wordId);
    });
    
    // Log reconciliation results
    const added = newVocabulary.filter(w => !currentWordIds.has(w.id)).length;
    const removed = Array.from(currentWordIds).filter(id => !newWordIds.has(id)).length;
    const preserved = Array.from(this.userProgress.keys()).filter(id => newWordIds.has(id)).length;
    
    console.log(`Vocabulary reconciliation: ${added} added, ${removed} removed, ${preserved} progress entries preserved, ${orphanedProgressEntries.length} orphaned entries cleaned up`);
  }

  // Get filtered vocabulary based on user settings
  getFilteredVocabulary(filters: FilterSettings): VocabularyWord[] {
    return this.vocabularyWords.filter(word => {
      const levelMatch = filters.selectedLevels.length === 0 || 
                        filters.selectedLevels.includes(word.level);
      const categoryMatch = filters.selectedCategories.length === 0 || 
                           filters.selectedCategories.includes(word.category);
      
      if (!levelMatch || !categoryMatch) return false;

      if (filters.showOnlyDue) {
        const progress = this.userProgress.get(word.id);
        return progress && this.isWordDueForReview(progress);
      }

      return true;
    });
  }

  // Get words for learning (new words) - shuffled with daily limit enforcement using date-based seeding
  getWordsForLearning(filters: FilterSettings = { selectedLevels: [], selectedCategories: [], showOnlyDue: false }): VocabularyWord[] {
    const remainingToday = this.getRemainingDailyLearningQuota();
    if (remainingToday <= 0) return [];

    const filteredWords = this.getFilteredVocabulary(filters)
      .filter(word => {
        const progress = this.userProgress.get(word.id!);
        return !progress || progress.status === 'learning';
      });
    
    // Use date-based seeded shuffle for consistent daily batches
    const seedRandom = seededRandom(getDailyBatchSeed());
    const shuffledWords = [...filteredWords].sort(() => seedRandom() - 0.5);
    
    return shuffledWords.slice(0, remainingToday);
  }

  // Get today's batch of words for learning regardless of daily quota (for re-studying)
  getTodaysBatchForLearning(filters: FilterSettings = { selectedLevels: [], selectedCategories: [], showOnlyDue: false }): VocabularyWord[] {
    const filteredWords = this.getFilteredVocabulary(filters)
      .filter(word => {
        const progress = this.userProgress.get(word.id!);
        return !progress || progress.status === 'learning';
      });
    
    // Use date-based seeded shuffle for consistent daily batches
    const seedRandom = seededRandom(getDailyBatchSeed());
    const shuffledWords = [...filteredWords].sort(() => seedRandom() - 0.5);
    
    return shuffledWords.slice(0, this.learningStats.dailyGoal);
  }

  // Get words for review based on spaced repetition schedule with daily limit enforcement and date-based seeding
  getWordsForReview(filters: FilterSettings = { selectedLevels: [], selectedCategories: [], showOnlyDue: false }): VocabularyWord[] {
    const remainingToday = this.getRemainingDailyReviewQuota();
    if (remainingToday <= 0) return [];

    const filteredWords = this.getFilteredVocabulary(filters)
      .filter(word => {
        const progress = this.userProgress.get(word.id);
        return progress && this.isWordDueForReview(progress);
      })
      .sort((a, b) => {
        const progressA = this.userProgress.get(a.id)!;
        const progressB = this.userProgress.get(b.id)!;
        
        // Prioritize overdue words
        if (progressA.nextReview && progressB.nextReview) {
          return new Date(progressA.nextReview).getTime() - new Date(progressB.nextReview).getTime();
        }
        return 0;
      });

    // Apply seeded shuffling after sorting by priority to maintain some consistency
    const seedRandom = seededRandom(getDailyBatchSeed() + 1); // +1 for different seed than learning
    const shuffledWords = [...filteredWords].sort(() => seedRandom() - 0.5);
    
    return shuffledWords.slice(0, remainingToday);
  }

  // Get today's batch of words for review regardless of daily quota (for re-studying)
  getTodaysBatchForReview(filters: FilterSettings = { selectedLevels: [], selectedCategories: [], showOnlyDue: false }): VocabularyWord[] {
    const filteredWords = this.getFilteredVocabulary(filters)
      .filter(word => {
        const progress = this.userProgress.get(word.id);
        return progress && this.isWordDueForReview(progress);
      })
      .sort((a, b) => {
        const progressA = this.userProgress.get(a.id)!;
        const progressB = this.userProgress.get(b.id)!;
        
        // Prioritize overdue words
        if (progressA.nextReview && progressB.nextReview) {
          return new Date(progressA.nextReview).getTime() - new Date(progressB.nextReview).getTime();
        }
        return 0;
      });

    // Apply seeded shuffling after sorting by priority to maintain some consistency
    const seedRandom = seededRandom(getDailyBatchSeed() + 1); // +1 for different seed than learning
    const shuffledWords = [...filteredWords].sort(() => seedRandom() - 0.5);
    
    return shuffledWords.slice(0, this.learningStats.reviewLimit);
  }

  // Check if a word is due for review
  private isWordDueForReview(progress: LocalUserProgress): boolean {
    if (!progress.nextReview || progress.status === 'mastered') return false;
    return new Date(progress.nextReview) <= new Date();
  }

  // Process study results with bookmark support
  processStudyResults(results: StudyResult[], bookmarkedWords: Set<string> = new Set()): void {
    let learnedCount = 0;
    let reviewedCount = 0;

    for (const result of results) {
      const wasNewWord = !this.userProgress.has(result.wordId);
      
      // Always update progress to create entries for total count
      // But handle skipped words differently
      if (result.wasSkipped) {
        // For skipped words, create basic progress entry without affecting spaced repetition
        this.createBasicProgressEntry(result.wordId);
      } else {
        // For answered words, update full progress with spaced repetition
        this.updateWordProgress(result.wordId, result.isCorrect);
      }
      
      // Mark word as bookmarked if flagged
      if (bookmarkedWords.has(result.wordId)) {
        const progress = this.userProgress.get(result.wordId);
        if (progress) {
          progress.isBookmarked = true;
        }
      }
      
      // Count ALL interactions (including skipped) toward daily stats
      // This ensures Know/Don't Know buttons count as study activity
      if (wasNewWord) {
        learnedCount++;
      } else {
        reviewedCount++;
      }
    }
    
    // Update daily counters
    this.incrementDailyStats(learnedCount, reviewedCount);
    
    // Update and save everything
    this.updateDailyStats();
    this.saveLearningStatsToStorage();
    this.saveProgressToStorage();
  }

  // Create basic progress entry for skipped words
  private createBasicProgressEntry(wordId: string): void {
    if (!this.userProgress.has(wordId)) {
      const basicProgress: LocalUserProgress = {
        wordId,
        status: 'learning',
        correctCount: 0,
        incorrectCount: 0,
        fibonacciLevel: 0,
        nextReview: null,
        isBookmarked: false
      };
      this.userProgress.set(wordId, basicProgress);
    }
  }

  // Update word progress based on study result
  private updateWordProgress(wordId: string, isCorrect: boolean): void {
    let progress = this.userProgress.get(wordId);
    
    if (!progress) {
      progress = {
        wordId,
        status: 'learning',
        correctCount: 0,
        incorrectCount: 0,
        fibonacciLevel: 0,
        nextReview: null,
        isBookmarked: false
      };
      this.userProgress.set(wordId, progress);
    }

    if (isCorrect) {
      progress.correctCount++;
      progress.fibonacciLevel = Math.min(progress.fibonacciLevel + 1, FIBONACCI_INTERVALS.length - 1);
      
      // Set next review date
      const daysToAdd = FIBONACCI_INTERVALS[progress.fibonacciLevel];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysToAdd);
      progress.nextReview = nextReview.toISOString();
      
      // Update status based on fibonacci level
      if (progress.fibonacciLevel >= FIBONACCI_INTERVALS.length - 1) {
        progress.status = 'mastered';
      } else {
        progress.status = 'reviewing';
      }
      
      console.log('Correct answer for:', this.vocabularyWords.find(w => w.id === wordId)?.character);
    } else {
      progress.incorrectCount++;
      progress.fibonacciLevel = Math.max(0, progress.fibonacciLevel - 1);
      
      // Set next review to tomorrow for incorrect answers
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 1);
      progress.nextReview = nextReview.toISOString();
      progress.status = 'reviewing';
      
      console.log('Incorrect answer for:', this.vocabularyWords.find(w => w.id === wordId)?.character);
    }
  }

  // Get available levels and categories
  getAvailableLevels(): string[] {
    return Array.from(new Set(this.vocabularyWords.map(word => word.level))).sort();
  }

  getAvailableCategories(): string[] {
    return Array.from(new Set(this.vocabularyWords.map(word => word.category))).sort();
  }

  // Daily limit management
  getRemainingDailyLearningQuota(): number {
    return Math.max(0, this.learningStats.dailyGoal - this.learningStats.wordsLearnedToday);
  }

  getRemainingDailyReviewQuota(): number {
    return Math.max(0, this.learningStats.reviewLimit - this.learningStats.wordsReviewedToday);
  }

  isDailyLearningGoalReached(): boolean {
    return this.getRemainingDailyLearningQuota() === 0;
  }

  isDailyReviewGoalReached(): boolean {
    return this.getRemainingDailyReviewQuota() === 0;
  }

  // Manually increment daily counters when study session completes
  incrementDailyStats(learnedCount: number, reviewedCount: number): void {
    this.learningStats.wordsLearnedToday += learnedCount;
    this.learningStats.wordsReviewedToday += reviewedCount;
  }

  // Update daily study statistics - FIXED to properly count session results
  private updateDailyStats(): void {
    const today = new Date().toDateString();
    const lastStudyDate = this.learningStats.lastStudyDate;
    
    // Reset daily counters if it's a new day
    if (!lastStudyDate || new Date(lastStudyDate).toDateString() !== today) {
      this.learningStats.wordsLearnedToday = 0;
      this.learningStats.wordsReviewedToday = 0;
      
      // Update streak
      if (lastStudyDate) {
        const daysDiff = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          this.learningStats.currentStreak++;
        } else if (daysDiff > 1) {
          this.learningStats.currentStreak = 1;
        }
      } else {
        this.learningStats.currentStreak = 1;
      }
      
      this.learningStats.lastStudyDate = today;
    }
  }

  // Get total words learned (words that have been studied at least once)
  getTotalWordsLearned(): number {
    return this.userProgress.size;
  }

  // Get progress statistics
  getProgressStats() {
    const stats = { ...this.learningStats };
    const reviewStats = this.getReviewStats();
    
    return {
      ...stats,
      ...reviewStats,
      totalWordsLearned: this.getTotalWordsLearned(),
      bookmarkedCount: Array.from(this.userProgress.values()).filter(p => p.isBookmarked).length,
    };
  }

  // Get review statistics
  getReviewStats(): { dueCount: number; overdueCount: number; masteredCount: number } {
    const now = new Date();
    let dueCount = 0;
    let overdueCount = 0;
    let masteredCount = 0;

    this.userProgress.forEach(progress => {
      if (progress.status === 'mastered') {
        masteredCount++;
      } else if (progress.nextReview) {
        const reviewDate = new Date(progress.nextReview);
        if (reviewDate <= now) {
          dueCount++;
          if (reviewDate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
            overdueCount++;
          }
        }
      }
    });

    return { dueCount, overdueCount, masteredCount };
  }

  // Toggle bookmark status for a word
  toggleBookmark(wordId: string): boolean {
    const progress = this.userProgress.get(wordId);
    if (!progress) {
      // Create new progress entry if it doesn't exist
      const newProgress: LocalUserProgress = {
        wordId,
        status: 'learning',
        correctCount: 0,
        incorrectCount: 0,
        fibonacciLevel: 0,
        nextReview: null,
        isBookmarked: true
      };
      this.userProgress.set(wordId, newProgress);
      this.saveProgressToStorage();
      return true;
    }
    
    progress.isBookmarked = !progress.isBookmarked;
    this.saveProgressToStorage();
    return progress.isBookmarked;
  }

  // Get bookmarked words
  getBookmarkedWords(filterSettings: FilterSettings = { selectedLevels: [], selectedCategories: [], showOnlyDue: false }): VocabularyWord[] {
    const bookmarkedIds = Array.from(this.userProgress.entries())
      .filter(([_, progress]) => progress.isBookmarked)
      .map(([wordId, _]) => wordId);

    return this.getFilteredVocabulary(filterSettings)
      .filter(word => bookmarkedIds.includes(word.id!));
  }

  // Check if a word is bookmarked
  isWordBookmarked(wordId: string): boolean {
    const progress = this.userProgress.get(wordId);
    return progress?.isBookmarked === true;
  }

  // Storage methods
  private loadFromStorage(): void {
    try {
      // Load vocabulary
      const vocabData = localStorage.getItem('vocabulary_words');
      if (vocabData) {
        this.vocabularyWords = JSON.parse(vocabData);
      }

      // Load progress
      const progressData = localStorage.getItem('user_progress');
      if (progressData) {
        const progressArray: LocalUserProgress[] = JSON.parse(progressData);
        this.userProgress = new Map(progressArray.filter(p => p.wordId).map(p => [p.wordId, p]));
      }

      // Load stats
      const statsData = localStorage.getItem('learning_stats');
      if (statsData) {
        this.learningStats = { ...this.learningStats, ...JSON.parse(statsData) };
      }
      
      // Check if it's a new day and reset counters if needed
      this.updateDailyStats();
    } catch (error) {
      console.warn('Error loading from storage:', error);
    }
  }

  private saveVocabularyToStorage(): void {
    localStorage.setItem('vocabulary_words', JSON.stringify(this.vocabularyWords));
  }

  private saveProgressToStorage(): void {
    const progressArray = Array.from(this.userProgress.values());
    localStorage.setItem('user_progress', JSON.stringify(progressArray));
  }

  private saveLearningStatsToStorage(): void {
    localStorage.setItem('learning_stats', JSON.stringify(this.learningStats));
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    this.vocabularyWords = [];
    this.userProgress.clear();
    this.learningStats = {
      dailyGoal: 20,
      reviewLimit: 50,
      wordsLearnedToday: 0,
      wordsReviewedToday: 0,
      currentStreak: 0,
      lastStudyDate: null,
    };
    
    localStorage.removeItem('vocabulary_words');
    localStorage.removeItem('user_progress');
    localStorage.removeItem('learning_stats');
  }
}

// Export singleton instance
export const vocabularyService = new VocabularyService();