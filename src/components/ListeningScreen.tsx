import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

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

// Sample chunks - you can expand this to 200 chunks
const chunks: Chunk[] = [
  {
    id: 1,
    chunk: "get along with",
    definition: "có quan hệ tốt với ai đó",
    example: "I get along with my coworkers really well.",
    meaning: "Tôi có quan hệ rất tốt với đồng nghiệp của tôi."
  },
  {
    id: 2,
    chunk: "look forward to",
    definition: "mong chờ, mong đợi",
    example: "I'm looking forward to the weekend.",
    meaning: "Tôi đang mong chờ cuối tuần."
  },
  {
    id: 3,
    chunk: "come up with",
    definition: "nghĩ ra, đưa ra ý tưởng",
    example: "Can you come up with a better solution?",
    meaning: "Bạn có thể nghĩ ra giải pháp tốt hơn không?"
  },
  {
    id: 4,
    chunk: "put off",
    definition: "hoãn lại, trì hoãn",
    example: "Don't put off until tomorrow what you can do today.",
    meaning: "Đừng hoãn đến ngày mai những gì bạn có thể làm hôm nay."
  },
  {
    id: 5,
    chunk: "break the ice",
    definition: "phá vỡ sự im lặng, bắt đầu cuộc trò chuyện",
    example: "He told a joke to break the ice at the meeting.",
    meaning: "Anh ấy kể một câu chuyện cười để phá vỡ sự im lặng trong cuộc họp."
  },
  {
    id: 6,
    chunk: "piece of cake",
    definition: "dễ như ăn bánh, rất dễ dàng",
    example: "The exam was a piece of cake.",
    meaning: "Bài thi dễ như ăn bánh."
  },
  {
    id: 7,
    chunk: "call it a day",
    definition: "kết thúc công việc trong ngày",
    example: "It's getting late. Let's call it a day.",
    meaning: "Đã muộn rồi. Hãy kết thúc công việc hôm nay thôi."
  },
  {
    id: 8,
    chunk: "hit the nail on the head",
    definition: "nói đúng, chính xác",
    example: "You hit the nail on the head with that comment.",
    meaning: "Bạn đã nói đúng với nhận xét đó."
  },
  {
    id: 9,
    chunk: "once in a blue moon",
    definition: "rất hiếm khi",
    example: "I only see him once in a blue moon.",
    meaning: "Tôi chỉ thấy anh ấy rất hiếm khi."
  },
  {
    id: 10,
    chunk: "the ball is in your court",
    definition: "đến lượt bạn quyết định",
    example: "I've made my offer. The ball is in your court now.",
    meaning: "Tôi đã đưa ra đề nghị. Bây giờ đến lượt bạn quyết định."
  }
];

// Expanded chunks list - you can add more to reach 200
const additionalChunks: Chunk[] = [
  { id: 11, chunk: "take care of", definition: "chăm sóc", example: "I take care of my plants every day.", meaning: "Tôi chăm sóc cây cối mỗi ngày." },
  { id: 12, chunk: "get rid of", definition: "loại bỏ", example: "I need to get rid of old clothes.", meaning: "Tôi cần loại bỏ quần áo cũ." },
  { id: 13, chunk: "look after", definition: "chăm sóc, trông nom", example: "Can you look after my dog?", meaning: "Bạn có thể trông nom con chó của tôi không?" },
  { id: 14, chunk: "turn down", definition: "từ chối", example: "I had to turn down the job offer.", meaning: "Tôi phải từ chối lời mời làm việc." },
  { id: 15, chunk: "find out", definition: "tìm ra, khám phá", example: "I need to find out what happened.", meaning: "Tôi cần tìm ra điều gì đã xảy ra." },
  { id: 16, chunk: "give up", definition: "từ bỏ", example: "Don't give up on your dreams.", meaning: "Đừng từ bỏ ước mơ của bạn." },
  { id: 17, chunk: "go through", definition: "trải qua", example: "We're going through a difficult time.", meaning: "Chúng tôi đang trải qua thời kỳ khó khăn." },
  { id: 18, chunk: "look up", definition: "tra cứu", example: "I'll look up the word in the dictionary.", meaning: "Tôi sẽ tra cứu từ này trong từ điển." },
  { id: 19, chunk: "make up", definition: "bịa đặt, tạo ra", example: "Don't make up excuses.", meaning: "Đừng bịa đặt lý do." },
  { id: 20, chunk: "pick up", definition: "đón, nhặt", example: "I'll pick you up at 8 AM.", meaning: "Tôi sẽ đón bạn lúc 8 giờ sáng." },
  { id: 21, chunk: "run out of", definition: "hết, cạn kiệt", example: "We've run out of milk.", meaning: "Chúng tôi đã hết sữa." },
  { id: 22, chunk: "turn on", definition: "bật lên", example: "Please turn on the lights.", meaning: "Làm ơn bật đèn lên." },
  { id: 23, chunk: "turn off", definition: "tắt đi", example: "Don't forget to turn off the TV.", meaning: "Đừng quên tắt TV." },
  { id: 24, chunk: "look for", definition: "tìm kiếm", example: "I'm looking for my keys.", meaning: "Tôi đang tìm chìa khóa của tôi." },
  { id: 25, chunk: "take off", definition: "cất cánh, cởi ra", example: "The plane will take off soon.", meaning: "Máy bay sẽ cất cánh sớm." }
];

// Generate more chunks to reach ~200 (you can replace with real data)
const generateChunks = (): Chunk[] => {
  const allBaseChunks = [...chunks, ...additionalChunks];
  const generatedChunks: Chunk[] = [];
  
  const commonChunks = [
    { chunk: "run into", def: "gặp phải", ex: "I ran into an old friend.", mean: "Tôi gặp một người bạn cũ." },
    { chunk: "set up", def: "thiết lập", ex: "Let me set up the meeting.", mean: "Để tôi thiết lập cuộc họp." },
    { chunk: "show up", def: "xuất hiện, đến", ex: "He didn't show up at the party.", mean: "Anh ấy không đến bữa tiệc." },
    { chunk: "turn up", def: "xuất hiện, tăng âm lượng", ex: "Can you turn up the volume?", mean: "Bạn có thể tăng âm lượng không?" },
    { chunk: "work out", def: "tập thể dục, giải quyết", ex: "I work out three times a week.", mean: "Tôi tập thể dục ba lần một tuần." },
    { chunk: "figure out", def: "tìm ra, hiểu ra", ex: "I need to figure out the problem.", mean: "Tôi cần tìm ra vấn đề." },
    { chunk: "point out", def: "chỉ ra", ex: "He pointed out my mistake.", mean: "Anh ấy chỉ ra lỗi của tôi." },
    { chunk: "bring up", def: "nuôi dưỡng, đề cập", ex: "Don't bring up that topic.", mean: "Đừng đề cập chủ đề đó." },
    { chunk: "carry out", def: "thực hiện", ex: "We need to carry out the plan.", mean: "Chúng tôi cần thực hiện kế hoạch." },
    { chunk: "catch up", def: "bắt kịp", ex: "I need to catch up on my work.", mean: "Tôi cần bắt kịp công việc của tôi." }
  ];

  for (let i = 0; i < 165; i++) {
    const template = commonChunks[i % commonChunks.length];
    generatedChunks.push({
      id: allBaseChunks.length + i + 1,
      chunk: template.chunk,
      definition: template.def,
      example: template.ex,
      meaning: template.mean
    });
  }

  return [...allBaseChunks, ...generatedChunks];
};

const allChunks = generateChunks();

type PlaybackStep = 'chunk' | 'definition' | 'example' | 'meaning';

export function ListeningScreen({ onNavigate }: ListeningScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState<PlaybackStep>('chunk');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentChunk = allChunks[currentIndex];
  const progress = ((currentIndex + 1) / allChunks.length) * 100;

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

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
    if (!currentChunk) return;

    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStep('chunk');

    // Step 1: Play chunk (English)
    speak(currentChunk.chunk, 'en-US', () => {
      // Step 2: Play definition (Vietnamese)
      setCurrentStep('definition');
      speak(currentChunk.definition, 'vi-VN', () => {
        // Step 3: Play example (English)
        setCurrentStep('example');
        speak(currentChunk.example, 'en-US', () => {
          // Step 4: Play meaning (Vietnamese)
          setCurrentStep('meaning');
          speak(currentChunk.meaning, 'vi-VN', () => {
            // Move to next chunk
            setCurrentStep('chunk');
            if (currentIndex < allChunks.length - 1) {
              setCurrentIndex(currentIndex + 1);
              // Auto-play next chunk
              setTimeout(() => playCurrentChunk(), 1000);
            } else {
              setIsPlaying(false);
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
    } else if (isPaused) {
      // Resume
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      // Start playing
      playCurrentChunk();
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep('chunk');
  };

  const handlePrevious = () => {
    handleStop();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    handleStop();
    if (currentIndex < allChunks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkipToNextChunk = () => {
    handleStop();
    if (currentIndex < allChunks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => playCurrentChunk(), 500);
    }
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

