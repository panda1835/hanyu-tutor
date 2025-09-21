import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Bookmark } from "lucide-react";
import type { VocabularyWord } from "../types/schema";
import { vocabularyService } from "../lib/vocabularyService";

interface VocabularyCardProps {
  word: VocabularyWord;
  showAnswer: boolean;
  onFlip: () => void;
  onAnswer: (isCorrect: boolean) => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export default function VocabularyCard({ 
  word, 
  showAnswer, 
  onFlip, 
  onAnswer,
  onSkip,
  disabled = false 
}: VocabularyCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(
    vocabularyService.isWordBookmarked(word.id!)
  );

  // Update bookmark state when word changes
  useEffect(() => {
    setIsBookmarked(vocabularyService.isWordBookmarked(word.id!));
  }, [word.id]);

  const handleCorrect = () => {
    console.log('Correct answer for:', word.character);
    onAnswer(true);
  };

  const handleIncorrect = () => {
    console.log('Incorrect answer for:', word.character);
    onAnswer(false);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const toggleBookmark = () => {
    const newBookmarkStatus = vocabularyService.toggleBookmark(word.id!);
    setIsBookmarked(newBookmarkStatus);
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="vocabulary-card">
      <Card 
        className="min-h-[300px] flex flex-col items-center justify-center p-8 bg-card hover-elevate border border-card-border cursor-pointer transition-all duration-200 relative" 
        onClick={!disabled ? onFlip : undefined}
      >
        {/* Bookmark button - positioned absolutely in top-right */}
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark();
            }}
            data-testid="button-bookmark"
            className="flex items-center space-x-1"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </Button>
        </div>

        {!showAnswer ? (
          // Character side
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="text-6xl font-medium font-sans-sc text-foreground leading-none">
              {word.character}
            </div>
            <div className="text-lg text-muted-foreground font-mono">
              {word.pinyin}
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
        <Button 
          variant="destructive"
          onClick={handleIncorrect}
          disabled={disabled}
          data-testid="button-dont-know"
          className="flex items-center space-x-2"
        >
          <XCircle className="h-4 w-4" />
          <span>Don't Know</span>
        </Button>
        <Button 
          variant="default"
          onClick={handleCorrect}
          disabled={disabled}
          data-testid="button-know"
          className="flex items-center space-x-2 bg-chart-2 hover:bg-chart-2/90 text-white"
        >
          <CheckCircle className="h-4 w-4" />
          <span>I Know This</span>
        </Button>
      </div>
    </div>
  );
}