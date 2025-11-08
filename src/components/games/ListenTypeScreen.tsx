import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface ListenTypeScreenProps {
  onNavigate: (screen: string) => void;
}

export function ListenTypeScreen({ onNavigate }: ListenTypeScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const speak = (text: string, lang: string = 'en-US') => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlay = () => {
    if (!currentWord) return;
    speak(currentWord.englishWord, 'en-US');
  };

  const handleCheck = () => {
    if (!currentWord) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedWord = currentWord.englishWord.toLowerCase();
    const correct = normalizedInput === normalizedWord;
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(false);
    setIsPlaying(false);
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              onNavigate('review');
            }}
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
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl hover:scale-105 transition-all mb-8 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 text-white fill-white" />
            ) : (
              <Volume2 className="w-16 h-16 text-white fill-white" />
            )}
          </button>

          {/* Input */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type what you hear..."
              disabled={showAnswer}
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !showAnswer) {
                  handleCheck();
                }
              }}
            />
          </Card>

          {/* Answer Display */}
          {showAnswer && (
            <Card className={`w-full p-6 mb-6 border-0 shadow-lg ${
              isCorrect ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-orange-400'
            }`}>
              <div className="flex items-center gap-3 text-white mb-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
                <p className="font-semibold text-lg">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-white">
                <div>
                  <p className="text-sm opacity-90 mb-1">Transcript</p>
                  <p className="font-medium">{currentWord.englishWord}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Translation</p>
                  <p className="font-medium">{currentWord.translation || currentWord.meaning}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={showAnswer ? handleNext : handleCheck}
            disabled={!showAnswer && !userInput.trim()}
            className="w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {showAnswer ? 'Next' : 'Check Answer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

