import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Trophy, Calendar } from "lucide-react";

interface ProgressTrackerProps {
  wordsLearnedToday: number;
  dailyGoal: number;
  wordsReviewedToday: number;
  reviewGoal: number;
  currentStreak: number;
  totalWordsLearned: number;
}

export default function ProgressTracker({
  wordsLearnedToday,
  dailyGoal,
  wordsReviewedToday,
  reviewGoal,
  currentStreak,
  totalWordsLearned
}: ProgressTrackerProps) {
  const learnProgress = Math.min((wordsLearnedToday / dailyGoal) * 100, 100);
  const reviewProgress = Math.min((wordsReviewedToday / reviewGoal) * 100, 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full" data-testid="progress-tracker">
      {/* Daily Learning Progress */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Today's Goal</p>
            <p className="text-xs text-muted-foreground">
              {wordsLearnedToday} / {dailyGoal} words
            </p>
            <Progress value={learnProgress} className="mt-2 h-2" />
          </div>
        </div>
      </Card>

      {/* Review Progress */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-chart-3/10 rounded-lg">
            <Calendar className="h-5 w-5 text-chart-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Reviews</p>
            <p className="text-xs text-muted-foreground">
              {wordsReviewedToday} / {reviewGoal} words
            </p>
            <Progress value={reviewProgress} className="mt-2 h-2" />
          </div>
        </div>
      </Card>

      {/* Current Streak */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-chart-2/10 rounded-lg">
            <Flame className="h-5 w-5 text-chart-2" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Streak</p>
            <p className="text-2xl font-bold text-chart-2" data-testid="text-streak">
              {currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>
      </Card>

      {/* Total Words Learned */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-chart-1/10 rounded-lg">
            <Trophy className="h-5 w-5 text-chart-1" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Total</p>
            <p className="text-2xl font-bold text-chart-1" data-testid="text-total">
              {totalWordsLearned}
            </p>
            <p className="text-xs text-muted-foreground">words learned</p>
          </div>
        </div>
      </Card>
    </div>
  );
}