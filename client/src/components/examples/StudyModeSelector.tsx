import { useState } from "react";
import StudyModeSelector from '../StudyModeSelector';

export default function StudyModeSelectorExample() {
  const [selectedMode, setSelectedMode] = useState<'learn' | 'review'>('learn');

  return (
    <div className="p-8 bg-background min-h-screen flex items-center justify-center">
      <StudyModeSelector 
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        learnCount={47}
        reviewCount={23}
      />
    </div>
  );
}