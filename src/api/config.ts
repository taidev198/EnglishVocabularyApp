// Helper function to detect if running on mobile (Capacitor)
const isMobile = () => {
  return typeof window !== 'undefined' && 
         (window as any).Capacitor !== undefined;
};

// Helper function to get the correct base URL for mobile
const getBaseURL = (defaultUrl: string, envVar: string | undefined): string => {
  // If environment variable is set, use it
  if (envVar) {
    return envVar;
  }
  
  // If running on mobile, use the default (will need to be configured)
  if (isMobile()) {
    // For Android emulator, use 10.0.2.2 to access host machine
    // For iOS simulator, use localhost (works on simulator)
    // For physical devices, use your computer's local IP (e.g., 192.168.1.100)
    // You should set VITE_API_BASE_URL and VITE_WHISPER_API_URL in your .env file
    return defaultUrl;
  }
  
  // For web, use localhost
  return defaultUrl;
};

// API Configuration - Use API Gateway for microservices architecture
// For mobile: Set VITE_API_BASE_URL to your computer's IP (e.g., http://192.168.1.100:8091/api)
// For Android emulator: Use http://10.0.2.2:8091/api
// For iOS simulator: Use http://localhost:8091/api (works on simulator)
const API_BASE_URL = getBaseURL(
  'http://localhost:8091/api',
  import.meta.env.VITE_API_BASE_URL
);

// Whisper API URL - Python backend
// For mobile: Set VITE_WHISPER_API_URL to your computer's IP (e.g., http://192.168.1.100:8000)
// For Android emulator: Use http://10.0.2.2:8000
// For iOS simulator: Use http://localhost:8000 (works on simulator)
const WHISPER_API_URL = getBaseURL(
  'http://localhost:8000',
  import.meta.env.VITE_WHISPER_API_URL
);

// Phoneme Backend URL - Python FastAPI backend
// For mobile: Set VITE_PHONEME_API_URL to your computer's IP (e.g., http://192.168.1.100:8000)
// For Android emulator: Use http://10.0.2.2:8000
// For iOS simulator: Use http://localhost:8000 (works on simulator)
const PHONEME_API_URL = getBaseURL(
  'http://localhost:8001',
  import.meta.env.VITE_PHONEME_API_URL
);

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  vocabulary: {
    words: `${API_BASE_URL}/vocabulary/words`,
    userVocabulary: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/vocabularies`,
    progress: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/progress`,
    quiz: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/quiz`,
    shadowing: `${API_BASE_URL}/vocabulary/shadowing`,
  },
  whisper: {
    analyzeAudio: `${WHISPER_API_URL}/api/analyze-audio`,
    forcedAlignment: `${WHISPER_API_URL}/api/forced-alignment`,
  },
  phoneme: {
    upload: `${PHONEME_API_URL}/upload/`,
    scoreDtw: `${PHONEME_API_URL}/score_dtw/`,
    heatmap: `${PHONEME_API_URL}/heatmap/`,
    align: `${PHONEME_API_URL}/align/`,
    analyzeSentence: `${PHONEME_API_URL}/analyze_sentence/`,
  },
  timeout: 10000, // 10 seconds
};

// Default headers
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Helper function to make API requests
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    console.log('Making API request to:', url);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
      signal: controller.signal,
    });

    console.log('Response status:', response.status, response.statusText);
    
    clearTimeout(timeoutId);
    return handleApiResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API request failed:', {
      url,
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    });
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error(`Failed to fetch from ${url}. Check if API Gateway is running on port 8091 and CORS is configured.`);
    }
    throw error;
  }
}

