import { useState } from "react";
import Settings from '../Settings';

export default function SettingsExample() {
  const [settings, setSettings] = useState({
    dailyGoal: 20,
    reviewLimit: 50,
    enableSound: true,
    enableNotifications: false,
    autoPlayAudio: true,
  });

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
}