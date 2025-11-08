import { ArrowLeft, Headphones, Type, Shuffle, Grid3x3, Languages, Mic, HelpCircle, BookOpen, Clock, Book, Sparkles } from 'lucide-react';

interface ReviewScreenProps {
  onNavigate: (screen: string) => void;
}

interface ReviewActivity {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}

const activities: ReviewActivity[] = [
  {
    id: 'listen-type',
    name: 'Listen & Type',
    icon: Headphones,
    gradient: 'linear-gradient(to bottom right, #60a5fa, #22d3ee)',
    description: 'Audio Recall'
  },
  {
    id: 'fill-in-chunk',
    name: 'Fill-in-the-Chunk',
    icon: Type,
    gradient: 'linear-gradient(to bottom right, #4ade80, #10b981)',
    description: 'Vocabulary Recall'
  },
  {
    id: 'chunk-builder',
    name: 'Chunk Builder',
    icon: Shuffle,
    gradient: 'linear-gradient(to bottom right, #a78bfa, #ec4899)',
    description: 'Reorder Words'
  },
  {
    id: 'meaning-match',
    name: 'Meaning Match',
    icon: Grid3x3,
    gradient: 'linear-gradient(to bottom right, #facc15, #f59e0b)',
    description: 'Memory Pairs'
  },
  {
    id: 'translate-back',
    name: 'Translate Back',
    icon: Languages,
    gradient: 'linear-gradient(to bottom right, #fb923c, #ef4444)',
    description: 'Reverse Recall'
  },
  {
    id: 'shadow-challenge',
    name: 'Shadow Challenge',
    icon: Mic,
    gradient: 'linear-gradient(to bottom right, #818cf8, #a855f7)',
    description: 'Pronunciation'
  },
  {
    id: 'context-quiz',
    name: 'Context Quiz',
    icon: HelpCircle,
    gradient: 'linear-gradient(to bottom right, #38bdf8, #3b82f6)',
    description: 'Multiple Choice'
  },
  {
    id: 'quick-review',
    name: 'Quick Review',
    icon: BookOpen,
    gradient: 'linear-gradient(to bottom right, #f472b6, #f43f5e)',
    description: 'Flashcards'
  },
  {
    id: 'time-attack',
    name: 'Time Attack',
    icon: Clock,
    gradient: 'linear-gradient(to bottom right, #f87171, #fb923c)',
    description: 'Fast-Paced'
  },
  {
    id: 'story-mode',
    name: 'Story Mode',
    icon: Book,
    gradient: 'linear-gradient(to bottom right, #fbbf24, #eab308)',
    description: 'Reading Comprehension'
  },
  {
    id: 'ai-sentence-builder',
    name: 'AI Sentence Builder',
    icon: Sparkles,
    gradient: 'linear-gradient(to bottom right, #a78bfa, #9333ea)',
    description: 'AI-Assisted'
  },
];

export function ReviewScreen({ onNavigate }: ReviewScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Review Activities</h1>
            <p className="text-sm text-gray-500">Choose a game to practice</p>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-2 gap-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer border-0 shadow-lg"
                style={{ background: activity.gradient }}
                onClick={() => onNavigate(activity.id)}
              >
                <div className="flex flex-col items-center text-center text-white">
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="font-semibold text-base mb-1">{activity.name}</h3>
                  <p className="text-xs opacity-90">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

