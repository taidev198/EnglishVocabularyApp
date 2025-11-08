import { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface ChunkBuilderScreenProps {
  onNavigate: (screen: string) => void;
}

export function ChunkBuilderScreen({ onNavigate }: ChunkBuilderScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordTiles, setWordTiles] = useState<string[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (words.length > 0) {
      setupQuestion();
    }
  }, [words, currentIndex]);

  const setupQuestion = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    const chunk = currentWord.englishWord;
    const wordsArray = chunk.split(' ');
    const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
    
    setWordTiles(shuffled);
    setSelectedTiles([]);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleTileClick = (word: string) => {
    if (showFeedback) return;
    setWordTiles((prev) => prev.filter((w) => w !== word));
    setSelectedTiles((prev) => [...prev, word]);
  };

  const handleSelectedTileClick = (word: string) => {
    if (showFeedback) return;
    setSelectedTiles((prev) => prev.filter((w) => w !== word));
    setWordTiles((prev) => [...prev, word]);
  };

  const handlePlay = () => {
    const currentWord = words[currentIndex];
    if (!currentWord || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.exampleSentence || currentWord.englishWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCheck = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    
    const userAnswer = selectedTiles.join(' ');
    const correctAnswer = currentWord.englishWord.toLowerCase();
    const isAnswerCorrect = userAnswer.toLowerCase() === correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
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
        <div className="flex flex-col min-h-[60vh]">
          {/* Audio Play Button */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Volume2 className="w-6 h-6 text-white" />
            </button>
            <p className="text-gray-600">Listen to the sentence</p>
          </div>

          {/* Selected Tiles (Answer Area) */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6 min-h-[120px]">
            <p className="text-sm text-gray-500 mb-3">Your answer:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTiles.length === 0 ? (
                <p className="text-gray-400 italic">Tap words below to build the chunk</p>
              ) : (
                selectedTiles.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectedTileClick(word)}
                    disabled={showFeedback}
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-md flex items-center gap-2"
                  >
                    <GripVertical className="w-4 h-4" />
                    {word}
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Available Tiles */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <p className="text-sm text-gray-500 mb-3">Available words:</p>
            <div className="flex flex-wrap gap-2">
              {wordTiles.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleTileClick(word)}
                  disabled={showFeedback}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors shadow-md"
                >
                  {word}
                </button>
              ))}
            </div>
          </Card>

          {/* Feedback */}
          {showFeedback && (
            <Card className={`w-full p-6 mb-6 border-0 shadow-lg ${
              isCorrect ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-orange-400'
            }`}>
              <div className="flex items-center gap-3 text-white">
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {isCorrect ? 'Perfect!' : 'Try again'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm opacity-90 mt-1">
                      Correct: {currentWord.englishWord}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={showFeedback ? handleNext : handleCheck}
            disabled={!showFeedback && selectedTiles.length === 0}
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {showFeedback ? 'Next' : 'Check Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}

