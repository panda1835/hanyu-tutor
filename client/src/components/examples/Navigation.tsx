import { useState } from "react";
import Navigation from '../Navigation';

export default function NavigationExample() {
  const [currentPage, setCurrentPage] = useState<'home' | 'study' | 'stats'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSettingsOpen = () => {
    console.log('Opening settings');
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Theme toggled:', !isDarkMode);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background">
        <Navigation
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSettingsOpen={handleSettingsOpen}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          wordsLearned={156}
          streak={7}
        />
        <div className="p-8">
          <p className="text-foreground">Current page: {currentPage}</p>
        </div>
      </div>
    </div>
  );
}