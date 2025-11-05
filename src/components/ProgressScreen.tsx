import { ArrowLeft, TrendingUp, Flame, Clock, Target, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { useEffect } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';

interface ProgressScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProgressScreen({ onNavigate }: ProgressScreenProps) {
  const {
    vocabularyStats,
    loading,
    fetchVocabularyStats,
  } = useVocabulary();

  useEffect(() => {
    fetchVocabularyStats();
  }, [fetchVocabularyStats]);

  const stats = vocabularyStats || {
    totalWords: 0,
    notStarted: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0,
  };

  const masteryPercentage = stats.totalWords > 0 
    ? Math.round((stats.mastered / stats.totalWords) * 100) 
    : 0;

  const learningPercentage = stats.totalWords > 0 
    ? Math.round((stats.learning / stats.totalWords) * 100) 
    : 0;

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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading progress...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Words</p>
                    <p className="text-gray-900 font-bold">{stats.totalWords}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Mastered</p>
                    <p className="text-gray-900 font-bold">{stats.mastered}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Learning</p>
                    <p className="text-gray-900 font-bold">{stats.learning}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Reviewing</p>
                    <p className="text-gray-900 font-bold">{stats.reviewing}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
              <h3 className="text-gray-800 mb-4">Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-sm">Mastered</span>
                    <span className="text-gray-800 font-semibold">{masteryPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${masteryPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-sm">Learning</span>
                    <span className="text-gray-800 font-semibold">{learningPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${learningPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Breakdown */}
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
              <h3 className="text-gray-800 mb-4">Vocabulary Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Not Started</span>
                  <span className="text-gray-800 font-bold">{stats.notStarted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Learning</span>
                  <span className="text-blue-600 font-bold">{stats.learning}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">Reviewing</span>
                  <span className="text-yellow-600 font-bold">{stats.reviewing}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Mastered</span>
                  <span className="text-green-600 font-bold">{stats.mastered}</span>
                </div>
              </div>
            </Card>

            {/* Motivational Quote */}
            <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-500 border-0 shadow-lg text-center">
              <p className="text-white text-lg mb-2">
                "Small steps, big progress!"
              </p>
              <p className="text-white/80">
                You're doing amazing! Keep going! 🌟
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
