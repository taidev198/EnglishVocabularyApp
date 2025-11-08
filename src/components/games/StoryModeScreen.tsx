import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface StoryModeScreenProps {
  onNavigate: (screen: string) => void;
}

export function StoryModeScreen({ onNavigate }: StoryModeScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 5, 'id', 'ASC');
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

  const generateStory = () => {
    if (!currentWord) return '';
    const chunks = words.slice(0, 3).map(w => w.englishWord);
    return `Once upon a time, I learned to ${chunks[0] || 'get along with'} my colleagues. It was important to ${chunks[1] || 'look up to'} my mentors and ${chunks[2] || 'go over with'} my plans. This helped me grow professionally.`;
  };

  const handleReadComplete = () => {
    setShowQuestions(true);
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowQuestions(false);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      onNavigate('review');
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  const story = generateStory();
  const questions = [
    { question: 'What is the main theme?', options: ['Professional growth', 'Daily routine', 'Hobbies'], correct: 0 },
    { question: 'Which chunk was used?', options: [currentWord.englishWord, 'look up to', 'go over with'], correct: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-50 pb-20">
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <span className="text-gray-600">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col min-h-[60vh]">
          {!showQuestions ? (
            <>
              {/* Story */}
              <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Story</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed font-serif">
                  {story.split(' ').map((word, index) => {
                    const isChunk = words.some(w => w.englishWord && word.toLowerCase().includes(w.englishWord.toLowerCase()));
                    return (
                      <span
                        key={index}
                        className={isChunk ? 'text-amber-600 font-bold underline cursor-pointer' : ''}
                        title={isChunk ? 'Chunk' : ''}
                      >
                        {word}{' '}
                      </span>
                    );
                  })}
                </p>
              </Card>

              <Button
                onClick={handleReadComplete}
                className="w-full py-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                I've Finished Reading
              </Button>
            </>
          ) : (
            <>
              {/* Questions */}
              <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Comprehension Questions</h3>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="mb-6">
                    <p className="font-medium text-gray-800 mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswer(oIndex)}
                          disabled={showFeedback}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedAnswer === oIndex
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-lg'
                              : showFeedback && oIndex === q.correct
                              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg'
                              : 'bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90 shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showFeedback && oIndex === q.correct && (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>

              <Button
                onClick={handleNext}
                className="w-full py-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                {currentIndex < words.length - 1 ? 'Next Story' : 'Complete'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

