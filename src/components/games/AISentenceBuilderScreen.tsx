import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Volume2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface AISentenceBuilderScreenProps {
  onNavigate: (screen: string) => void;
}

export function AISentenceBuilderScreen({ onNavigate }: AISentenceBuilderScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleSend = async () => {
    if (!userInput.trim() || !currentWord) return;
    
    setIsLoading(true);
    // Simulate AI feedback (would use actual AI API)
    setTimeout(() => {
      const feedback = userInput.toLowerCase().includes(currentWord.englishWord.toLowerCase())
        ? `Nice! You used "${currentWord.englishWord}" correctly. Try using it in the past tense.`
        : `Good attempt! Try to include "${currentWord.englishWord}" in your sentence.`;
      setAiFeedback(feedback);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewPrompt = () => {
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
    setUserInput('');
    setAiFeedback(null);
  };

  const handleHearExample = () => {
    if (!currentWord || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      currentWord.exampleSentence || currentWord.englishWord
    );
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    // Placeholder for saving sentence
    console.log('Saving sentence:', userInput);
    // Would save to user's notebook
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-violet-50 pb-20">
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <span className="text-gray-600">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col min-h-[60vh]">
          {/* Prompt */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-violet-500" />
              <h3 className="text-lg font-semibold text-gray-800">AI Prompt</h3>
            </div>
            <p className="text-gray-700">
              Make a sentence using <span className="font-bold text-violet-600">"{currentWord.englishWord}"</span>
            </p>
          </Card>

          {/* Input Area */}
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your sentence here..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 min-h-[120px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleHearExample}
                className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-sm">Hear Example</span>
              </button>
              <Button
                onClick={handleSend}
                disabled={!userInput.trim() || isLoading}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </Card>

          {/* AI Feedback */}
          {aiFeedback && (
            <Card className="w-full p-6 bg-gradient-to-r from-violet-400 to-purple-400 border-0 shadow-lg mb-6">
              <div className="flex items-start gap-3 text-white">
                <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-2">AI Feedback</p>
                  <p className="text-sm opacity-90">{aiFeedback}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleNewPrompt}
              className="py-6 bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90"
            >
              New Prompt
            </Button>
            <Button
              onClick={handleHearExample}
              className="py-6 bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSave}
              className="py-6 bg-white/80 backdrop-blur text-gray-800 hover:bg-white/90"
            >
              <Save className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

