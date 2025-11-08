import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { wordApi } from '../api/vocabulary';
import { Word } from '../api/types';

interface ListeningScreenProps {
  onNavigate: (screen: string) => void;
}

interface Chunk {
  id: number;
  chunk: string;
  definition: string; // Vietnamese definition
  example: string; // English example
  meaning: string; // Vietnamese meaning
}

// Transform Word to Chunk
const wordToChunk = (word: Word): Chunk => ({
  id: word.id,
  chunk: word.englishWord,
  definition: word.meaning || '',
  example: word.exampleSentence || '',
  meaning: word.translation || '',
});

type PlaybackStep = 'chunk' | 'definition' | 'example' | 'meaning';

export function ListeningScreen({ onNavigate }: ListeningScreenProps) {
  const [allChunks, setAllChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState<PlaybackStep>('chunk');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch words from backend
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch multiple pages to get 200 words (or as many as available)
        const targetCount = 200;
        const pageSize = 50;
        let allWords: Word[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore && allWords.length < targetCount) {
          try {
            console.log(`Fetching page ${page} with size ${pageSize}...`);
            const response = await wordApi.getAllWords(page, pageSize, 'id', 'ASC');
            console.log(`Page ${page} response:`, response);
            
            if (response.success && response.data) {
              const words = response.data.content || [];
              allWords = [...allWords, ...words];
              
              // Check if there are more pages
              hasMore = !response.data.last && words.length > 0;
              page++;
              
              // Stop if we've reached the target count
              if (allWords.length >= targetCount) {
                break;
              }
            } else {
              console.warn('API response not successful:', response);
              hasMore = false;
            }
          } catch (pageError) {
            console.error(`Error fetching page ${page}:`, pageError);
            // Continue to next page or stop if it's the first page
            if (page === 0) {
              throw pageError; // Re-throw if first page fails
            }
            hasMore = false;
          }
        }

        // Transform words to chunks and limit to 200
        const chunks = allWords.slice(0, targetCount).map(wordToChunk);
        setAllChunks(chunks);
        // Reset ref when chunks are loaded
        currentIndexRef.current = 0;
      } catch (err) {
        console.error('Error fetching words:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        const errorMessage = err instanceof Error 
          ? `${err.message}${err.message.includes('CORS') || err.message.includes('Failed to fetch') 
              ? ' - Check if backend CORS is configured and server is running on port 8084' 
              : ''}` 
          : 'Failed to load words';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  const currentChunk = allChunks[currentIndex];
  const progress = allChunks.length > 0 ? ((currentIndex + 1) / allChunks.length) * 100 : 0;

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    // Sync ref with currentIndex when it changes
    currentIndexRef.current = currentIndex;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isPlayingRef.current = false;
    };
  }, [currentIndex]);

  const speak = (text: string, lang: string = 'en-US', onEnd?: () => void) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = isMuted ? 0 : volume;
    
    utterance.onend = () => {
      if (onEnd) {
        setTimeout(onEnd, 500); // Small delay between audio
      }
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      if (onEnd) {
        setTimeout(onEnd, 500);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const playCurrentChunk = () => {
    // Check if playback was manually stopped
    if (!isPlayingRef.current) {
      return;
    }

    // Use ref to get the latest index value (avoids stale closure)
    const index = currentIndexRef.current;
    const chunk = allChunks[index];
    
    if (!chunk) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsPaused(false);
    setCurrentStep('chunk');

    // Step 1: Play chunk (English)
    speak(chunk.chunk, 'en-US', () => {
      // Check if playback was manually stopped during callback
      if (!isPlayingRef.current) return;

      // Step 2: Play definition (Vietnamese)
      setCurrentStep('definition');
      speak(chunk.definition, 'vi-VN', () => {
        if (!isPlayingRef.current) return;

        // Step 3: Play example (English)
        setCurrentStep('example');
        speak(chunk.example, 'en-US', () => {
          if (!isPlayingRef.current) return;

          // Step 4: Play meaning (Vietnamese)
          setCurrentStep('meaning');
          speak(chunk.meaning, 'vi-VN', () => {
            if (!isPlayingRef.current) return;

            // Move to next chunk
            setCurrentStep('chunk');
            
            // Check if there are more chunks using ref (latest value)
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < allChunks.length && isPlayingRef.current) {
              currentIndexRef.current = nextIndex;
              setCurrentIndex(nextIndex);
              // Auto-play next chunk
              timeoutRef.current = setTimeout(() => {
                if (isPlayingRef.current) {
                  playCurrentChunk();
                }
              }, 1000);
            } else {
              setIsPlaying(false);
              isPlayingRef.current = false;
            }
          });
        });
      });
    });
  };

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isPlaying && !isPaused) {
      // Pause
      synthRef.current.pause();
      setIsPaused(true);
      isPlayingRef.current = false; // Prevent auto-play continuation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (isPaused) {
      // Resume
      isPlayingRef.current = true;
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      // Start playing
      isPlayingRef.current = true;
      playCurrentChunk();
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false; // Prevent auto-play continuation
    setIsPaused(false);
    setCurrentStep('chunk');
    // Sync ref with current state
    currentIndexRef.current = currentIndex;
  };

  const handlePrevious = () => {
    handleStop();
    // Wait a bit to ensure all callbacks are cancelled, then use ref for latest value
    setTimeout(() => {
      const currentIdx = currentIndexRef.current;
      if (currentIdx > 0) {
        const newIndex = currentIdx - 1;
        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
      }
    }, 100);
  };

  const handleNext = () => {
    handleStop();
    // Wait a bit to ensure all callbacks are cancelled, then use ref for latest value
    setTimeout(() => {
      const currentIdx = currentIndexRef.current;
      if (currentIdx < allChunks.length - 1) {
        const newIndex = currentIdx + 1;
        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
      }
    }, 100);
  };

  const handleSkipToNextChunk = () => {
    handleStop();
    // Wait a bit to ensure all callbacks are cancelled, then use ref for latest value
    setTimeout(() => {
      const currentIdx = currentIndexRef.current;
      if (currentIdx < allChunks.length - 1) {
        const newIndex = currentIdx + 1;
        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
        isPlayingRef.current = true;
        setTimeout(() => playCurrentChunk(), 500);
      }
    }, 100);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current && synthRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : volume;
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
        synthRef.current.speak(utteranceRef.current);
      }
    }
  };

  const getStepLabel = (step: PlaybackStep): string => {
    switch (step) {
      case 'chunk': return 'Chunk';
      case 'definition': return 'Definition';
      case 'example': return 'Example';
      case 'meaning': return 'Meaning';
      default: return '';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Loading words...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // No chunks state
  if (allChunks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-gray-600 mb-4">No words available.</p>
          <Button onClick={() => onNavigate('home')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-md mx-auto px-6 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              handleStop();
              onNavigate('home');
            }}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">Driving Mode</h1>
            <p className="text-sm text-gray-500">{currentIndex + 1} / {allChunks.length}</p>
          </div>
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-700" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-2 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Current Chunk Display */}
        <Card className="mb-6 p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium mb-2">
                {getStepLabel(currentStep)}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentChunk.chunk}
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Definition:</span> {currentChunk.definition}</p>
              <p className="italic"><span className="font-medium">Example:</span> {currentChunk.example}</p>
              <p><span className="font-medium">Meaning:</span> {currentChunk.meaning}</p>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          {/* Main Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                {isPaused ? 'Resume' : 'Start Listening'}
              </>
            )}
          </Button>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2"
            >
              <SkipBack className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2"
            >
              Stop
            </Button>
            <Button
              onClick={handleSkipToNextChunk}
              disabled={currentIndex === allChunks.length - 1}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2"
            >
              Next
              <SkipForward className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Perfect for driving! All audio is automated.
          </p>
        </div>
      </div>
    </div>
  );
}
