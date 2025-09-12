import { useState } from "react";
import FilterPanel from '../FilterPanel';

export default function FilterPanelExample() {
  const [settings, setSettings] = useState({
    selectedLevels: ['第1級'],
    selectedCategories: ['核心詞'],
    showOnlyDue: false
  });

  const availableLevels = ['第1級', '第2級', '第3級', '第4級', '第5級', '第6級'];
  const availableCategories = [
    '核心詞',
    '8.教育、學習',
    '10.餐飲、烹飪',
    '3.身體、健康',
    '5.家庭、人際關係',
    '7.工作、職業'
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-md mx-auto">
        <FilterPanel 
          settings={settings}
          onSettingsChange={setSettings}
          availableLevels={availableLevels}
          availableCategories={availableCategories}
        />
      </div>
    </div>
  );
}