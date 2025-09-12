import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Trophy, Clock, Target } from "lucide-react";
import type { StudyResult } from "../lib/vocabularyService";

interface SessionCompleteProps {
  results: StudyResult[];
  mode: 'learn' | 'review';
  onContinue: () => void;
  onNewSession: () => void;
}

export default function SessionComplete({ 
  results, 
  mode, 
  onContinue, 
  onNewSession 
}: SessionCompleteProps) {
  const totalWords = results.length;
  const correctWords = results.filter(r => r.isCorrect).length;
  const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
  const averageTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length / 1000) 
    : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-lg w-full text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-chart-2" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Session Complete!
          </h2>
          <p className="text-muted-foreground">
            {mode === 'learn' 
              ? 'Great job learning new vocabulary!' 
              : 'Excellent work reviewing your words!'
            }
          </p>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{totalWords}</div>
              <div className="text-xs text-muted-foreground">Words Studied</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-chart-2">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-chart-3">{averageTime}s</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Correct Answers</span>
              <span>{correctWords} of {totalWords}</span>
            </div>
            <Progress value={accuracy} className="h-3" />
          </div>

          {/* Breakdown */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-chart-2" />
              <span>{correctWords} correct</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{totalWords - correctWords} incorrect</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onContinue}
            className="flex-1"
            data-testid="button-continue"
          >
            Continue
          </Button>
          <Button 
            onClick={onNewSession}
            className="flex-1"
            data-testid="button-new-session"
          >
            <Target className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </Card>
    </div>
  );
}