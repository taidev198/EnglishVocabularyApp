import { Mic, Volume2, ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface ShadowingScreenProps {
  onNavigate: (screen: string) => void;
}

export function ShadowingScreen({ onNavigate }: ShadowingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState(0);

  const handleRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
      setScore(92);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('lesson')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-gray-800">Pronunciation Practice</h2>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          {/* Chunk Display */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-8 w-full">
            <p className="text-center text-gray-500 mb-2">Practice this chunk:</p>
            <h3 className="text-center text-gray-900">get along with</h3>
            <p className="text-center text-gray-600 mt-4">
              /ɡet əˈlɒŋ wɪð/
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="w-full bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-8">
            <div className="flex items-end justify-center gap-1 h-32">
              {[...Array(20)].map((_, i) => {
                const height = isRecording
                  ? Math.random() * 100 + 20
                  : hasRecorded
                  ? Math.sin(i * 0.5) * 40 + 60
                  : 20;
                return (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-100 ${
                      isRecording
                        ? 'bg-gradient-to-t from-red-400 to-orange-400'
                        : hasRecorded
                        ? 'bg-gradient-to-t from-green-400 to-emerald-400'
                        : 'bg-gray-300'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Recording Button */}
          <button
            onClick={handleRecord}
            disabled={isRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all mb-8 ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-orange-500 animate-pulse'
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            }`}
          >
            <Mic className="w-12 h-12 text-white" />
          </button>

          {/* Result */}
          {hasRecorded && (
            <div className="w-full bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                  <span className="text-white">{score}%</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Great job!</p>
                  <p className="text-gray-600">Stress "get" more strongly</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <Button
              onClick={handleRecord}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">Retry</span>
            </Button>
            <Button
              onClick={() => onNavigate('lesson')}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <Volume2 className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Listen</span>
            </Button>
            <Button
              onClick={() => onNavigate('home')}
              className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <ChevronRight className="w-5 h-5" />
              <span>Next</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
