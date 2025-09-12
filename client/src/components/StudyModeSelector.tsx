import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, RotateCcw, Target, Clock } from "lucide-react";

type StudyMode = 'learn' | 'review';

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  learnCount: number;
  reviewCount: number;
  disabled?: boolean;
}

export default function StudyModeSelector({ 
  selectedMode, 
  onModeChange,
  learnCount,
  reviewCount,
  disabled = false 
}: StudyModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      <Card 
        className={`p-6 cursor-pointer hover-elevate border transition-all ${
          selectedMode === 'learn' 
            ? 'border-primary bg-primary/5' 
            : 'border-card-border bg-card'
        }`}
        onClick={() => !disabled && onModeChange('learn')}
        data-testid="card-learn-mode"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${
            selectedMode === 'learn' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">Learn New Words</h3>
            <p className="text-sm text-muted-foreground">Discover new vocabulary</p>
            <div className="flex items-center space-x-2 mt-2">
              <Target className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium text-chart-2">
                {learnCount} words available
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card 
        className={`p-6 cursor-pointer hover-elevate border transition-all ${
          selectedMode === 'review' 
            ? 'border-primary bg-primary/5' 
            : 'border-card-border bg-card'
        }`}
        onClick={() => !disabled && onModeChange('review')}
        data-testid="card-review-mode"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${
            selectedMode === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <RotateCcw className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">Review Words</h3>
            <p className="text-sm text-muted-foreground">Practice learned vocabulary</p>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium text-chart-3">
                {reviewCount} words due
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}