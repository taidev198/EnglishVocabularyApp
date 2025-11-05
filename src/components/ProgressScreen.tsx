import { ArrowLeft, TrendingUp, Flame, Clock, Target } from 'lucide-react';
import { Card } from './ui/card';

interface ProgressScreenProps {
  onNavigate: (screen: string) => void;
}

const weeklyData = [
  { day: 'Mon', chunks: 12, height: 60 },
  { day: 'Tue', chunks: 8, height: 40 },
  { day: 'Wed', chunks: 15, height: 75 },
  { day: 'Thu', chunks: 20, height: 100 },
  { day: 'Fri', chunks: 10, height: 50 },
  { day: 'Sat', chunks: 18, height: 90 },
  { day: 'Sun', chunks: 16, height: 80 },
];

export function ProgressScreen({ onNavigate }: ProgressScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 pb-20">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-gray-800">Your Progress</h2>
          <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500">Streak</p>
                <p className="text-gray-900">7 days</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500">Total Chunks</p>
                <p className="text-gray-900">127</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500">Listening Time</p>
                <p className="text-gray-900">12.5 hrs</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500">Accuracy</p>
                <p className="text-gray-900">89%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
          <h3 className="text-gray-800 mb-4">This Week</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex flex-col items-center flex-1">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg relative group cursor-pointer transition-all hover:opacity-80"
                    style={{ height: `${data.height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {data.chunks} chunks
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{data.day}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-gray-800 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            <Card className="p-5 bg-gradient-to-r from-yellow-400 to-orange-400 border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div className="flex-1">
                  <h4 className="text-white">Week Warrior</h4>
                  <p className="text-white/90">7 day streak achieved!</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-r from-purple-400 to-pink-400 border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div className="flex-1">
                  <h4 className="text-white">Century Club</h4>
                  <p className="text-white/90">100+ chunks learned</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-r from-blue-400 to-cyan-400 border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl">
                  🎧
                </div>
                <div className="flex-1">
                  <h4 className="text-white">Listening Master</h4>
                  <p className="text-white/90">10+ hours of listening</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-500 border-0 shadow-lg text-center">
          <p className="text-white text-lg mb-2">
            "Small steps, big progress!"
          </p>
          <p className="text-white/80">
            You're doing amazing! Keep going! 🌟
          </p>
        </Card>
      </div>
    </div>
  );
}
