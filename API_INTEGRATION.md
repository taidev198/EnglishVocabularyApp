# API Integration Guide

This document explains how the frontend integrates with the vocabulary service backend.

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8091/api
```

The default API base URL is `http://localhost:8091/api` (API Gateway).

## API Structure

### API Services

Located in `src/api/`:

- **`config.ts`**: API configuration and helper functions
- **`types.ts`**: TypeScript types and interfaces
- **`vocabulary.ts`**: Vocabulary API service functions

### React Hook

Located in `src/hooks/useVocabulary.ts`:

- **`useVocabulary()`**: Custom hook for vocabulary operations
  - Provides all vocabulary-related functions
  - Manages loading states and errors
  - Handles API calls with error handling

## Usage Examples

### Using the Hook in Components

```typescript
import { useVocabulary } from '../hooks/useVocabulary';

function MyComponent() {
  const {
    words,
    loading,
    error,
    fetchWords,
    generateQuiz,
    addWordToVocabulary,
  } = useVocabulary();

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Use the data and functions
}
```

### Available Functions

#### Word Management
- `fetchWords(level?, category?, keyword?)` - Fetch words
- `fetchWordById(id)` - Get word by ID
- `addWordToVocabulary(wordId)` - Add word to user vocabulary

#### User Vocabulary
- `fetchUserVocabulary(status?)` - Get user vocabulary
- `fetchWordsDueForReview()` - Get words due for review
- `updateLearningStatus(wordId, status, isCorrect?)` - Update learning status

#### Quiz
- `generateQuiz(wordIds?, numberOfQuestions?, difficulty?)` - Generate quiz
- `submitQuizAnswer(wordId, selectedIndex, correctIndex, timeSpent)` - Submit answer

#### Progress
- `recordProgress(wordId, progressType, isCorrect, timeSpent?)` - Record progress
- `fetchVocabularyStats()` - Get vocabulary statistics

## Components Updated

### QuizScreen
- Now uses `generateQuiz()` to fetch quiz from backend
- Submits answers using `submitQuizAnswer()`
- Records progress automatically

### ProgressScreen
- Displays real statistics from backend
- Shows vocabulary breakdown by status
- Fetches data using `fetchVocabularyStats()`

## API Endpoints

All endpoints are accessed through the API Gateway at `http://localhost:8091/api/vocabulary/...`

### Word Endpoints
- `GET /vocabulary/words` - Get all words
- `GET /vocabulary/words/{id}` - Get word by ID
- `GET /vocabulary/words/search?keyword=...` - Search words
- `GET /vocabulary/words/level/{level}` - Get words by level
- `GET /vocabulary/words/category/{category}` - Get words by category

### User Vocabulary Endpoints
- `POST /vocabulary/users/{userId}/vocabularies/words/{wordId}` - Add word
- `GET /vocabulary/users/{userId}/vocabularies` - Get user vocabulary
- `GET /vocabulary/users/{userId}/vocabularies/due-for-review` - Get words due for review
- `PUT /vocabulary/users/{userId}/vocabularies/words/{wordId}/status` - Update status
- `GET /vocabulary/users/{userId}/vocabularies/stats` - Get stats

### Quiz Endpoints
- `POST /vocabulary/users/{userId}/quiz/generate` - Generate quiz

### Progress Endpoints
- `POST /vocabulary/users/{userId}/progress` - Record progress
- `GET /vocabulary/users/{userId}/progress/stats` - Get progress stats

## User ID Management

The app uses a default user ID stored in localStorage. To change it:

```typescript
localStorage.setItem('userId', '2');
```

## Error Handling

All API calls include error handling:
- Network errors are caught and displayed
- Toast notifications show success/error messages
- Loading states prevent duplicate requests

## Testing

1. Start the backend services:
   ```bash
   cd joblink-microservices
   docker-compose up -d
   ```

2. Start the frontend:
   ```bash
   cd English_Project
   npm run dev
   ```

3. The frontend will connect to the API Gateway at `http://localhost:8091`

## Next Steps

To add more API integrations:

1. Add new functions to `src/api/vocabulary.ts`
2. Add corresponding hooks to `src/hooks/useVocabulary.ts`
3. Use the hook in your components
4. Update types in `src/api/types.ts` if needed

