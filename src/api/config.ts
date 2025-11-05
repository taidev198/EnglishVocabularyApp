// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  vocabulary: {
    words: `${API_BASE_URL}/vocabulary/words`,
    userVocabulary: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/vocabularies`,
    progress: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/progress`,
    quiz: (userId: number) => `${API_BASE_URL}/vocabulary/users/${userId}/quiz`,
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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return handleApiResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

