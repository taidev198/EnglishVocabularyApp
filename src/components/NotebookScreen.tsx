import { ArrowLeft, Search, Play, BookmarkCheck } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface NotebookScreenProps {
  onNavigate: (screen: string) => void;
}

const savedChunks = [
  {
    id: 1,
    chunk: "get along with",
    translation: "có quan hệ tốt với",
    example: "I get along with my coworkers really well.",
    category: "Daily Life"
  },
  {
    id: 2,
    chunk: "look forward to",
    translation: "mong chờ, mong đợi",
    example: "I'm looking forward to the weekend.",
    category: "Daily Life"
  },
  {
    id: 3,
    chunk: "come up with",
    translation: "nghĩ ra, đưa ra (ý tưởng)",
    example: "Can you come up with a better solution?",
    category: "Work"
  },
  {
    id: 4,
    chunk: "put off",
    translation: "hoãn lại",
    example: "Don't put off until tomorrow what you can do today.",
    category: "Phrasal Verbs"
  },
  {
    id: 5,
    chunk: "break the ice",
    translation: "phá vỡ sự im lặng",
    example: "He told a joke to break the ice at the meeting.",
    category: "Idioms"
  },
  {
    id: 6,
    chunk: "piece of cake",
    translation: "dễ như ăn bánh",
    example: "The exam was a piece of cake.",
    category: "Idioms"
  },
];

const categories = ["All", "Phrasal Verbs", "Idioms", "Daily Life", "Work"];

export function NotebookScreen({ onNavigate }: NotebookScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChunks = savedChunks.filter((chunk) => {
    const matchesCategory = selectedCategory === "All" || chunk.category === selectedCategory;
    const matchesSearch = chunk.chunk.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chunk.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 pb-20">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-gray-800">My Notebook</h2>
          <BookmarkCheck className="w-6 h-6 text-orange-500" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search your chunks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/80 backdrop-blur border-0 shadow-md h-12"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`cursor-pointer whitespace-nowrap px-4 py-2 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Chunks List */}
        <div className="space-y-3">
          {filteredChunks.map((chunk) => (
            <Card
              key={chunk.id}
              className="p-5 bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform mt-1">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-gray-900">{chunk.chunk}</h3>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-0 flex-shrink-0">
                      {chunk.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{chunk.translation}</p>
                  <p className="text-gray-500 italic">{chunk.example}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredChunks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No chunks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
