// Vocabulary API Types

export enum WordLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum WordCategory {
  DAILY_LIFE = 'DAILY_LIFE',
  BUSINESS = 'BUSINESS',
  ACADEMIC = 'ACADEMIC',
  TECHNOLOGY = 'TECHNOLOGY',
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export enum LearningStatus {
  NOT_STARTED = 'NOT_STARTED',
  LEARNING = 'LEARNING',
  REVIEWING = 'REVIEWING',
  MASTERED = 'MASTERED',
}

export enum ProgressType {
  QUIZ = 'QUIZ',
  FLASHCARD = 'FLASHCARD',
  WRITING = 'WRITING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

// Word types
export interface Word {
  id: number;
  englishWord: string;
  meaning: string;
  pronunciation?: string;
  exampleSentence?: string;
  translation?: string;
  level: WordLevel;
  category: WordCategory;
  partOfSpeech?: string;
  synonyms?: string;
  antonyms?: string;
  imageUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordRequest {
  englishWord: string;
  meaning: string;
  pronunciation?: string;
  exampleSentence?: string;
  translation?: string;
  level: WordLevel;
  category: WordCategory;
  partOfSpeech?: string;
  synonyms?: string;
  antonyms?: string;
  imageUrl?: string;
  audioUrl?: string;
}

// User Vocabulary types
export interface UserVocabulary {
  id: number;
  userId: number;
  word: Word;
  status: LearningStatus;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  masteryScore: number;
  createdAt: string;
  updatedAt: string;
}

// Learning Progress types
export interface LearningProgress {
  id: number;
  userId: number;
  word: Word;
  progressType: ProgressType;
  isCorrect: boolean;
  timeSpentSeconds?: number;
  notes?: string;
  createdAt: string;
}

export interface LearningProgressRequest {
  wordId: number;
  progressType: ProgressType;
  isCorrect: boolean;
  timeSpentSeconds?: number;
  notes?: string;
}

// Quiz types
export interface QuizQuestion {
  wordId: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  word: Word;
}

export interface Quiz {
  quizId: number;
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface QuizRequest {
  wordIds?: number[];
  numberOfQuestions?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Statistics types
export interface UserVocabularyStats {
  totalWords: number;
  notStarted: number;
  learning: number;
  reviewing: number;
  mastered: number;
}

export interface ProgressStats {
  totalProgress: number;
  correctAnswers: number;
  accuracyRate: number;
}

