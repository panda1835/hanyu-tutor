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

import type { VocabularyWord } from "@shared/schema";

// Mock vocabulary data from the CSV
const mockVocabularyData: VocabularyWord[] = [
  {
    id: "1",
    character: "愛",
    level: "第1級",
    category: "核心詞",
    pinyin: "ài",
    definition: "to love, to be fond of, to like, affection, to be inclined (to do sth), to tend to (happen)"
  },
  {
    id: "2",
    character: "吧",
    level: "第1級",
    category: "核心詞",
    pinyin: "ba",
    definition: "(modal particle indicating suggestion or surmise), ...right?, ...OK?, ...I presume."
  },
  {
    id: "3",
    character: "八",
    level: "第1級",
    category: "核心詞",
    pinyin: "bā",
    definition: "eight, 8"
  },
  {
    id: "4",
    character: "爸爸",
    level: "第1級",
    category: "核心詞",
    pinyin: "bàba/bà",
    definition: "(coll.) father, dad, CL:個|个[ge4], 位[wei4]"
  },
  {
    id: "5",
    character: "茶",
    level: "第1級",
    category: "10.餐飲、烹飪",
    pinyin: "chá",
    definition: "tea, tea plant, CL:杯[bei1], 壺|壶[hu2]"
  },
  {
    id: "6",
    character: "車子",
    level: "第1級",
    category: "核心詞",
    pinyin: "chēzi/chē",
    definition: "car or other vehicle (bicycle, truck etc)"
  },
  {
    id: "7",
    character: "吃",
    level: "第1級",
    category: "核心詞",
    pinyin: "chī",
    definition: "to eat, to consume, to eat at (a cafeteria etc), to eradicate, to destroy, to absorb, to suffer (shock, injury, defeat etc)"
  },
  {
    id: "8",
    character: "大學",
    level: "第1級",
    category: "8.教育、學習",
    pinyin: "dàxué",
    definition: "university, college, CL:所[suo3]"
  }
]; //todo: remove mock functionality

type StudyMode = 'learn' | 'review';
type AppPage = 'home' | 'study' | 'stats';

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

  // Progress tracking state //todo: remove mock functionality
  const [progressStats, setProgressStats] = useState(() => {
    const saved = localStorage.getItem('progressStats');
    return saved ? JSON.parse(saved) : {
      wordsLearnedToday: 12,
      wordsReviewedToday: 8,
      currentStreak: 7,
      totalWordsLearned: 156,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };
  });

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
  }, [appSettings]);

  // Persist progress stats
  useEffect(() => {
    localStorage.setItem('progressStats', JSON.stringify(progressStats));
  }, [progressStats]);

  // Get filtered words based on current filters
  const getFilteredWords = () => {
    return mockVocabularyData.filter(word => {
      const levelMatch = filterSettings.selectedLevels.length === 0 || 
                        filterSettings.selectedLevels.includes(word.level);
      const categoryMatch = filterSettings.selectedCategories.length === 0 || 
                           filterSettings.selectedCategories.includes(word.category);
      return levelMatch && categoryMatch;
    });
  };

  // Get unique levels and categories for filters
  const availableLevels = Array.from(new Set(mockVocabularyData.map(w => w.level)));
  const availableCategories = Array.from(new Set(mockVocabularyData.map(w => w.category)));

  const filteredWords = getFilteredWords();
  const learnWords = filteredWords.slice(0, appSettings.dailyGoal);
  const reviewWords = filteredWords.slice(0, appSettings.reviewLimit); //todo: remove mock functionality - should be based on spaced repetition schedule

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleStartStudy = (mode: StudyMode) => {
    setStudyMode(mode);
    setIsInSession(true);
  };

  const handleCompleteSession = (results: any[]) => {
    console.log('Session completed with results:', results);
    //todo: remove mock functionality - should update progress and schedule next reviews
    setProgressStats((prev: any) => ({
      ...prev,
      wordsLearnedToday: studyMode === 'learn' ? prev.wordsLearnedToday + results.length : prev.wordsLearnedToday,
      wordsReviewedToday: studyMode === 'review' ? prev.wordsReviewedToday + results.length : prev.wordsReviewedToday
    }));
    setIsInSession(false);
  };

  const handleExitSession = () => {
    setIsInSession(false);
  };

  // Study Session View
  if (isInSession) {
    const studyWords = studyMode === 'learn' ? learnWords : reviewWords;
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
                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => handleStartStudy(studyMode)}
                    disabled={studyMode === 'learn' ? learnWords.length === 0 : reviewWords.length === 0}
                    data-testid="button-start-study"
                    className="px-8 py-3 text-lg"
                  >
                    Start {studyMode === 'learn' ? 'Learning' : 'Review'} Session
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
                      <p className="text-2xl font-bold text-primary">{filteredWords.length}</p>
                      <p className="text-sm text-muted-foreground">Available Words</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-2">85%</p>
                      <p className="text-sm text-muted-foreground">Accuracy Rate</p> {/* todo: remove mock functionality */}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-3">23</p>
                      <p className="text-sm text-muted-foreground">Due for Review</p> {/* todo: remove mock functionality */}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-1">4.2</p>
                      <p className="text-sm text-muted-foreground">Avg Session Time</p> {/* todo: remove mock functionality */}
                    </div>
                  </div>
                </Card>
              </div>
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
