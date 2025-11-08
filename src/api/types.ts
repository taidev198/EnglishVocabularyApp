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

// Shadowing types
export interface ShadowingResponse {
  transcribedText: string;
  expectedText: string;
  accuracy: number;
  totalExpected: number;
  totalCorrect: number;
  correctWords: WordMatch[];
  wrongWords: WordMismatch[];
  missingWords: WordPosition[];
  extraWords: WordPosition[];
  wordComparison: WordComparison[];
  feedback: string;
}

export interface WordMatch {
  word: string;
  position: number;
}

export interface WordMismatch {
  expected: string;
  actual: string;
  position: number;
}

export interface WordPosition {
  word: string;
  position: number;
}

export interface WordComparison {
  status: '✓' | '✗' | '−' | '+';
  expectedWord: string | null;
  transcribedWord: string | null;
}

// Phoneme-level feedback types (from forced-alignment API)
export interface PhonemeData {
  start_index: number;
  end_index: number;
  text: string;
  is_target: boolean;
  error_type: string;
  error_type_arpabet: string;
  error_class: string;
  score_type: 'error' | 'warning' | 'normal';
  trans: string;
  trans_arpabet: string;
  nativeness_score: number;
  nativeness_score_user: number;
  start_time: number;
  end_time: number;
  start_index_ipa: number;
  end_index_ipa: number;
  feedback?: Array<{
    id: number;
    audio_link: string;
    text: string;
    language: string;
  }>;
}

export interface WordData {
  word: string;
  word_orig: string;
  start_index: number;
  end_index: number;
  start_time: number;
  end_time: number;
  trans_arpabet: string;
  nativeness_score: number;
  nativeness_score_user: number;
  decoded: boolean;
  syllables: number;
  alternative_transcriptions?: string[];
  has_alternative_transcriptions: boolean;
  alternative_transcription_tags?: string[][];
  has_speech: boolean;
  score_type: 'incorrect' | 'correct' | 'almost_correct';
  word_ipa: string;
  stressed_syllable_index?: number;
  feedback?: Array<{
    start_index: number;
    end_index: number;
    id: number;
    audio_link: string;
    text: string;
    language: string;
  }>;
  start_index_ipa: number;
  is_stress_target: boolean;
}

export interface WordStressMarker {
  start_index: number;
  end_index: number;
  word_score_type: string;
  word_start_index: number;
  word_end_index: number;
  score_type: 'high' | 'normal' | 'low';
  decision: 'correct' | 'incorrect' | 'almost';
  nativeness_score: number;
  nativeness_score_user: number;
}

export interface ForcedAlignmentResponse {
  last_packet_index_processed: number;
  cur_packet_index: number;
  recognized_index: number;
  phonemes: PhonemeData[];
  words: WordData[];
  word_stress_markers: WordStressMarker[];
  stream_finished: boolean;
  stream_restarted: boolean;
  missing_packet: number;
  num_lost_packets: number;
  returned_at: string;
  initial_silence: boolean;
  sentence: string;
  sentence_id: number;
  sentence_ipa: string;
  total_time: number;
  has_speech: boolean;
  sentence_decoded: boolean;
  attempt_type: string;
  feedback: any[];
  scoring_version: number;
  bootstrap_mode: boolean;
  average_native_speaker_percentage: number;
  external_id: string;
  first_language: string;
  module: string;
  lesson: string;
  lesson_id: number;
  exercise: number;
  id: number;
  exercise_type: string;
  stream_score_type: string;
  stream_score_type_user: string;
  nativeness_score_percentage: number;
  nativeness_score_percentage_user: number;
  nativeness_score_percentage_partial: number;
  snr: number;
  recording_quality: string;
  word_stress_score_percentage: number;
  word_stress_score_count: number;
  fluency_metrics: any;
  stream_id: string;
  success: boolean;
}

