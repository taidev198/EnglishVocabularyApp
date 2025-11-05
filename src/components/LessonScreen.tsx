import { Play, RotateCcw, Mic, Languages, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useState } from 'react';

interface LessonScreenProps {
  onNavigate: (screen: string) => void;
}

const lessons = [
  {
    id: 1,
    english: "I get along with my coworkers really well.",
    vietnamese: "Tôi có quan hệ rất tốt với đồng nghiệp.",
    chunk: "get along with"
  },
  {
    id: 2,
    english: "I'm looking forward to the weekend.",
    vietnamese: "Tôi đang mong chờ cuối tuần.",
    chunk: "looking forward to"
  },
  {
    id: 3,
    english: "Can you come up with a better solution?",
    vietnamese: "Bạn có thể nghĩ ra giải pháp tốt hơn không?",
    chunk: "come up with"
  },
];

export function LessonScreen({ onNavigate }: LessonScreenProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const lesson = lessons[currentLesson];
  const progress = ((currentLesson + 1) / lessons.length) * 100;

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleNext = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setShowTranslation(false);
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-gray-600">{currentLesson + 1}/{lessons.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl hover:scale-105 transition-all mb-12 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            <Play className="w-16 h-16 text-white fill-white ml-2" />
          </button>

          {/* Sentence */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-8 w-full">
            <p className="text-gray-800 text-center mb-4">
              {lesson.english}
            </p>
            {showTranslation && (
              <p className="text-gray-600 text-center pt-4 border-t border-gray-200">
                {lesson.vietnamese}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <Button
              onClick={handlePlay}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <RotateCcw className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Replay</span>
            </Button>
            <Button
              onClick={() => onNavigate('shadowing')}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <Mic className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">Shadow</span>
            </Button>
            <Button
              onClick={() => setShowTranslation(!showTranslation)}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <Languages className="w-5 h-5 text-pink-500" />
              <span className="text-gray-700">Translate</span>
            </Button>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {currentLesson < lessons.length - 1 ? 'Next Chunk' : 'Complete Lesson'}
          </Button>
        </div>
      </div>
    </div>
  );
}
