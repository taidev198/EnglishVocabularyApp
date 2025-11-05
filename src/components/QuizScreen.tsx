import { ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Progress } from './ui/progress';

interface QuizScreenProps {
  onNavigate: (screen: string) => void;
}

const quizQuestions = [
  {
    id: 1,
    audio: "I ___ ___ ___ my neighbors.",
    correctAnswer: "get along with",
    words: ["get", "with", "along", "about"],
    fullSentence: "I get along with my neighbors.",
  },
  {
    id: 2,
    audio: "We're ___ ___ ___ the concert.",
    correctAnswer: "looking forward to",
    words: ["to", "looking", "at", "forward"],
    fullSentence: "We're looking forward to the concert.",
  },
  {
    id: 3,
    audio: "Can you ___ ___ ___ a solution?",
    correctAnswer: "come up with",
    words: ["come", "with", "down", "up"],
    fullSentence: "Can you come up with a solution?",
  },
];

export function QuizScreen({ onNavigate }: QuizScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(
    quizQuestions[0].words
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (showFeedback) return;

    if (fromAvailable) {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((w) => w !== word));
    } else {
      setAvailableWords([...availableWords, word]);
      setSelectedWords(selectedWords.filter((w) => w !== word));
    }
  };

  const handleSubmit = () => {
    const userAnswer = selectedWords.join(' ');
    const correct = userAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setSelectedWords([]);
      setAvailableWords(quizQuestions[nextQuestion].words);
      setShowFeedback(false);
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50">
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
          <span className="text-gray-600">{currentQuestion + 1}/{quizQuestions.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col min-h-[70vh]">
          <h2 className="text-gray-800 text-center mb-8">Fill in the blank</h2>

          {/* Audio Section */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6 text-white" />
              </button>
              <p className="text-gray-600">Listen to the sentence</p>
            </div>
            <p className="text-gray-800 text-center">{question.audio}</p>
          </div>

          {/* Answer Area */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-6 min-h-[80px]">
            <p className="text-gray-500 mb-3">Your answer:</p>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {selectedWords.length === 0 ? (
                <p className="text-gray-400">Tap words below to build your answer</p>
              ) : (
                selectedWords.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    onClick={() => handleWordClick(word, false)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:scale-105 transition-transform"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Word Tiles */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {availableWords.map((word, index) => (
                <button
                  key={`${word}-${index}`}
                  onClick={() => handleWordClick(word, true)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`rounded-3xl p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-bottom-4 ${
                isCorrect
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                  : 'bg-gradient-to-r from-red-400 to-orange-400'
              }`}
            >
              <div className="flex items-center gap-3 text-white">
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
                <div>
                  <p className="font-semibold">
                    {isCorrect ? 'Great! You got it right!' : 'Not quite right'}
                  </p>
                  {!isCorrect && (
                    <p className="text-white/90">
                      Correct answer: {question.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto">
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedWords.length === 0}
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
