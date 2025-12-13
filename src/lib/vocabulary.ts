import vocabularyData from './vocabulary.json'

// Vocabulary item interface matching the JSON structure
export interface VocabularyItem {
  character: string
  pinyin: string
  definition: string
  level: string
  category: string
}

// Cast the imported JSON to the correct type
const vocabulary: VocabularyItem[] = vocabularyData as VocabularyItem[]

/**
 * Get all vocabulary items
 */
export function getVocabulary(): VocabularyItem[] {
  return vocabulary
}

/**
 * Get vocabulary items filtered by levels and/or categories (supports multiple selection)
 */
export function getWordsByFilters(
  levels?: string[] | null,
  categories?: string[] | null
): VocabularyItem[] {
  return vocabulary.filter((word) => {
    const matchesLevel = !levels || levels.length === 0 || levels.includes(word.level)
    const matchesCategory = !categories || categories.length === 0 || categories.includes(word.category)
    return matchesLevel && matchesCategory
  })
}

/**
 * Get a specific word by character
 */
export function getWordByCharacter(character: string): VocabularyItem | undefined {
  return vocabulary.find((word) => word.character === character)
}

/**
 * Get all unique levels from vocabulary
 */
export function getUniqueLevels(): string[] {
  const levels = new Set(vocabulary.map((word) => word.level))
  return Array.from(levels).sort()
}

/**
 * Get all unique categories from vocabulary
 */
export function getUniqueCategories(): string[] {
  const categories = new Set(vocabulary.map((word) => word.category))
  return Array.from(categories).sort()
}

/**
 * Get vocabulary count
 */
export function getVocabularyCount(): number {
  return vocabulary.length
}

/**
 * Get random words from vocabulary (for sampling)
 */
export function getRandomWords(count: number): VocabularyItem[] {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
