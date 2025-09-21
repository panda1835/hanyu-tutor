import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Navigation from "./components/Navigation";
import StudyModeSelector from "./components/StudyModeSelector";
import ProgressTracker from "./components/ProgressTracker";
import FilterPanel from "./components/FilterPanel";
import StudySession from "./components/StudySession";
import Settings from "./components/Settings";
import BookmarkedWords from "./components/BookmarkedWords";

import { vocabularyService } from "./lib/vocabularyService";
import type { VocabularyWord } from "./types/schema";


type StudyMode = 'learn' | 'review';
type AppPage = 'home' | 'study' | 'stats' | 'bookmarks';

function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // App navigation state
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [studyMode, setStudyMode] = useState<StudyMode>('learn');
  const [isInSession, setIsInSession] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookmarkedStudyWords, setBookmarkedStudyWords] = useState<VocabularyWord[]>([]);

  // Filter and settings state
  const [filterSettings, setFilterSettings] = useState({
    selectedLevels: [] as string[],
    selectedCategories: [] as string[],
    showOnlyDue: false
  });

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      dailyGoal: 20,
      reviewLimit: 50,
      enableSound: true,
      enableNotifications: false,
      autoPlayAudio: true,
    };
  });

  // Real progress tracking state
  const [progressStats, setProgressStats] = useState(() => {
    return vocabularyService.getProgressStats();
  });

  const [isLoading, setIsLoading] = useState(true);
  const [vocabularyLoaded, setVocabularyLoaded] = useState(false);

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist app settings
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    // Update vocabulary service with new settings
    vocabularyService.updateSettings({
      dailyGoal: appSettings.dailyGoal,
      reviewLimit: appSettings.reviewLimit
    });
  }, [appSettings]);

  // Initialize vocabulary data
  useEffect(() => {
    // Vocabulary is automatically loaded from JSON in the service constructor
    setVocabularyLoaded(true);
    setIsLoading(false);
    
    // Initialize vocabulary service with current app settings
    vocabularyService.updateSettings({
      dailyGoal: appSettings.dailyGoal,
      reviewLimit: appSettings.reviewLimit
    });
  }, [appSettings.dailyGoal, appSettings.reviewLimit]);

  // Update progress stats when needed
  const refreshProgressStats = () => {
    setProgressStats(vocabularyService.getProgressStats());
  };

  // Get available levels and categories for filters
  const availableLevels = vocabularyService.getAvailableLevels();
  const availableCategories = vocabularyService.getAvailableCategories();

  // Check daily limits first
  const isDailyLearningGoalReached = vocabularyService.isDailyLearningGoalReached();
  const isDailyReviewGoalReached = vocabularyService.isDailyReviewGoalReached();
  const remainingLearningQuota = vocabularyService.getRemainingDailyLearningQuota();
  const remainingReviewQuota = vocabularyService.getRemainingDailyReviewQuota();

  // Get words for current study mode - including daily batches for re-study
  const learnWords = isDailyLearningGoalReached 
    ? vocabularyService.getTodaysBatchForLearning(filterSettings)
    : vocabularyService.getWordsForLearning(filterSettings);
  const reviewWords = isDailyReviewGoalReached
    ? vocabularyService.getTodaysBatchForReview(filterSettings)
    : vocabularyService.getWordsForReview(filterSettings);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleStartStudy = (mode: StudyMode) => {
    setStudyMode(mode);
    setIsInSession(true);
  };

  const handleCompleteSession = (results: any[]) => {
    console.log('Session completed with results:', results);
    // Process results through vocabulary service
    vocabularyService.processStudyResults(results);
    // Refresh progress stats
    refreshProgressStats();
    setIsInSession(false);
    setBookmarkedStudyWords([]); // Clear bookmarked study words when completing
  };

  const handleExitSession = () => {
    setIsInSession(false);
    setBookmarkedStudyWords([]); // Clear bookmarked study words when exiting
  };

  // Show loading state
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Loading Vocabulary...</h2>
              <p className="text-muted-foreground">Preparing your Chinese learning experience</p>
            </Card>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Study Session View
  if (isInSession) {
    let studyWords: VocabularyWord[];
    if (bookmarkedStudyWords.length > 0) {
      studyWords = bookmarkedStudyWords;
    } else {
      studyWords = studyMode === 'learn' ? learnWords : reviewWords;
    }
    
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StudySession
            words={studyWords}
            mode={studyMode}
            onComplete={handleCompleteSession}
            onExit={handleExitSession}
          />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Main Application View
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSettingsOpen={() => setIsSettingsOpen(true)}
            isDarkMode={isDarkMode}
            onThemeToggle={handleThemeToggle}
            wordsLearned={progressStats.totalWordsLearned}
            streak={progressStats.currentStreak}
          />

          <main className="max-w-6xl mx-auto p-6 space-y-8">
            {currentPage === 'home' && (
              <>
                <h1 className="text-3xl font-bold text-foreground">Study Chinese</h1>

                {/* Progress Overview */}
                <ProgressTracker
                  wordsLearnedToday={progressStats.wordsLearnedToday}
                  dailyGoal={appSettings.dailyGoal}
                  wordsReviewedToday={progressStats.wordsReviewedToday}
                  reviewGoal={appSettings.reviewLimit}
                  currentStreak={progressStats.currentStreak}
                  totalWordsLearned={progressStats.totalWordsLearned}
                />

                {/* Filter Panel */}
                <FilterPanel
                  settings={filterSettings}
                  onSettingsChange={setFilterSettings}
                  availableLevels={availableLevels}
                  availableCategories={availableCategories}
                />

                {/* Study Mode Selection */}
                <StudyModeSelector
                  selectedMode={studyMode}
                  onModeChange={setStudyMode}
                  learnCount={learnWords.length}
                  reviewCount={reviewWords.length}
                />

                {/* Start Study Button */}
                <div className="flex flex-col items-center pt-4 space-y-2">
                  {studyMode === 'learn' && isDailyLearningGoalReached && learnWords.length > 0 && (
                    <p className="text-sm text-muted-foreground">Daily learning goal reached! Re-studying today's batch of words.</p>
                  )}
                  {studyMode === 'learn' && isDailyLearningGoalReached && learnWords.length === 0 && (
                    <p className="text-sm text-muted-foreground">Daily learning goal reached! No more words available for today.</p>
                  )}
                  {studyMode === 'review' && isDailyReviewGoalReached && reviewWords.length > 0 && (
                    <p className="text-sm text-muted-foreground">Daily review limit reached! Re-studying today's review batch.</p>
                  )}
                  {studyMode === 'review' && isDailyReviewGoalReached && reviewWords.length === 0 && (
                    <p className="text-sm text-muted-foreground">Daily review limit reached! No more reviews available for today.</p>
                  )}
                  {studyMode === 'learn' && !isDailyLearningGoalReached && remainingLearningQuota < appSettings.dailyGoal && (
                    <p className="text-sm text-muted-foreground">{remainingLearningQuota} words remaining today</p>
                  )}
                  {studyMode === 'review' && !isDailyReviewGoalReached && remainingReviewQuota < appSettings.reviewLimit && (
                    <p className="text-sm text-muted-foreground">{remainingReviewQuota} reviews remaining today</p>
                  )}
                  
                  <Button
                    size="lg"
                    onClick={() => handleStartStudy(studyMode)}
                    disabled={
                      studyMode === 'learn' 
                        ? learnWords.length === 0
                        : reviewWords.length === 0
                    }
                    data-testid="button-start-study"
                    className="px-8 py-3 text-lg"
                  >
                    {studyMode === 'learn' && isDailyLearningGoalReached ? 'Re-study' : 'Start'} {studyMode === 'learn' ? 'Learning' : 'Review'} Session
                  </Button>
                </div>
              </>
            )}

            {currentPage === 'stats' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
                <ProgressTracker
                  wordsLearnedToday={progressStats.wordsLearnedToday}
                  dailyGoal={appSettings.dailyGoal}
                  wordsReviewedToday={progressStats.wordsReviewedToday}
                  reviewGoal={appSettings.reviewLimit}
                  currentStreak={progressStats.currentStreak}
                  totalWordsLearned={progressStats.totalWordsLearned}
                />
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Detailed Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{availableLevels.length > 0 ? vocabularyService.getFilteredVocabulary({ selectedLevels: [], selectedCategories: [], showOnlyDue: false }).length : 0}</p>
                      <p className="text-sm text-muted-foreground">Total Words</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-2">{progressStats.masteredCount}</p>
                      <p className="text-sm text-muted-foreground">Mastered Words</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-3">{progressStats.dueCount}</p>
                      <p className="text-sm text-muted-foreground">Due for Review</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-1">{availableCategories.length}</p>
                      <p className="text-sm text-muted-foreground">Categories</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {currentPage === 'bookmarks' && (
              <BookmarkedWords
                onStartStudy={(words) => {
                  // Start a study session with bookmarked words
                  setStudyMode('review'); // Default to review mode for bookmarked words
                  setBookmarkedStudyWords(words);
                  setIsInSession(true);
                }}
              />
            )}
          </main>

          {/* Settings Dialog */}
          <Settings
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            settings={appSettings}
            onSettingsChange={setAppSettings}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
