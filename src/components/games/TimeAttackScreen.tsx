import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface TimeAttackScreenProps {
  onNavigate: (screen: string) => void;
}

export function TimeAttackScreen({ onNavigate }: TimeAttackScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [sentence, setSentence] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 50, 'id', 'ASC');
        if (response.success && response.data) {
          setWords(response.data.content || []);
        }
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };
    fetchWords();
  }, []);

  useEffect(() => {
    if (words.length > 0 && !gameOver) {
      setupQuestion();
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [words, currentIndex, gameOver]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const setupQuestion = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    const chunk = currentWord.englishWord;
    const example = currentWord.exampleSentence || `I ${chunk} in my daily life.`;
    const blankedSentence = example.replace(new RegExp(chunk, 'gi'), '___ ___ ___');

    const wrongWords = words
      .filter((w, i) => i !== currentIndex && w.englishWord)
      .slice(0, 2)
      .map(w => w.englishWord);

    const allOptions = [chunk, ...wrongWords].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setCorrectIndex(allOptions.indexOf(chunk));
    setSentence(blankedSentence);
    setSelectedOption(null);
  };

  const handleSelect = (index: number) => {
    if (gameOver) return;
    setSelectedOption(index);
    
    // Auto-submit on selection
    setTimeout(() => {
      if (index === correctIndex) {
        setScore((prev) => prev + 1);
        setCombo((prev) => prev + 1);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCombo(0);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleRestart = () => {
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setCurrentIndex(0);
    setGameOver(false);
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-20">
        <div className="max-w-md mx-auto px-6 pt-8">
          <Card className="w-full p-8 bg-gradient-to-r from-red-400 to-orange-400 border-0 shadow-lg">
            <div className="text-center text-white">
              <Zap className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
              <p className="text-2xl font-semibold mb-2">Score: {score}</p>
              <p className="text-lg opacity-90">Max Combo: {combo}</p>
            </div>
          </Card>
          <Button
            onClick={handleRestart}
            className="w-full mt-6 py-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            Play Again
          </Button>
          <Button
            onClick={() => onNavigate('review')}
            className="w-full mt-3 py-6 bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90"
          >
            Back to Review
          </Button>
        </div>
      </div>
    );
  }

  if (!currentWord || options.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              onNavigate('review');
            }}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{timeLeft}s</p>
              <p className="text-xs text-gray-500">Time</p>
            </div>
            {combo > 0 && (
              <div className="text-center bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2 rounded-xl shadow-lg">
                <p className="text-xl font-bold text-white">x{combo}</p>
                <p className="text-xs text-white opacity-90">Combo</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{score}</p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Sentence */}
          <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <p className="text-2xl font-medium text-gray-800 text-center leading-relaxed">
              {sentence}
            </p>
          </Card>

          {/* Options */}
          <div className="w-full space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={gameOver}
                className={`w-full p-4 rounded-2xl text-left transition-all font-medium ${
                  selectedOption === index
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90 shadow-md hover:scale-105'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

