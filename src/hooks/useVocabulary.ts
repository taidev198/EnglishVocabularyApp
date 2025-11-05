import { useState, useEffect, useCallback } from 'react';
import { wordApi, userVocabularyApi, learningProgressApi, quizApi } from '../api/vocabulary';
import {
  Word,
  UserVocabulary,
  LearningProgress,
  Quiz,
  WordLevel,
  WordCategory,
  LearningStatus,
  ProgressType,
} from '../api/types';
import { toast } from 'sonner';

// Get user ID from localStorage or use default
const getUserId = (): number => {
  const stored = localStorage.getItem('userId');
  if (stored) {
    return parseInt(stored, 10);
  }
  // Generate a default user ID if not set
  const defaultUserId = 1;
  localStorage.setItem('userId', defaultUserId.toString());
  return defaultUserId;
};

export const useVocabulary = () => {
  const [userId] = useState<number>(getUserId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Words
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  // User Vocabulary
  const [userVocabulary, setUserVocabulary] = useState<UserVocabulary[]>([]);
  const [vocabularyStats, setVocabularyStats] = useState<any>(null);

  // Quiz
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<{ wordId: number; isCorrect: boolean }[]>([]);

  // Fetch words
  const fetchWords = useCallback(async (
    level?: WordLevel,
    category?: WordCategory,
    keyword?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (keyword) {
        response = await wordApi.searchWords(keyword);
      } else if (level) {
        response = await wordApi.getWordsByLevel(level);
      } else if (category) {
        response = await wordApi.getWordsByCategory(category);
      } else {
        response = await wordApi.getAllWords();
      }

      if (response.success && response.data) {
        setWords(response.data.content || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch words';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch word by ID
  const fetchWordById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await wordApi.getWordById(id);
      if (response.success && response.data) {
        setCurrentWord(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch word';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user vocabulary
  const fetchUserVocabulary = useCallback(async (status?: LearningStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = status
        ? await userVocabularyApi.getUserVocabularyByStatus(userId, status)
        : await userVocabularyApi.getUserVocabulary(userId);

      if (response.success && response.data) {
        setUserVocabulary(response.data.content || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vocabulary';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add word to vocabulary
  const addWordToVocabulary = useCallback(async (wordId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userVocabularyApi.addWord(userId, wordId);
      if (response.success) {
        toast.success('Word added to vocabulary');
        await fetchUserVocabulary();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add word';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserVocabulary]);

  // Get words due for review
  const fetchWordsDueForReview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userVocabularyApi.getWordsDueForReview(userId);
      if (response.success && response.data) {
        setUserVocabulary(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch words due for review';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update learning status
  const updateLearningStatus = useCallback(async (
    wordId: number,
    status: LearningStatus,
    isCorrect?: boolean
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userVocabularyApi.updateLearningStatus(userId, wordId, status, isCorrect);
      if (response.success) {
        toast.success('Learning status updated');
        await fetchUserVocabulary();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserVocabulary]);

  // Record progress
  const recordProgress = useCallback(async (
    wordId: number,
    progressType: ProgressType,
    isCorrect: boolean,
    timeSpentSeconds?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await learningProgressApi.recordProgress(userId, {
        wordId,
        progressType,
        isCorrect,
        timeSpentSeconds,
      });

      if (response.success) {
        // Update learning status based on correctness
        const newStatus = isCorrect ? LearningStatus.LEARNING : LearningStatus.REVIEWING;
        await updateLearningStatus(wordId, newStatus, isCorrect);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record progress';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, updateLearningStatus]);

  // Generate quiz
  const generateQuiz = useCallback(async (
    wordIds?: number[],
    numberOfQuestions?: number,
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  ) => {
    setLoading(true);
    setError(null);
    setQuizResults([]);
    try {
      const response = await quizApi.generateQuiz(userId, {
        wordIds,
        numberOfQuestions,
        difficulty,
      });

      if (response.success && response.data) {
        setCurrentQuiz(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Submit quiz answer
  const submitQuizAnswer = useCallback(async (
    wordId: number,
    selectedIndex: number,
    correctIndex: number,
    timeSpentSeconds: number
  ) => {
    const isCorrect = selectedIndex === correctIndex;
    setQuizResults(prev => [...prev, { wordId, isCorrect }]);

    // Record progress
    await recordProgress(wordId, ProgressType.QUIZ, isCorrect, timeSpentSeconds);

    return isCorrect;
  }, [recordProgress]);

  // Fetch vocabulary stats
  const fetchVocabularyStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userVocabularyApi.getUserVocabularyStats(userId);
      if (response.success && response.data) {
        setVocabularyStats(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    userId,
    loading,
    error,
    words,
    currentWord,
    userVocabulary,
    vocabularyStats,
    currentQuiz,
    quizResults,
    fetchWords,
    fetchWordById,
    fetchUserVocabulary,
    addWordToVocabulary,
    fetchWordsDueForReview,
    updateLearningStatus,
    recordProgress,
    generateQuiz,
    submitQuizAnswer,
    fetchVocabularyStats,
  };
};

