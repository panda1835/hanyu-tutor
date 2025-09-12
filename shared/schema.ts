import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for future authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Vocabulary word data from CSV
export const vocabularyWords = pgTable("vocabulary_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  character: text("character").notNull(),
  level: text("level").notNull(),
  category: text("category").notNull(),
  pinyin: text("pinyin").notNull(),
  definition: text("definition").notNull(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  wordId: varchar("word_id").references(() => vocabularyWords.id),
  status: text("status").notNull(), // 'learning', 'reviewing', 'mastered'
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  reviewCount: integer("review_count").default(0),
  correctCount: integer("correct_count").default(0),
  fibonacciLevel: integer("fibonacci_level").default(0), // 0,1,2,3,4,5,6 for 1,3,4,7,11,18,29 days
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVocabularyWordSchema = createInsertSchema(vocabularyWords).pick({
  character: true,
  level: true,
  category: true,
  pinyin: true,
  definition: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  wordId: true,
  status: true,
  lastReviewed: true,
  nextReview: true,
  reviewCount: true,
  correctCount: true,
  fibonacciLevel: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VocabularyWord = typeof vocabularyWords.$inferSelect;
export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Frontend-only types for local storage and state management
export const studySessionSchema = z.object({
  words: z.array(z.string()), // word IDs
  completedWords: z.array(z.string()),
  currentIndex: z.number(),
  startTime: z.string(),
  mode: z.enum(['learn', 'review']),
});

export const learningStatsSchema = z.object({
  dailyGoal: z.number().default(20),
  reviewLimit: z.number().default(50),
  wordsLearnedToday: z.number().default(0),
  wordsReviewedToday: z.number().default(0),
  currentStreak: z.number().default(0),
  lastStudyDate: z.string().nullable(),
});

export const filterSettingsSchema = z.object({
  selectedLevels: z.array(z.string()).default([]),
  selectedCategories: z.array(z.string()).default([]),
  showOnlyDue: z.boolean().default(false),
});

export type StudySession = z.infer<typeof studySessionSchema>;
export type LearningStats = z.infer<typeof learningStatsSchema>;
export type FilterSettings = z.infer<typeof filterSettingsSchema>;
