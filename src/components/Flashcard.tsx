"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import type { VocabularyItem } from "@/src/lib/vocabulary";

export type FlashcardFrontMode = "chinese" | "definition" | "mixed";

interface FlashcardProps {
  word: VocabularyItem;
  mode: "learn" | "review";
  frontMode?: FlashcardFrontMode;
  intervalDays?: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onAnswer: (correct: boolean) => void;
  showActions?: boolean;
}

export function Flashcard({
  word,
  mode,
  frontMode = "chinese",
  intervalDays,
  isBookmarked = false,
  onBookmarkToggle,
  onAnswer,
  showActions = true,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    onAnswer(correct);
    setIsFlipped(false);
  };

  // Determine what to show on front based on mode
  const renderFrontContent = () => {
    switch (frontMode) {
      case "definition":
        return (
          <>
            {/* Definition */}
            <div className="text-center px-4">
              <div className="text-2xl font-medium text-foreground leading-relaxed">
                {word.definition}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-auto mt-6 h-px w-16 bg-border" />
          </>
        );
      case "mixed":
        // Randomly show either Chinese or definition
        const showChinese = Math.random() > 0.5;
        if (showChinese) {
          return (
            <>
              <div className="font-chinese text-7xl font-semibold tracking-tight text-foreground">
                {word.character}
              </div>
              <div className="mx-auto mt-6 h-px w-16 bg-border" />
            </>
          );
        } else {
          return (
            <>
              <div className="text-center px-4">
                <div className="text-2xl font-medium text-foreground leading-relaxed">
                  {word.definition}
                </div>
              </div>
              <div className="mx-auto mt-6 h-px w-16 bg-border" />
            </>
          );
        }
      case "chinese":
      default:
        return (
          <>
            {/* Character */}
            <div className="font-chinese text-7xl font-semibold tracking-tight text-foreground">
              {word.character}
            </div>

            {/* Divider */}
            <div className="mx-auto mt-6 h-px w-16 bg-border" />
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {mode === "review" && intervalDays !== undefined && (
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Interval: {intervalDays} day{intervalDays !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="perspective cursor-pointer" onClick={handleFlip}>
        <div
          className={`relative w-full min-h-[320px] preserve-3d flashcard-flip ${
            isFlipped ? "flipped" : ""
          }`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="flashcard flex flex-col items-center justify-center h-full">
              {/* Bookmark button - top right */}
              {onBookmarkToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmarkToggle();
                  }}
                  className="absolute top-4 right-4 z-10 rounded-lg p-2 transition-colors hover:bg-muted"
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark
                    className={`h-5 w-5 transition-colors ${
                      isBookmarked
                        ? "fill-[var(--accent)] stroke-[var(--accent)]"
                        : "stroke-muted-foreground"
                    }`}
                  />
                </button>
              )}

              {renderFrontContent()}

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

          {/* Back of Card - Now includes pinyin */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="flashcard flex flex-col items-center justify-center h-full">
              {/* Bookmark button - top right */}
              {onBookmarkToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmarkToggle();
                  }}
                  className="absolute top-4 right-4 z-10 rounded-lg p-2 transition-colors hover:bg-muted"
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark
                    className={`h-5 w-5 transition-colors ${
                      isBookmarked
                        ? "fill-[var(--accent)] stroke-[var(--accent)]"
                        : "stroke-muted-foreground"
                    }`}
                  />
                </button>
              )}

              {/* Character */}
              <div className="font-chinese text-5xl font-semibold tracking-tight text-foreground">
                {word.character}
              </div>

              {/* Pinyin - now on back */}
              <div className="mt-2 pinyin text-xl">{word.pinyin}</div>

              {/* Divider */}
              <div className="mx-auto mt-4 h-px w-16 bg-border" />

              {/* Definition */}
              <div className="mt-4 text-center px-4">
                <div className="text-lg font-medium text-foreground leading-relaxed">
                  {word.definition}
                </div>
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
            {mode === "learn" ? "Don't know" : "Incorrect"}
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="btn-primary py-4"
          >
            {mode === "learn" ? "I know this" : "Correct"}
          </button>
        </div>
      )}
    </div>
  );
}

// Simple card display for bookmarks list
interface FlashcardSimpleProps {
  word: VocabularyItem;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onClick?: () => void;
}

export function FlashcardSimple({
  word,
  isBookmarked = false,
  onBookmarkToggle,
  onClick,
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
            <span className="pinyin text-sm">{word.pinyin}</span>
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
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark
              className={`h-5 w-5 transition-colors ${
                isBookmarked
                  ? "fill-[var(--accent)] stroke-[var(--accent)]"
                  : "stroke-muted-foreground"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
