import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface ContextQuizScreenProps {
  onNavigate: (screen: string) => void;
}

export function ContextQuizScreen({ onNavigate }: ContextQuizScreenProps) {
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
    const example = currentWord.exampleSentence || `We don't really ${chunk} each other anymore.`;
    const blankedSentence = example.replace(new RegExp(chunk, 'gi'), '___ ___ ___');

    const wrongWords = words
      .filter((w, i) => i !== currentIndex && w.englishWord)
      .slice(0, 3)
      .map(w => w.englishWord);

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

  const handleSubmit = () => {
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-sky-50 pb-20">
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-400 flex items-center justify-center shadow-lg">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
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
                  ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg scale-105'
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

          {/* Explanation */}
          {showFeedback && (
            <Card className="w-full p-6 mb-6 bg-gradient-to-r from-sky-400 to-blue-400 border-0 shadow-lg">
              <div className="text-white">
                <p className="font-semibold mb-2">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {currentWord.meaning && (
                  <p className="text-sm opacity-90">{currentWord.meaning}</p>
                )}
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={showFeedback ? handleNext : handleSubmit}
            disabled={!showFeedback && selectedOption === null}
            className="w-full py-6 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 disabled:opacity-50"
          >
            {showFeedback ? 'Next' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}

