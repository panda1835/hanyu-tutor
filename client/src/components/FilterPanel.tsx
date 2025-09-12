import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";

interface FilterSettings {
  selectedLevels: string[];
  selectedCategories: string[];
  showOnlyDue: boolean;
}

interface FilterPanelProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
  availableLevels: string[];
  availableCategories: string[];
  className?: string;
}

export default function FilterPanel({
  settings,
  onSettingsChange,
  availableLevels,
  availableCategories,
  className = ""
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLevel = (level: string) => {
    const newLevels = settings.selectedLevels.includes(level)
      ? settings.selectedLevels.filter(l => l !== level)
      : [...settings.selectedLevels, level];
    
    onSettingsChange({ ...settings, selectedLevels: newLevels });
  };

  const toggleCategory = (category: string) => {
    const newCategories = settings.selectedCategories.includes(category)
      ? settings.selectedCategories.filter(c => c !== category)
      : [...settings.selectedCategories, category];
    
    onSettingsChange({ ...settings, selectedCategories: newCategories });
  };

  const clearAllFilters = () => {
    onSettingsChange({
      selectedLevels: [],
      selectedCategories: [],
      showOnlyDue: false
    });
  };

  const hasActiveFilters = settings.selectedLevels.length > 0 || 
                          settings.selectedCategories.length > 0 || 
                          settings.showOnlyDue;

  return (
    <div className={className} data-testid="filter-panel">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            data-testid="button-toggle-filters"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {settings.selectedLevels.length + settings.selectedCategories.length + (settings.showOnlyDue ? 1 : 0)}
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 p-4 space-y-4">
            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {settings.selectedLevels.map(level => (
                    <Badge 
                      key={level} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover-elevate"
                      onClick={() => toggleLevel(level)}
                      data-testid={`badge-level-${level}`}
                    >
                      {level} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {settings.selectedCategories.map(category => (
                    <Badge 
                      key={category} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover-elevate"
                      onClick={() => toggleCategory(category)}
                      data-testid={`badge-category-${category}`}
                    >
                      {category} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                  {settings.showOnlyDue && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover-elevate"
                      onClick={() => onSettingsChange({ ...settings, showOnlyDue: false })}
                      data-testid="badge-due-only"
                    >
                      Due Only <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  data-testid="button-clear-filters"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Level Filters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Level</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableLevels.map(level => (
                  <label 
                    key={level} 
                    className="flex items-center space-x-2 cursor-pointer hover-elevate p-2 rounded"
                    data-testid={`checkbox-level-${level}`}
                  >
                    <Checkbox
                      checked={settings.selectedLevels.includes(level)}
                      onCheckedChange={() => toggleLevel(level)}
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Category</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableCategories.map(category => (
                  <label 
                    key={category} 
                    className="flex items-center space-x-2 cursor-pointer hover-elevate p-2 rounded"
                    data-testid={`checkbox-category-${category}`}
                  >
                    <Checkbox
                      checked={settings.selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Due Only Toggle */}
            <div className="border-t pt-4">
              <label className="flex items-center space-x-2 cursor-pointer hover-elevate p-2 rounded">
                <Checkbox
                  checked={settings.showOnlyDue}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ ...settings, showOnlyDue: Boolean(checked) })
                  }
                  data-testid="checkbox-due-only"
                />
                <span className="text-sm">Show only words due for review</span>
              </label>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}