import { apiRequest, API_CONFIG } from './config';
import {
  Word,
  WordRequest,
  UserVocabulary,
  LearningProgress,
  LearningProgressRequest,
  Quiz,
  QuizRequest,
  ApiResponse,
  PaginatedResponse,
  UserVocabularyStats,
  ProgressStats,
  WordLevel,
  WordCategory,
  LearningStatus,
  ShadowingResponse,
} from './types';

// Word Management API
export const wordApi = {
  // Get all words
  getAllWords: async (
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: 'ASC' | 'DESC' = 'ASC'
  ): Promise<ApiResponse<PaginatedResponse<Word>>> => {
    const url = `${API_CONFIG.vocabulary.words}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    return apiRequest<ApiResponse<PaginatedResponse<Word>>>(url);
  },

  // Get word by ID
  getWordById: async (id: number): Promise<ApiResponse<Word>> => {
    const url = `${API_CONFIG.vocabulary.words}/${id}`;
    return apiRequest<ApiResponse<Word>>(url);
  },

  // Search words
  searchWords: async (
    keyword: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Word>>> => {
    const url = `${API_CONFIG.vocabulary.words}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<Word>>>(url);
  },

  // Get words by level
  getWordsByLevel: async (
    level: WordLevel,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Word>>> => {
    const url = `${API_CONFIG.vocabulary.words}/level/${level}?page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<Word>>>(url);
  },

  // Get words by category
  getWordsByCategory: async (
    category: WordCategory,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Word>>> => {
    const url = `${API_CONFIG.vocabulary.words}/category/${category}?page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<Word>>>(url);
  },

  // Create word
  createWord: async (word: WordRequest): Promise<ApiResponse<Word>> => {
    return apiRequest<ApiResponse<Word>>(API_CONFIG.vocabulary.words, {
      method: 'POST',
      body: JSON.stringify(word),
    });
  },

  // Update word
  updateWord: async (id: number, word: WordRequest): Promise<ApiResponse<Word>> => {
    const url = `${API_CONFIG.vocabulary.words}/${id}`;
    return apiRequest<ApiResponse<Word>>(url, {
      method: 'PUT',
      body: JSON.stringify(word),
    });
  },

  // Delete word
  deleteWord: async (id: number): Promise<ApiResponse<void>> => {
    const url = `${API_CONFIG.vocabulary.words}/${id}`;
    return apiRequest<ApiResponse<void>>(url, {
      method: 'DELETE',
    });
  },
};

// User Vocabulary API
export const userVocabularyApi = {
  // Add word to user vocabulary
  addWord: async (userId: number, wordId: number): Promise<ApiResponse<UserVocabulary>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}/words/${wordId}`;
    return apiRequest<ApiResponse<UserVocabulary>>(url, {
      method: 'POST',
    });
  },

  // Get user vocabulary
  getUserVocabulary: async (
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<UserVocabulary>>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}?page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<UserVocabulary>>>(url);
  },

  // Get user vocabulary by status
  getUserVocabularyByStatus: async (
    userId: number,
    status: LearningStatus,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<UserVocabulary>>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}/status/${status}?page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<UserVocabulary>>>(url);
  },

  // Get words due for review
  getWordsDueForReview: async (userId: number): Promise<ApiResponse<UserVocabulary[]>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}/due-for-review`;
    return apiRequest<ApiResponse<UserVocabulary[]>>(url);
  },

  // Update learning status
  updateLearningStatus: async (
    userId: number,
    wordId: number,
    status: LearningStatus,
    isCorrect?: boolean
  ): Promise<ApiResponse<UserVocabulary>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}/words/${wordId}/status?status=${status}${isCorrect !== undefined ? `&isCorrect=${isCorrect}` : ''}`;
    return apiRequest<ApiResponse<UserVocabulary>>(url, {
      method: 'PUT',
    });
  },

  // Get user vocabulary stats
  getUserVocabularyStats: async (userId: number): Promise<ApiResponse<UserVocabularyStats>> => {
    const url = `${API_CONFIG.vocabulary.userVocabulary(userId)}/stats`;
    return apiRequest<ApiResponse<UserVocabularyStats>>(url);
  },
};

// Learning Progress API
export const learningProgressApi = {
  // Record progress
  recordProgress: async (
    userId: number,
    progress: LearningProgressRequest
  ): Promise<ApiResponse<LearningProgress>> => {
    const url = `${API_CONFIG.vocabulary.progress(userId)}`;
    return apiRequest<ApiResponse<LearningProgress>>(url, {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  },

  // Get user progress
  getUserProgress: async (
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<LearningProgress>>> => {
    const url = `${API_CONFIG.vocabulary.progress(userId)}?page=${page}&size=${size}`;
    return apiRequest<ApiResponse<PaginatedResponse<LearningProgress>>>(url);
  },

  // Get progress stats
  getProgressStats: async (userId: number): Promise<ApiResponse<ProgressStats>> => {
    const url = `${API_CONFIG.vocabulary.progress(userId)}/stats`;
    return apiRequest<ApiResponse<ProgressStats>>(url);
  },
};

// Quiz API
export const quizApi = {
  // Generate quiz
  generateQuiz: async (userId: number, request: QuizRequest): Promise<ApiResponse<Quiz>> => {
    const url = `${API_CONFIG.vocabulary.quiz(userId)}/generate`;
    return apiRequest<ApiResponse<Quiz>>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

// Shadowing API
export const shadowingApi = {
  // Perform shadowing practice
  performShadowing: async (
    audioFile: File,
    expectedText: string,
    language: string = 'en',
    wordTimestamps: boolean = true
  ): Promise<ApiResponse<ShadowingResponse>> => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('expectedText', expectedText);
    
    const url = `${API_CONFIG.vocabulary.shadowing}?language=${language}&wordTimestamps=${wordTimestamps}`;
    
    // Override default headers for multipart/form-data
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Compare texts without audio
  compareTexts: async (
    transcribedText: string,
    expectedText: string
  ): Promise<ApiResponse<ShadowingResponse>> => {
    const url = `${API_CONFIG.vocabulary.shadowing}/compare?transcribedText=${encodeURIComponent(transcribedText)}&expectedText=${encodeURIComponent(expectedText)}`;
    return apiRequest<ApiResponse<ShadowingResponse>>(url, {
      method: 'POST',
    });
  },
};

// Whisper API for audio analysis - calls Python backend directly
export const whisperApi = {
  // Analyze audio for waveform and pitch visualization
  analyzeAudio: async (
    audioFile: File
  ): Promise<{ waveform: number[]; pitch: number[] }> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    const url = API_CONFIG.whisper.analyzeAudio;
    
    console.log('Calling Whisper API for audio analysis:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout for audio analysis
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type, let browser set it with boundary for multipart/form-data
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Whisper API response received:', { 
        waveformLength: result.waveform?.length || 0,
        pitchLength: result.pitch?.length || 0 
      });
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Audio analysis request timeout. The audio file may be too large.');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Whisper API at ${url}. Please ensure the Whisper API server is running.`);
      }
      throw error;
    }
  },

  // Perform forced alignment analysis for phoneme-level feedback
  forcedAlignment: async (
    audioFile: File,
    referenceText: string,
    modelName: string = 'base.en'
  ): Promise<import('./types').ForcedAlignmentResponse> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('reference_text', referenceText);
    formData.append('model_name', modelName);
    
    const url = API_CONFIG.whisper.forcedAlignment;
    
    console.log('Calling Whisper API for forced alignment:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout for forced alignment
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type, let browser set it with boundary for multipart/form-data
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Forced alignment response received:', { 
        phonemeCount: result?.phonemes?.length || 0,
        wordCount: result?.words?.length || 0,
        success: result?.success
      });
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Forced alignment request timeout. The audio file may be too large.');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Whisper API at ${url}. Please ensure the Whisper API server is running.`);
      }
      throw error;
    }
  },
};

// Phoneme Backend API - FastAPI backend for phoneme analysis
export const phonemeApi = {
  // Upload audio file
  uploadAudio: async (audioFile: File): Promise<{ status: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    const url = API_CONFIG.phoneme.upload;
    
    console.log('Calling Phoneme API for upload:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Phoneme API upload response:', result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload request timeout');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Phoneme API at ${url}. Please ensure the Phoneme API server is running.`);
      }
      throw error;
    }
  },

  // Score DTW (compare two audio files)
  scoreDtw: async (userPath: string, nativePath: string): Promise<{ distance: number; score: number }> => {
    const formData = new FormData();
    formData.append('user_path', userPath);
    formData.append('native_path', nativePath);
    
    const url = API_CONFIG.phoneme.scoreDtw;
    
    console.log('Calling Phoneme API for DTW scoring:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Phoneme API DTW score response:', result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('DTW scoring request timeout');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Phoneme API at ${url}. Please ensure the Phoneme API server is running.`);
      }
      throw error;
    }
  },

  // Generate heatmap
  generateHeatmap: async (audioPath: string, textgridPath?: string): Promise<{ heatmap: string; intervals: any[]; scores: number[] }> => {
    const formData = new FormData();
    formData.append('audio_path', audioPath);
    if (textgridPath) {
      formData.append('textgrid_path', textgridPath);
    }
    
    const url = API_CONFIG.phoneme.heatmap;
    
    console.log('Calling Phoneme API for heatmap:', url, { audioPath, textgridPath });
    
    const controller = new AbortController();
    // Increase timeout to 60 seconds for heatmap generation (audio processing can be slow)
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || response.statusText };
        }
        console.error('Phoneme API heatmap error:', error);
        throw new Error(error.detail || error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Phoneme API heatmap response:', result);
      
      // Check if the response contains an error
      if (result.error) {
        throw new Error(result.error + (result.detail ? `: ${result.detail}` : ''));
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Heatmap generation request timeout (60s). The audio file may be too large or processing is taking too long.');
      }
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Failed to connect to Phoneme API at ${url}. Please ensure the Phoneme API server is running on port 8001.`);
      }
      throw error;
    }
  },

  // Align audio with transcript
  align: async (audioPath: string, transcriptText?: string): Promise<{ method: string; intervals?: any[]; textgrid?: string; error?: string }> => {
    const formData = new FormData();
    formData.append('audio_path', audioPath);
    if (transcriptText) {
      formData.append('transcript_text', transcriptText);
    }
    
    const url = API_CONFIG.phoneme.align;
    
    console.log('Calling Phoneme API for alignment:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Phoneme API alignment response:', result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Alignment request timeout');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Phoneme API at ${url}. Please ensure the Phoneme API server is running.`);
      }
      throw error;
    }
  },

  // Analyze sentence - full pipeline
  analyzeSentence: async (
    audioFile: File,
    sentence: string
  ): Promise<{
    sentence: string;
    ipa: string;
    overall_score: number;
    words: Array<{
      word: string;
      start: number;
      end: number;
      score: number;
      color: 'green' | 'red';
      phonemes?: any[];
    }>;
    per_phoneme?: any[];
    heatmap?: string;
    error?: string;
  }> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('sentence', sentence);
    
    const url = API_CONFIG.phoneme.analyzeSentence;
    
    console.log('Calling Phoneme API for sentence analysis:', url);
    
    const controller = new AbortController();
    // Increase timeout to 120 seconds for full pipeline (MFA + processing can be slow)
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || response.statusText };
        }
        console.error('Phoneme API analyze sentence error:', error);
        throw new Error(error.detail || error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Phoneme API analyze sentence response:', result);
      
      // Check if the response contains an error
      if (result.error) {
        throw new Error(result.error + (result.detail ? `: ${result.detail}` : ''));
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Sentence analysis request timeout (120s). The processing may be taking too long.');
      }
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error(`Failed to connect to Phoneme API at ${url}. Please ensure the Phoneme API server is running on port 8001.`);
      }
      throw error;
    }
  },
};

