import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2, CheckCircle, XCircle } from "lucide-react";
import type { VocabularyWord } from "@shared/schema";

interface VocabularyCardProps {
  word: VocabularyWord;
  showAnswer: boolean;
  onFlip: () => void;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export default function VocabularyCard({ 
  word, 
  showAnswer, 
  onFlip, 
  onAnswer,
  disabled = false 
}: VocabularyCardProps) {
  const handleSpeak = () => {
    // Use Web Speech API to pronounce Chinese character
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.character);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCorrect = () => {
    console.log('Correct answer for:', word.character);
    onAnswer(true);
  };

  const handleIncorrect = () => {
    console.log('Incorrect answer for:', word.character);
    onAnswer(false);
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="vocabulary-card">
      <Card className="min-h-[300px] flex flex-col items-center justify-center p-8 bg-card hover-elevate border border-card-border">
        {!showAnswer ? (
          // Character side
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="text-6xl font-medium font-sans-sc text-foreground leading-none">
              {word.character}
            </div>
            <div className="text-lg text-muted-foreground font-mono">
              {word.pinyin}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSpeak}
                data-testid="button-speak"
                className="flex items-center space-x-1"
              >
                <Volume2 className="h-4 w-4" />
                <span>Listen</span>
              </Button>
            </div>
          </div>
        ) : (
          // Definition side
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="text-3xl font-medium font-sans-sc text-foreground">
              {word.character}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {word.pinyin}
            </div>
            <div className="text-base text-foreground leading-relaxed max-w-sm">
              {word.definition}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="bg-secondary px-2 py-1 rounded-sm">
                {word.level}
              </span>
              <span className="bg-secondary px-2 py-1 rounded-sm">
                {word.category}
              </span>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-center space-x-4 mt-6">
        {!showAnswer ? (
          <Button 
            onClick={onFlip} 
            disabled={disabled}
            data-testid="button-flip-card"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Show Answer</span>
          </Button>
        ) : (
          <>
            <Button 
              variant="destructive"
              onClick={handleIncorrect}
              disabled={disabled}
              data-testid="button-incorrect"
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Don't Know</span>
            </Button>
            <Button 
              onClick={onFlip}
              variant="ghost"
              size="icon"
              disabled={disabled}
              data-testid="button-flip-back"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="default"
              onClick={handleCorrect}
              disabled={disabled}
              data-testid="button-correct"
              className="flex items-center space-x-2 bg-chart-2 hover:bg-chart-2/90 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Know</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}