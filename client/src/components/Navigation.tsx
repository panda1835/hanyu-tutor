import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Settings, Menu, Sun, Moon, BarChart3 } from "lucide-react";

interface NavigationProps {
  currentPage: 'home' | 'study' | 'stats';
  onPageChange: (page: 'home' | 'study' | 'stats') => void;
  onSettingsOpen: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  wordsLearned?: number;
  streak?: number;
}

export default function Navigation({
  currentPage,
  onPageChange,
  onSettingsOpen,
  isDarkMode = false,
  onThemeToggle,
  wordsLearned = 0,
  streak = 0
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/logo.jpg" alt="OhBear Logo" className="w-7 h-7 rounded-md object-cover" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                OhBear
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange('home')}
                data-testid="nav-home"
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Study</span>
              </Button>
              <Button
                variant={currentPage === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange('stats')}
                data-testid="nav-stats"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Stats</span>
              </Button>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-sm">
                <Badge variant="secondary" className="font-mono">
                  {streak} day streak
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {wordsLearned} learned
                </Badge>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {onThemeToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onThemeToggle}
                  data-testid="button-theme-toggle"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsOpen}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => {
                      onPageChange('home');
                      setIsMobileMenuOpen(false);
                    }}
                    data-testid="mobile-nav-home"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      onPageChange('stats');
                      setIsMobileMenuOpen(false);
                    }}
                    data-testid="mobile-nav-stats"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onThemeToggle && (
                    <DropdownMenuItem onClick={onThemeToggle}>
                      {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onSettingsOpen}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}