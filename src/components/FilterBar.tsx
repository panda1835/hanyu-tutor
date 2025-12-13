'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import { getUniqueLevels, getUniqueCategories } from '@/src/lib/vocabulary'

interface FilterBarProps {
  selectedLevels: string[]
  selectedCategories: string[]
  onLevelsChange: (levels: string[]) => void
  onCategoriesChange: (categories: string[]) => void
  totalCount?: number
  filteredCount?: number
}

export function FilterBar({
  selectedLevels,
  selectedCategories,
  onLevelsChange,
  onCategoriesChange,
  totalCount,
  filteredCount
}: FilterBarProps) {
  const [levels, setLevels] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [levelOpen, setLevelOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  useEffect(() => {
    setLevels(getUniqueLevels())
    setCategories(getUniqueCategories())
  }, [])

  const hasFilters = selectedLevels.length > 0 || selectedCategories.length > 0

  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      onLevelsChange(selectedLevels.filter(l => l !== level))
    } else {
      onLevelsChange([...selectedLevels, level])
    }
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Level Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setLevelOpen(!levelOpen)
              setCategoryOpen(false)
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              selectedLevels.length > 0
                ? 'border-[var(--accent)] bg-accent/10 text-[var(--accent)]'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <span>
              {selectedLevels.length === 0 
                ? 'All Levels' 
                : selectedLevels.length === 1 
                  ? selectedLevels[0]
                  : `${selectedLevels.length} Levels`}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${levelOpen ? 'rotate-180' : ''}`} />
          </button>

          {levelOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLevelOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-48 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => {
                    onLevelsChange([])
                    setLevelOpen(false)
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    selectedLevels.length === 0 ? 'bg-muted font-medium' : ''
                  }`}
                >
                  All Levels
                </button>
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedLevels.includes(level) ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <span>{level}</span>
                    {selectedLevels.includes(level) && (
                      <Check className="h-4 w-4 text-[var(--accent)]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setCategoryOpen(!categoryOpen)
              setLevelOpen(false)
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              selectedCategories.length > 0
                ? 'border-[var(--accent)] bg-accent/10 text-[var(--accent)]'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <span className="max-w-[150px] truncate">
              {selectedCategories.length === 0 
                ? 'All Categories' 
                : selectedCategories.length === 1 
                  ? selectedCategories[0]
                  : `${selectedCategories.length} Categories`}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoryOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCategoryOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-64 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => {
                    onCategoriesChange([])
                    setCategoryOpen(false)
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    selectedCategories.length === 0 ? 'bg-muted font-medium' : ''
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedCategories.includes(category) ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <span className="truncate">{category}</span>
                    {selectedCategories.includes(category) && (
                      <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => {
              onLevelsChange([])
              onCategoriesChange([])
            }}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}

        {/* Count Display */}
        {typeof filteredCount === 'number' && typeof totalCount === 'number' && (
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredCount === totalCount 
              ? `${totalCount} words` 
              : `${filteredCount} of ${totalCount} words`}
          </span>
        )}
      </div>

      {/* Selected Filter Chips */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedLevels.map(level => (
            <span key={level} className="filter-chip">
              {level}
              <button 
                onClick={() => toggleLevel(level)}
                className="filter-chip-remove"
              >
                <X className="h-2 w-2" />
              </button>
            </span>
          ))}
          {selectedCategories.map(category => (
            <span key={category} className="filter-chip">
              {category}
              <button 
                onClick={() => toggleCategory(category)}
                className="filter-chip-remove"
              >
                <X className="h-2 w-2" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
