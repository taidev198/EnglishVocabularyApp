import { ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import { useVocabulary } from '../hooks/useVocabulary';
import { toast } from 'sonner';

interface QuizScreenProps {
  onNavigate: (screen: string) => void;
}

export function QuizScreen({ onNavigate }: QuizScreenProps) {
  const {
    currentQuiz,
    loading,
    generateQuiz,
    submitQuizAnswer,
  } = useVocabulary();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Generate quiz on mount
  useEffect(() => {
    generateQuiz(undefined, 10, 'MEDIUM');
  }, [generateQuiz]);

  // Start timer when question is displayed
  useEffect(() => {
    if (currentQuiz && !showFeedback) {
      setStartTime(Date.now());
      setTimeSpent(0);
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentQuestionIndex, currentQuiz, showFeedback]);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const progress = currentQuiz ? ((currentQuestionIndex + 1) / currentQuiz.totalQuestions) * 100 : 0;

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswerIndex(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswerIndex === null || !currentQuestion) return;

    const timeSpentSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : timeSpent;
    const correct = await submitQuizAnswer(
      currentQuestion.wordId,
      selectedAnswerIndex,
      currentQuestion.correctAnswerIndex,
      timeSpentSeconds
    );

    setIsCorrect(correct);
    setShowFeedback(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (correct) {
      toast.success('Correct! 🎉');
    } else {
      toast.error(`Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswerIndex]}`);
    }
  };

  const handleNext = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerIndex(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Quiz completed
      toast.success(`Quiz completed! Score: ${score.correct}/${score.total}`);
      onNavigate('home');
    }
  };

  if (loading && !currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No quiz available</p>
          <Button onClick={() => onNavigate('home')}>Go Back</Button>
        </div>
      </div>
    );
  }

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
          <span className="text-gray-600">{currentQuestionIndex + 1}/{currentQuiz.totalQuestions}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col min-h-[70vh]">
          <h2 className="text-gray-800 text-center mb-8">What does this word mean?</h2>

          {/* Word Section */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {currentQuestion.word.audioUrl && (
                <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center hover:scale-110 transition-transform">
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              )}
              <p className="text-gray-600">Listen to pronunciation</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 text-center mb-2">
              {currentQuestion.question}
            </h3>
            {currentQuestion.word.pronunciation && (
              <p className="text-gray-500 text-center text-sm">
                {currentQuestion.word.pronunciation}
              </p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  selectedAnswerIndex === index
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                    : showFeedback && index === currentQuestion.correctAnswerIndex
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg'
                    : showFeedback && selectedAnswerIndex === index && !isCorrect
                    ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showFeedback && index === currentQuestion.correctAnswerIndex && (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {showFeedback && selectedAnswerIndex === index && !isCorrect && index !== currentQuestion.correctAnswerIndex && (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
              </button>
            ))}
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
                  {currentQuestion.word.exampleSentence && (
                    <p className="text-white/90 text-sm mt-1">
                      Example: {currentQuestion.word.exampleSentence}
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
                disabled={selectedAnswerIndex === null}
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
