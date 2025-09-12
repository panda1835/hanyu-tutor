import ProgressTracker from '../ProgressTracker';

export default function ProgressTrackerExample() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <ProgressTracker 
        wordsLearnedToday={12}
        dailyGoal={20}
        wordsReviewedToday={15}
        reviewGoal={25}
        currentStreak={7}
        totalWordsLearned={156}
      />
    </div>
  );
}