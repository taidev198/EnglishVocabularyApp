import { Play, RotateCcw, Mic, Languages, ArrowLeft, Volume2, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useState, useEffect, useRef } from 'react';
import { wordApi } from '../api/vocabulary';
import { Word } from '../api/types';

interface LessonScreenProps {
  onNavigate: (screen: string) => void;
}

export function LessonScreen({ onNavigate }: LessonScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPlayingExampleVi, setIsPlayingExampleVi] = useState(false);
  const [isPlayingDefinition, setIsPlayingDefinition] = useState(false);
  const [loading, setLoading] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        // Get selected word ID from localStorage (set when clicking from HomeScreen)
        const selectedWordId = localStorage.getItem('selectedWordId');
        
        if (selectedWordId) {
          // Fetch specific word
          const response = await wordApi.getWordById(Number(selectedWordId));
          if (response.success && response.data) {
            setWords([response.data]);
          }
          localStorage.removeItem('selectedWordId');
        } else {
          // Fetch recent words to show in lesson
          const response = await wordApi.getAllWords(0, 10, 'createdAt', 'DESC');
          if (response.success && response.data) {
            setWords(response.data.content || []);
          }
        }
      } catch (error) {
        console.error('Error fetching words:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  const speak = (text: string, lang: string = 'en-US', onEnd?: () => void) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      if (onEnd) {
        onEnd();
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (!words.length) return;
    const word = words[currentLesson];
    setIsPlaying(true);
    speak(word.englishWord, 'en-US', () => {
      setIsPlaying(false);
    });
  };

  const handlePlayExample = () => {
    if (!words.length) return;
    const word = words[currentLesson];
    if (!word.exampleSentence) return;
    setIsPlayingExample(true);
    speak(word.exampleSentence, 'en-US', () => {
      setIsPlayingExample(false);
    });
  };

  const handlePlayExampleVi = () => {
    if (!words.length) return;
    const word = words[currentLesson];
    // Example Vietnamese should use 'translation' field (Vietnamese translation/context)
    const translation = word.translation || '';
    if (!translation) return;
    setIsPlayingExampleVi(true);
    speak(translation, 'vi-VN', () => {
      setIsPlayingExampleVi(false);
    });
  };

  const handlePlayDefinition = () => {
    if (!words.length) return;
    const word = words[currentLesson];
    // Definition should use 'meaning' field (Vietnamese definition)
    const definition = word.meaning || '';
    if (!definition) return;
    setIsPlayingDefinition(true);
    speak(definition, 'vi-VN', () => {
      setIsPlayingDefinition(false);
    });
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPlayingExample(false);
    setIsPlayingExampleVi(false);
    setIsPlayingDefinition(false);
  };

  const handleNext = () => {
    handleStop();
    if (currentLesson < words.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setShowTranslation(false);
    } else {
      onNavigate('home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word...</p>
        </div>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No words available</p>
          <Button onClick={() => onNavigate('home')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const word = words[currentLesson];
  const progress = words.length > 0 ? ((currentLesson + 1) / words.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              handleStop();
              onNavigate('home');
            }}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-gray-600">{currentLesson + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl hover:scale-105 transition-all mb-12 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 text-white fill-white" />
            ) : (
              <Play className="w-16 h-16 text-white fill-white ml-2" />
            )}
          </button>

          {/* Word Content */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg mb-6 w-full">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {word.englishWord}
              </h2>
              {word.pronunciation && (
                <p className="text-gray-500 text-sm mb-4">{word.pronunciation}</p>
              )}
            </div>

            {/* Definition Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Definition</span>
                {word.meaning && (
                  <button
                    onClick={handlePlayDefinition}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center hover:scale-110 transition-transform"
                    title="Play definition"
                  >
                    {isPlayingDefinition ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-gray-800">
                {word.meaning || 'No definition available'}
              </p>
            </div>

            {/* Example Section */}
            {word.exampleSentence && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">Example</span>
                  <div className="flex items-center gap-2">
                    {/* English Example Play Button */}
                    <button
                      onClick={handlePlayExample}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center hover:scale-110 transition-transform"
                      title="Play example (English)"
                    >
                      {isPlayingExample ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    {/* Vietnamese Example Play Button */}
                    {word.translation && (
                      <button
                        onClick={handlePlayExampleVi}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center hover:scale-110 transition-transform"
                        title="Play translation (Vietnamese)"
                      >
                        {isPlayingExampleVi ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-2">
                  {word.exampleSentence}
                </p>
                {word.translation && (
                  <p className="text-gray-600 text-sm">
                    {word.translation}
                  </p>
                )}
              </div>
            )}

            {/* Translation (toggleable) */}
            {showTranslation && word.translation && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-center">
                  {word.translation}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <Button
              onClick={handlePlay}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <RotateCcw className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Replay</span>
            </Button>
            <Button
              onClick={() => onNavigate('shadowing')}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <Mic className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">Shadow</span>
            </Button>
            <Button
              onClick={() => setShowTranslation(!showTranslation)}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg"
            >
              <Languages className="w-5 h-5 text-pink-500" />
              <span className="text-gray-700">Translate</span>
            </Button>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {currentLesson < words.length - 1 ? 'Next Chunk' : 'Complete Lesson'}
          </Button>
        </div>
      </div>
    </div>
  );
}
