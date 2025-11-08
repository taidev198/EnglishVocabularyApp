import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface QuickReviewFlashcardsScreenProps {
  onNavigate: (screen: string) => void;
}

export function QuickReviewFlashcardsScreen({ onNavigate }: QuickReviewFlashcardsScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = (_status: 'easy' | 'hard' | 'forgot') => {
    // Move to next card after a short delay
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // All cards reviewed
        onNavigate('review');
      }
    }, 500);
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-pink-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('review')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 flex-1 mx-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <span className="text-gray-600">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Flashcard */}
          <Card
            onClick={handleFlip}
            className="w-full min-h-[400px] p-8 bg-white/80 backdrop-blur border-0 shadow-2xl mb-8 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
          >
            <div className="text-center">
              {!isFlipped ? (
                <>
                  <p className="text-4xl font-bold text-gray-800 mb-4">
                    {currentWord.englishWord}
                  </p>
                  <p className="text-gray-500 text-sm">Tap to flip</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-800 mb-4">
                    {currentWord.translation || currentWord.meaning}
                  </p>
                  {currentWord.exampleSentence && (
                    <p className="text-gray-600 italic text-lg mt-4">
                      {currentWord.exampleSentence}
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Review Buttons */}
          <div className="w-full grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleReview('easy')}
              className="py-6 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Easy
            </Button>
            <Button
              onClick={() => handleReview('hard')}
              className="py-6 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Hard
            </Button>
            <Button
              onClick={() => handleReview('forgot')}
              className="py-6 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Forgot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

