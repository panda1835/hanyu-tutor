import Papa from 'papaparse';
import type { 
  VocabularyWord, 
  UserProgress, 
  LearningStats,
  FilterSettings 
} from '@shared/schema';

// Fibonacci sequence for spaced repetition intervals (in days)
const FIBONACCI_INTERVALS = [1, 3, 4, 7, 11, 18, 29];

interface CSVRow {
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
}

class VocabularyService {
  private vocabularyWords: VocabularyWord[] = [];
  private userProgress: Map<string, UserProgress> = new Map();
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
  }

  // Parse CSV data and load vocabulary
  async loadVocabularyFromCSV(csvText: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing errors:', results.errors);
          }

          this.vocabularyWords = results.data.map((row, index) => ({
            id: `word_${index + 1}`,
            character: row.character?.trim() || '',
            level: row.level?.trim() || '',
            category: row.category?.trim() || '',
            pinyin: row.pinyin?.trim() || '',
            definition: row.definition?.trim() || '',
          })).filter(word => word.character && word.definition);

          this.saveVocabularyToStorage();
          resolve();
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
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

  // Get words for learning (new words not yet studied)
  getWordsForLearning(filters: FilterSettings, limit: number): VocabularyWord[] {
    const filtered = this.getFilteredVocabulary(filters);
    return filtered
      .filter(word => !this.userProgress.has(word.id))
      .slice(0, limit);
  }

  // Get words for review based on spaced repetition schedule
  getWordsForReview(filters: FilterSettings, limit: number): VocabularyWord[] {
    const filtered = this.getFilteredVocabulary(filters);
    const dueWords = filtered
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

    return dueWords.slice(0, limit);
  }

  // Check if a word is due for review
  private isWordDueForReview(progress: UserProgress): boolean {
    if (!progress.nextReview) return false;
    return new Date(progress.nextReview) <= new Date();
  }

  // Process study session results and update progress
  processStudyResults(results: StudyResult[], mode: 'learn' | 'review'): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Update daily stats
    this.updateDailyStats(today);
    
    results.forEach(result => {
      const word = this.vocabularyWords.find(w => w.id === result.wordId);
      if (!word) return;

      let progress = this.userProgress.get(result.wordId);
      
      if (!progress) {
        // New word
        progress = {
          id: `progress_${result.wordId}`,
          userId: 'local_user',
          wordId: result.wordId,
          status: 'learning',
          lastReviewed: new Date(),
          nextReview: this.calculateNextReview(0, result.isCorrect),
          reviewCount: 1,
          correctCount: result.isCorrect ? 1 : 0,
          fibonacciLevel: result.isCorrect ? 1 : 0,
        };
        this.learningStats.wordsLearnedToday++;
      } else {
        // Existing word review
        progress.lastReviewed = new Date();
        progress.reviewCount = (progress.reviewCount || 0) + 1;
        if (result.isCorrect) {
          progress.correctCount = (progress.correctCount || 0) + 1;
        }

        // Update fibonacci level and next review date
        const currentLevel = progress.fibonacciLevel || 0;
        if (result.isCorrect) {
          progress.fibonacciLevel = Math.min(currentLevel + 1, FIBONACCI_INTERVALS.length - 1);
          progress.status = progress.fibonacciLevel >= FIBONACCI_INTERVALS.length - 1 ? 'mastered' : 'reviewing';
        } else {
          progress.fibonacciLevel = Math.max(0, currentLevel - 1);
          progress.status = 'reviewing';
        }

        progress.nextReview = this.calculateNextReview(progress.fibonacciLevel, result.isCorrect);
        
        if (mode === 'review') {
          this.learningStats.wordsReviewedToday++;
        }
      }

      this.userProgress.set(result.wordId, progress);
    });

    this.saveProgressToStorage();
    this.saveLearningStatsToStorage();
  }

  // Calculate next review date based on fibonacci intervals
  private calculateNextReview(fibonacciLevel: number, wasCorrect: boolean): Date {
    const intervalDays = FIBONACCI_INTERVALS[Math.max(0, Math.min(fibonacciLevel, FIBONACCI_INTERVALS.length - 1))];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
  }

  // Update daily statistics and streak
  private updateDailyStats(today: string): void {
    if (this.learningStats.lastStudyDate !== today) {
      // New study day
      const lastDate = this.learningStats.lastStudyDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Consecutive day - increment streak
        this.learningStats.currentStreak++;
      } else if (lastDate !== today) {
        // Gap in studying - reset streak
        this.learningStats.currentStreak = 1;
      }

      // Reset daily counters
      this.learningStats.wordsLearnedToday = 0;
      this.learningStats.wordsReviewedToday = 0;
      this.learningStats.lastStudyDate = today;
    }
  }

  // Get available levels and categories
  getAvailableLevels(): string[] {
    return Array.from(new Set(this.vocabularyWords.map(w => w.level))).sort();
  }

  getAvailableCategories(): string[] {
    return Array.from(new Set(this.vocabularyWords.map(w => w.category))).sort();
  }

  // Get learning statistics
  getLearningStats(): LearningStats {
    return { ...this.learningStats };
  }

  // Update learning settings
  updateSettings(settings: Partial<LearningStats>): void {
    this.learningStats = { ...this.learningStats, ...settings };
    this.saveLearningStatsToStorage();
  }

  // Get total words learned
  getTotalWordsLearned(): number {
    return Array.from(this.userProgress.values()).length;
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
        const progressArray: UserProgress[] = JSON.parse(progressData);
        this.userProgress = new Map(progressArray.filter(p => p.wordId).map(p => [p.wordId!, p]));
      }

      // Load stats
      const statsData = localStorage.getItem('learning_stats');
      if (statsData) {
        this.learningStats = { ...this.learningStats, ...JSON.parse(statsData) };
      }
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