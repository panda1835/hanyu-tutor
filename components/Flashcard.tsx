'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import type { VocabularyItem } from '@/lib/vocabulary'

interface FlashcardProps {
  word: VocabularyItem
  mode: 'learn' | 'review'
  intervalDays?: number
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
  onAnswer: (correct: boolean) => void
  showActions?: boolean
}

export function Flashcard({
  word,
  mode,
  intervalDays,
  isBookmarked = false,
  onBookmarkToggle,
  onAnswer,
  showActions = true
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (correct: boolean) => {
    onAnswer(correct)
    setIsFlipped(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {mode === 'learn' ? 'Learn • New word' : 'Review • Due today'}
          </span>
          {mode === 'review' && intervalDays !== undefined && (
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Interval: {intervalDays} day{intervalDays !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBookmarkToggle()
            }}
            className={`rounded-xl p-2 transition-colors ${
              isBookmarked 
                ? 'text-[var(--accent)] hover:bg-accent/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Flashcard Container */}
      <div 
        className="perspective cursor-pointer"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full min-h-[320px] preserve-3d flashcard-flip ${isFlipped ? 'flipped' : ''}`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="flashcard flex flex-col items-center justify-center h-full">
              {/* Bookmark corner indicator */}
              <div className={`absolute top-0 right-0 ${isBookmarked ? 'bookmark-corner bookmarked' : ''}`} />
              
              {/* Character */}
              <div className="font-chinese text-7xl font-semibold tracking-tight text-foreground">
                {word.character}
              </div>
              
              {/* Pinyin */}
              <div className="mt-3 pinyin text-xl">
                {word.pinyin}
              </div>
              
              {/* Divider */}
              <div className="mx-auto mt-6 h-px w-16 bg-border" />
              
              {/* Hint */}
              <div className="mt-4 text-sm text-muted-foreground">
                Tap to reveal definition
              </div>
              
              {/* Level & Category */}
              <div className="mt-4 flex gap-2">
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {word.level}
                </span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground max-w-[150px] truncate">
                  {word.category}
                </span>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="flashcard flex flex-col items-center justify-center h-full">
              {/* Bookmark corner indicator */}
              <div className={`absolute top-0 right-0 ${isBookmarked ? 'bookmark-corner bookmarked' : ''}`} />
              
              {/* Character (smaller) */}
              <div className="font-chinese text-4xl font-semibold tracking-tight text-foreground">
                {word.character}
              </div>
              
              {/* Pinyin */}
              <div className="mt-2 pinyin text-lg">
                {word.pinyin}
              </div>
              
              {/* Divider */}
              <div className="mx-auto mt-4 h-px w-16 bg-border" />
              
              {/* Definition */}
              <div className="mt-4 text-center px-4">
                <div className="text-lg font-medium text-foreground leading-relaxed">
                  {word.definition}
                </div>
              </div>
              
              {/* Tap hint */}
              <div className="mt-4 text-xs text-muted-foreground">
                Tap to flip back
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer(false)}
            className="btn-secondary py-4"
          >
            {mode === 'learn' ? "Don't know" : 'Incorrect'}
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="btn-primary py-4"
          >
            {mode === 'learn' ? 'I know this' : 'Correct'}
          </button>
        </div>
      )}
    </div>
  )
}

// Simple card display for bookmarks list
interface FlashcardSimpleProps {
  word: VocabularyItem
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
  onClick?: () => void
}

export function FlashcardSimple({
  word,
  isBookmarked = false,
  onBookmarkToggle,
  onClick
}: FlashcardSimpleProps) {
  return (
    <div 
      className="paper-card p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="font-chinese text-2xl font-semibold">
              {word.character}
            </span>
            <span className="pinyin text-sm">
              {word.pinyin}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {word.definition}
          </div>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {word.level}
            </span>
          </div>
        </div>
        
        {onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBookmarkToggle()
            }}
            className={`shrink-0 rounded-xl p-2 transition-colors ${
              isBookmarked 
                ? 'text-[var(--accent)] hover:bg-accent/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
