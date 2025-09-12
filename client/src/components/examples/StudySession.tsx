import StudySession from '../StudySession';

export default function StudySessionExample() {
  const mockWords = [
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
      character: "茶",
      level: "第1級",
      category: "10.餐飲、烹飪",
      pinyin: "chá",
      definition: "tea, tea plant, CL:杯[bei1], 壺|壶[hu2]"
    },
    {
      id: "3",
      character: "大",
      level: "第1級",
      category: "核心詞",
      pinyin: "dà",
      definition: "big, large, great, older (than another person), eldest (as in 大姐[da4 jie3]), greatly, freely, fully"
    }
  ];

  const handleComplete = (results: any[]) => {
    console.log('Study session completed:', results);
  };

  const handleExit = () => {
    console.log('Exiting study session');
  };

  return (
    <StudySession
      words={mockWords}
      mode="learn"
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}