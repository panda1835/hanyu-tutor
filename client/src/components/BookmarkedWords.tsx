import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkX, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { vocabularyService } from "../lib/vocabularyService";
import type { VocabularyWord } from "../types/schema";

interface BookmarkedWordsProps {
  onStartStudy?: (words: VocabularyWord[]) => void;
}

export default function BookmarkedWords({ onStartStudy }: BookmarkedWordsProps) {
  const [bookmarkedWords, setBookmarkedWords] = useState<VocabularyWord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    loadBookmarkedWords();
  }, []);

  useEffect(() => {
    // Filter words based on search term
    if (searchTerm.trim() === "") {
      setFilteredWords(bookmarkedWords);
    } else {
      const filtered = bookmarkedWords.filter(word =>
        word.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [bookmarkedWords, searchTerm]);

  const loadBookmarkedWords = () => {
    const words = vocabularyService.getBookmarkedWords();
    setBookmarkedWords(words);
  };

  const handleUnbookmark = (wordId: string) => {
    vocabularyService.toggleBookmark(wordId);
    loadBookmarkedWords(); // Refresh the list
    // Trigger a small delay to ensure the change is visible
    setTimeout(() => {
      // This ensures any parent components can also refresh if needed
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleStudyBookmarked = () => {
    if (onStartStudy && filteredWords.length > 0) {
      onStartStudy(filteredWords);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Bookmark className="h-8 w-8 fill-yellow-500 text-yellow-500" />
            <span>Bookmarked Words</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {bookmarkedWords.length} word{bookmarkedWords.length !== 1 ? 's' : ''} bookmarked
          </p>
        </div>
        
        {filteredWords.length > 0 && (
          <Button onClick={handleStudyBookmarked} className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4" />
            <span>Study Bookmarked ({filteredWords.length})</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookmarked words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        
      </div>

      {bookmarkedWords.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Bookmarked Words</h2>
          <p className="text-muted-foreground mb-4">
            Start bookmarking words during your study sessions to see them here.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the bookmark icon on any vocabulary card to save it for later review.
          </p>
        </Card>
      ) : filteredWords.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground">
            No bookmarked words match your search "{searchTerm}".
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => (
            <Card key={word.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl font-medium font-sans-sc text-foreground">
                  {word.character}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnbookmark(word.id!)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Remove bookmark"
                >
                  <BookmarkX className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground font-mono">
                  {word.pinyin}
                </div>
                
                <div className="text-sm text-foreground leading-relaxed">
                  {word.definition}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {word.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {word.category}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
