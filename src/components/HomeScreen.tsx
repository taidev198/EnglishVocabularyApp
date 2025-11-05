import { Play, BookOpen, Headphones, ChevronRight, Flame, Car } from 'lucide-react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const todaysChunks = [
  { id: 1, phrase: "get along with", translation: "có quan hệ tốt với", progress: 60 },
  { id: 2, phrase: "look forward to", translation: "mong chờ, mong đợi", progress: 40 },
  { id: 3, phrase: "come up with", translation: "nghĩ ra, đưa ra (ý tưởng)", progress: 80 },
  { id: 4, phrase: "put off", translation: "hoãn lại", progress: 20 },
];

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-800 mb-1">Hi Tài, ready to learn today?</h1>
          <p className="text-gray-500">Let's keep your streak going! 🔥</p>
        </div>

        {/* Streak Progress Ring */}
        <Card className="mb-6 p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 mb-1">Daily Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-gray-900">7 days</span>
              </div>
              <p className="text-gray-500 mt-2">12 chunks learned today</p>
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

        {/* Today's Chunks */}
        <div className="mb-6">
          <h2 className="text-gray-800 mb-4">Today's Chunks</h2>
          <div className="space-y-3">
            {todaysChunks.map((chunk) => (
              <Card
                key={chunk.id}
                className="p-4 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('lesson')}
              >
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{chunk.phrase}</p>
                    <p className="text-gray-500">{chunk.translation}</p>
                    <Progress value={chunk.progress} className="h-1.5 mt-2" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Button
            onClick={() => onNavigate('quiz')}
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
