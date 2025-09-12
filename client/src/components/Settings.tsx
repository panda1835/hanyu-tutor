import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Target, Clock, Volume2, Bell, Download, Upload } from "lucide-react";

interface SettingsProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  settings: {
    dailyGoal: number;
    reviewLimit: number;
    enableSound: boolean;
    enableNotifications: boolean;
    autoPlayAudio: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export default function Settings({ 
  isOpen, 
  onOpenChange,
  settings,
  onSettingsChange 
}: SettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
    // TODO: Implement data export functionality
  };

  const handleImportData = () => {
    console.log('Importing user data...');
    // TODO: Implement data import functionality  
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      console.log('Resetting all progress...');
      // TODO: Implement progress reset
    }
  };

  const content = (
    <div className="space-y-6" data-testid="settings-content">
      {/* Study Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Study Goals</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="daily-goal">Daily Learning Goal</Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.dailyGoal} words
                </span>
              </div>
              <Slider
                id="daily-goal"
                min={5}
                max={100}
                step={5}
                value={[settings.dailyGoal]}
                onValueChange={(value) => updateSetting('dailyGoal', value[0])}
                className="w-full"
                data-testid="slider-daily-goal"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="review-limit">Daily Review Limit</Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.reviewLimit} words
                </span>
              </div>
              <Slider
                id="review-limit"
                min={10}
                max={200}
                step={10}
                value={[settings.reviewLimit]}
                onValueChange={(value) => updateSetting('reviewLimit', value[0])}
                className="w-full"
                data-testid="slider-review-limit"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Audio Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Audio & Sound</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-sound">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Enable audio feedback for interactions</p>
              </div>
              <Switch
                id="enable-sound"
                checked={settings.enableSound}
                onCheckedChange={(checked) => updateSetting('enableSound', checked)}
                data-testid="switch-sound"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-audio">Auto-play Pronunciation</Label>
                <p className="text-sm text-muted-foreground">Automatically play audio when showing new words</p>
              </div>
              <Switch
                id="auto-audio"
                checked={settings.autoPlayAudio}
                onCheckedChange={(checked) => updateSetting('autoPlayAudio', checked)}
                data-testid="switch-auto-audio"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Study Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about daily study goals</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
              data-testid="switch-notifications"
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Management</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Progress</p>
                <p className="text-sm text-muted-foreground">Download your learning data</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportData}
                data-testid="button-export"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Import Progress</p>
                <p className="text-sm text-muted-foreground">Restore from backup file</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImportData}
                data-testid="button-import"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Reset All Progress</p>
                <p className="text-sm text-muted-foreground">Clear all learning data permanently</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={resetProgress}
                data-testid="button-reset"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (isOpen !== undefined && onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}