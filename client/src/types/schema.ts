// Shared types for the HanyuTutor application

export interface VocabularyWord {
  id: string;
  character: string;
  level: string;
  category: string;
  pinyin: string;
  definition: string;
}

export interface UserProgress {
  wordId: string;
  status: 'learning' | 'reviewing' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  fibonacciLevel: number;
  nextReview: string | null;
  isBookmarked?: boolean;
}

export interface LearningStats {
  dailyGoal: number;
  reviewLimit: number;
  wordsLearnedToday: number;
  wordsReviewedToday: number;
  currentStreak: number;
  lastStudyDate: string | null;
}

export interface FilterSettings {
  selectedLevels: string[];
  selectedCategories: string[];
  showOnlyDue: boolean;
}

export interface StudyResult {
  wordId: string;
  isCorrect: boolean;
  responseTime: number;
  wasSkipped?: boolean;
}
