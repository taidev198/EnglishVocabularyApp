import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Volume2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface TranslateBackScreenProps {
  onNavigate: (screen: string) => void;
}

export function TranslateBackScreen({ onNavigate }: TranslateBackScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 10, 'id', 'ASC');
        if (response.success && response.data) {
          setWords(response.data.content || []);
        }
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };
    fetchWords();
  }, []);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
    setUserInput('');
    setShowAnswer(false);
  };

  const handleMicClick = () => {
    // Placeholder for voice input - would need Web Speech API or similar
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      console.log('Start recording...');
    } else {
      // Stop recording
      console.log('Stop recording...');
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('review')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-gray-600">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Vietnamese Sentence */}
          <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <p className="text-2xl font-medium text-gray-800 text-center leading-relaxed">
              {currentWord.translation || currentWord.meaning}
            </p>
          </Card>

          {/* Input */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type or speak in English..."
                disabled={showAnswer}
                className="flex-1 p-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleMicClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-orange-500 animate-pulse'
                    : 'bg-gradient-to-br from-orange-400 to-red-400 hover:scale-110'
                }`}
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
            </div>
          </Card>

          {/* Answer Display */}
          {showAnswer && (
            <Card className="w-full p-6 mb-6 bg-gradient-to-r from-orange-400 to-red-400 border-0 shadow-lg">
              <div className="flex items-center gap-3 text-white mb-4">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-semibold text-lg">Answer</p>
              </div>
              <div className="space-y-3 text-white">
                <div>
                  <p className="text-sm opacity-90 mb-1">Chunk</p>
                  <p className="font-medium text-lg">{currentWord.englishWord}</p>
                </div>
                {currentWord.exampleSentence && (
                  <div>
                    <p className="text-sm opacity-90 mb-1">Example</p>
                    <p className="font-medium">{currentWord.exampleSentence}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {!showAnswer ? (
              <Button
                onClick={handleReveal}
                className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Reveal Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

