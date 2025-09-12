import { useState } from "react";
import VocabularyCard from '../VocabularyCard';

export default function VocabularyCardExample() {
  const [showAnswer, setShowAnswer] = useState(false);

  const mockWord = {
    id: "1",
    character: "愛",
    level: "第1級",
    category: "核心詞",
    pinyin: "ài",
    definition: "to love, to be fond of, to like, affection, to be inclined (to do sth), to tend to (happen)"
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = (isCorrect: boolean) => {
    console.log('Answer:', isCorrect);
    // Reset card after answer
    setTimeout(() => {
      setShowAnswer(false);
    }, 1000);
  };

  return (
    <div className="p-8 bg-background min-h-screen flex items-center justify-center">
      <VocabularyCard 
        word={mockWord}
        showAnswer={showAnswer}
        onFlip={handleFlip}
        onAnswer={handleAnswer}
      />
    </div>
  );
}