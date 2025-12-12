'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Flashcard, FlashcardSimple } from '@/components/Flashcard'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { getWordByCharacter, type VocabularyItem } from '@/lib/vocabulary'
import { Bookmark, Loader2, BookX, X } from 'lucide-react'

interface BookmarkedWord {
  id: string
  word_character: string
  vocabulary: VocabularyItem
}

export default function BookmarksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  // State
  const [bookmarks, setBookmarks] = useState<BookmarkedWord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState<BookmarkedWord | null>(null)

  // Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (bookmarkData) {
        const bookmarkedWords: BookmarkedWord[] = []
        for (const bookmark of bookmarkData) {
          const vocabulary = getWordByCharacter(bookmark.word_character)
          if (vocabulary) {
            bookmarkedWords.push({
              id: bookmark.id,
              word_character: bookmark.word_character,
              vocabulary
            })
          }
        }
        setBookmarks(bookmarkedWords)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user, loadBookmarks])

  // Remove bookmark
  const removeBookmark = async (wordCharacter: string) => {
    if (!user) return

    try {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('word_character', wordCharacter)

      setBookmarks(prev => prev.filter(b => b.word_character !== wordCharacter))
      
      if (selectedWord?.word_character === wordCharacter) {
        setSelectedWord(null)
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <Bookmark className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Bookmarks</h1>
              <p className="text-sm text-muted-foreground">
                Your saved words for quick reference
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="paper-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <BookX className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold">No bookmarks yet</h2>
            <p className="mt-2 text-muted-foreground">
              Bookmark words while learning or reviewing to save them here.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/learn')}
                className="btn-primary"
              >
                Start Learning
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {bookmarks.length} bookmarked word{bookmarks.length !== 1 ? 's' : ''}
            </div>

            {/* Selected Word Modal */}
            {selectedWord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="relative w-full max-w-md animate-slide-up">
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Flashcard
                    word={selectedWord.vocabulary}
                    mode="learn"
                    isBookmarked={true}
                    onBookmarkToggle={() => removeBookmark(selectedWord.word_character)}
                    onAnswer={() => setSelectedWord(null)}
                    showActions={false}
                  />
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setSelectedWord(null)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {bookmarks.map((bookmark) => (
                <FlashcardSimple
                  key={bookmark.id}
                  word={bookmark.vocabulary}
                  isBookmarked={true}
                  onBookmarkToggle={() => removeBookmark(bookmark.word_character)}
                  onClick={() => setSelectedWord(bookmark)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
