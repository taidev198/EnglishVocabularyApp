import { useState, useEffect } from 'react';
import { Play, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { wordApi } from '../api/vocabulary';
import { Word } from '../api/types';

interface TodaysChunksScreenProps {
  onNavigate: (screen: string) => void;
}

interface TodayChunk {
  id: number;
  phrase: string;
  translation: string;
  progress: number;
}

export function TodaysChunksScreen({ onNavigate }: TodaysChunksScreenProps) {
  const [todaysChunks, setTodaysChunks] = useState<TodayChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodaysWords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent words (sorted by creation date descending to get newest first)
        // Get first page with 20 words to show today's chunks
        const response = await wordApi.getAllWords(0, 20, 'createdAt', 'DESC');
        
        if (response.success && response.data) {
          const words = response.data.content || [];
          
          // Filter words created today (within last 24 hours)
          const now = new Date();
          const todayWords = words.filter((word: Word) => {
            if (!word.createdAt) return false;
            const createdDate = new Date(word.createdAt);
            const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff <= 24; // Show words from last 24 hours
          });
          
          // Transform words to chunks format
          // If no words from today, show the most recent words anyway
          const wordsToShow = todayWords.length > 0 ? todayWords : words.slice(0, 10);
          
          const chunks: TodayChunk[] = wordsToShow.map((word: Word) => ({
            id: word.id,
            phrase: word.englishWord,
            translation: word.translation || word.meaning || '',
            progress: Math.floor(Math.random() * 100), // Placeholder - could be calculated from user progress
          }));
          
          setTodaysChunks(chunks);
        } else {
          setError('Failed to load words');
        }
      } catch (err) {
        console.error('Error fetching today\'s words:', err);
        setError(err instanceof Error ? err.message : 'Failed to load words');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysWords();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Today's Chunks</h1>
            <p className="text-sm text-gray-500">{todaysChunks.length} chunks to learn</p>
          </div>
        </div>

        {/* Chunks List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600">Loading words...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : todaysChunks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No words found. Check back later!</p>
            <Button onClick={() => onNavigate('home')} variant="outline">
              Go Back
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysChunks.map((chunk) => (
              <Card
                key={chunk.id}
                className="p-4 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Store selected word ID in localStorage for LessonScreen to fetch
                  localStorage.setItem('selectedWordId', chunk.id.toString());
                  onNavigate('lesson');
                }}
              >
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate font-medium">{chunk.phrase}</p>
                    <p className="text-gray-500 truncate text-sm">{chunk.translation}</p>
                    <Progress value={chunk.progress} className="h-1.5 mt-2" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

