import { useState } from "react";
import VocabularyCard from "./VocabularyCard";
import SessionComplete from "./SessionComplete";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pause, Play, SkipForward } from "lucide-react";
import type { VocabularyWord } from "@shared/schema";
import type { StudyResult } from "../lib/vocabularyService";

interface StudySessionProps {
  words: VocabularyWord[];
  mode: 'learn' | 'review';
  onComplete: (results: StudyResult[]) => void;
  onExit: () => void;
}


export default function StudySession({ words, mode, onComplete, onExit }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;
  const isLastWord = currentIndex === words.length - 1;

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentWord) return;

    const responseTime = Date.now() - startTime;
    const newResult: StudyResult = {
      wordId: currentWord.id,
      isCorrect,
      responseTime
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    if (isLastWord) {
      // Session complete
      setTimeout(() => {
        setSessionComplete(true);
      }, 1000);
    } else {
      // Move to next word
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      }, 1000);
    }
  };

  const handleSkip = () => {
    if (!currentWord) return;

    const newResult: StudyResult = {
      wordId: currentWord.id,
      isCorrect: false,
      responseTime: Date.now() - startTime,
      wasSkipped: true
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    if (isLastWord) {
      setTimeout(() => {
        setSessionComplete(true);
      }, 500);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setStartTime(Date.now());
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSessionComplete = () => {
    onComplete(results);
  };

  const handleNewSession = () => {
    onExit();
  };

  // Show session complete screen
  if (sessionComplete) {
    return (
      <SessionComplete
        results={results}
        mode={mode}
        onContinue={handleSessionComplete}
        onNewSession={handleNewSession}
      />
    );
  }

  if (isPaused) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Session Paused</h2>
          <p className="text-muted-foreground mb-6">
            Take a break and resume when you're ready
          </p>
          <div className="flex space-x-4 justify-center">
            <Button onClick={() => setIsPaused(false)} data-testid="button-resume">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <Button variant="outline" onClick={onExit} data-testid="button-exit-paused">
              Exit Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">No Words Available</h2>
          <p className="text-muted-foreground mb-6">
            There are no words to study in this session.
          </p>
          <Button onClick={onExit}>Return to Menu</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="study-session">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onExit}
              data-testid="button-exit-session"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">
                {mode === 'learn' ? 'Learning New Words' : 'Reviewing Words'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} of {words.length} words
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              data-testid="button-skip"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePause}
              data-testid="button-pause"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <VocabularyCard
          word={currentWord}
          showAnswer={showAnswer}
          onFlip={handleFlip}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}