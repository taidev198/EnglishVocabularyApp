import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface FillInChunkScreenProps {
  onNavigate: (screen: string) => void;
}

export function FillInChunkScreen({ onNavigate }: FillInChunkScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [sentence, setSentence] = useState('');

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 20, 'id', 'ASC');
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

    // Create sentence with blank
    const chunk = currentWord.englishWord;
    const example = currentWord.exampleSentence || `I use ${chunk} in my daily life.`;
    const blankedSentence = example.replace(new RegExp(chunk, 'gi'), '___ ___ ___');

    // Get wrong options from other words
    const wrongWords = words
      .filter((w, i) => i !== currentIndex && w.englishWord)
      .slice(0, 2)
      .map(w => w.englishWord);

    // Create options array
    const allOptions = [chunk, ...wrongWords].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setCorrectIndex(allOptions.indexOf(chunk));
    setSentence(blankedSentence);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const isCorrect = selectedOption === correctIndex;

  if (!currentWord || options.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 pb-20">
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
          {/* Sentence */}
          <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-8">
            <p className="text-2xl font-medium text-gray-800 text-center leading-relaxed">
              {sentence}
            </p>
          </Card>

          {/* Options */}
          <div className="w-full space-y-4 mb-6">
            {options.map((option, index) => {
              let buttonClass = 'w-full p-4 rounded-2xl text-left transition-all font-medium ';
              
              if (showFeedback) {
                if (index === correctIndex) {
                  buttonClass += 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg scale-105';
                } else if (index === selectedOption && !isCorrect) {
                  buttonClass += 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg';
                } else {
                  buttonClass += 'bg-white/80 backdrop-blur text-gray-800 shadow-md opacity-60';
                }
              } else {
                buttonClass += selectedOption === index
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90 shadow-md';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && index === correctIndex && (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    )}
                    {showFeedback && index === selectedOption && !isCorrect && index !== correctIndex && (
                      <XCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <Button
            onClick={showFeedback ? handleNext : handleCheck}
            disabled={!showFeedback && selectedOption === null}
            className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
          >
            {showFeedback ? 'Next' : 'Check Answer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

