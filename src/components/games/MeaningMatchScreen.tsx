import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { wordApi } from '../../api/vocabulary';
import { Word } from '../../api/types';

interface MeaningMatchScreenProps {
  onNavigate: (screen: string) => void;
}

interface CardData {
  id: number;
  word: string;
  meaning: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'word' | 'meaning';
}

export function MeaningMatchScreen({ onNavigate }: MeaningMatchScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 4, 'id', 'ASC');
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
      setupGame();
    }
  }, [words]);

  useEffect(() => {
    if (cards.length > 0 && !gameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cards, gameComplete]);

  const setupGame = () => {
    const gameWords = words.slice(0, 4);
    const cardData: CardData[] = [];
    
    gameWords.forEach((word, index) => {
      cardData.push({
        id: index * 2,
        word: word.englishWord,
        meaning: word.meaning || word.translation || '',
        isFlipped: false,
        isMatched: false,
        type: 'word',
      });
      cardData.push({
        id: index * 2 + 1,
        word: word.englishWord,
        meaning: word.meaning || word.translation || '',
        isFlipped: false,
        isMatched: false,
        type: 'meaning',
      });
    });

    // Shuffle cards
    const shuffled = cardData.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setGameComplete(false);
    setTimeElapsed(0);
  };

  const handleCardClick = (index: number) => {
    const card = cards[index];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, index];
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      // Check for match after both cards are flipped
      setTimeout(() => {
        checkMatch(newFlippedCards[0], newFlippedCards[1]);
      }, 1000);
    }
  };

  const checkMatch = (index1: number, index2: number) => {
    setCards((prevCards) => {
      const card1 = prevCards[index1];
      const card2 = prevCards[index2];
      const isMatch = card1.word === card2.word && card1.type !== card2.type;

      const newCards = [...prevCards];
      if (isMatch) {
        newCards[index1].isMatched = true;
        newCards[index2].isMatched = true;
        setMatchedPairs((prev) => {
          const newCount = prev + 1;
          if (newCount === words.length) {
            setGameComplete(true);
          }
          return newCount;
        });
      } else {
        newCards[index1].isFlipped = false;
        newCards[index2].isFlipped = false;
      }
      return newCards;
    });
    setFlippedCards([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('review')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{matchedPairs}/{words.length}</span>
            </div>
          </div>
        </div>

        {/* Game Complete */}
        {gameComplete && (
          <Card className="w-full p-6 mb-6 bg-gradient-to-r from-green-400 to-emerald-400 border-0 shadow-lg">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <p className="font-semibold text-lg">Congratulations!</p>
                <p className="text-sm opacity-90">Time: {formatTime(timeElapsed)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || flippedCards.length >= 2}
              className={`aspect-square rounded-2xl p-4 flex items-center justify-center transition-all shadow-lg ${
                card.isMatched
                  ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white'
                  : card.isFlipped
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-400 text-white'
                  : 'bg-white/80 backdrop-blur text-gray-800 hover:scale-105'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <p className="font-medium text-center text-sm">
                  {card.type === 'word' ? card.word : card.meaning}
                </p>
              ) : (
                <p className="text-4xl">?</p>
              )}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={gameComplete ? setupGame : () => {}}
          className="w-full py-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
        >
          {gameComplete ? 'Play Again' : 'Match the pairs!'}
        </Button>
      </div>
    </div>
  );
}

