import { useState, useEffect } from 'react';
import { BookOpen, Headphones, ChevronRight, Flame, Car, GraduationCap, Mic } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { wordApi } from '../api/vocabulary';
import { Word } from '../api/types';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

interface TodayChunk {
  id: number;
  phrase: string;
  translation: string;
  progress: number;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [todaysChunks, setTodaysChunks] = useState<TodayChunk[]>([]);

  useEffect(() => {
    const fetchTodaysWords = async () => {
      try {
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
        }
      } catch (err) {
        console.error('Error fetching today\'s words:', err);
      }
    };

    fetchTodaysWords();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-800 mb-1">Hi Tài, ready to learn today?</h1>
          <p className="text-gray-500">Let's keep your streak going! 🔥</p>
        </div>

        {/* Streak Progress Ring */}
        <Card 
          className="mb-6 p-6 bg-white/80 backdrop-blur border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => onNavigate('todays-chunks')}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 mb-1">Daily Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-gray-900">7 days</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-500">{todaysChunks.length} chunks learned today</p>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#f97316"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.6)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-900">60%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Grid Layout: Toeic, Ielts, Speaking */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* TOEIC */}
          <Card 
            className="p-6 bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onNavigate('lesson')}
          >
            <div className="flex flex-col items-center text-center text-white">
              <GraduationCap className="w-10 h-10 mb-3" />
              <h3 className="font-semibold text-lg mb-1">TOEIC</h3>
              <p className="text-sm opacity-90">Business English</p>
            </div>
          </Card>

          {/* IELTS */}
          <Card 
            className="p-6 bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onNavigate('lesson')}
          >
            <div className="flex flex-col items-center text-center text-white">
              <BookOpen className="w-10 h-10 mb-3" />
              <h3 className="font-semibold text-lg mb-1">IELTS</h3>
              <p className="text-sm opacity-90">Academic English</p>
            </div>
          </Card>

          {/* Speaking */}
          <Card 
            className="p-6 bg-gradient-to-br from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onNavigate('lesson')}
          >
            <div className="flex flex-col items-center text-center text-white">
              <Mic className="w-10 h-10 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Speaking</h3>
              <p className="text-sm opacity-90">Practice Speaking</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Button
            onClick={() => onNavigate('review')}
            className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 border-0"
          >
            <BookOpen className="w-6 h-6" />
            <span>Review</span>
          </Button>
          <Button
            onClick={() => onNavigate('notebook')}
            className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-br from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 border-0"
          >
            <BookOpen className="w-6 h-6" />
            <span>Notebook</span>
          </Button>
          <Button
            onClick={() => onNavigate('lesson')}
            className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-br from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 border-0"
          >
            <Headphones className="w-6 h-6" />
            <span>Listen</span>
          </Button>
        </div>

        {/* Driving Mode Button */}
        <Button
          onClick={() => onNavigate('listening')}
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Car className="w-5 h-5" />
          <span>Driving Mode - Listen to 200 Chunks</span>
        </Button>
      </div>
    </div>
  );
}
