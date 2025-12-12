'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { getUniqueLevels, getUniqueCategories } from '@/src/lib/vocabulary'

interface FilterBarProps {
  selectedLevel: string | null
  selectedCategory: string | null
  onLevelChange: (level: string | null) => void
  onCategoryChange: (category: string | null) => void
  totalCount?: number
  filteredCount?: number
}

export function FilterBar({
  selectedLevel,
  selectedCategory,
  onLevelChange,
  onCategoryChange,
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

  const hasFilters = selectedLevel || selectedCategory

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
              selectedLevel
                ? 'border-[var(--accent)] bg-accent/10 text-[var(--accent)]'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <span>{selectedLevel || 'All Levels'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${levelOpen ? 'rotate-180' : ''}`} />
          </button>

          {levelOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLevelOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-48 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => {
                    onLevelChange(null)
                    setLevelOpen(false)
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    !selectedLevel ? 'bg-muted font-medium' : ''
                  }`}
                >
                  All Levels
                </button>
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      onLevelChange(level)
                      setLevelOpen(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedLevel === level ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    {level}
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
              selectedCategory
                ? 'border-[var(--accent)] bg-accent/10 text-[var(--accent)]'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <span className="max-w-[150px] truncate">{selectedCategory || 'All Categories'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoryOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCategoryOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-64 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => {
                    onCategoryChange(null)
                    setCategoryOpen(false)
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    !selectedCategory ? 'bg-muted font-medium' : ''
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category)
                      setCategoryOpen(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedCategory === category ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    {category}
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
              onLevelChange(null)
              onCategoryChange(null)
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
    </div>
  )
}
