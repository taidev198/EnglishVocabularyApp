import { Button } from './ui/button';
import { useState } from 'react';
import { ChevronRight, Headphones, BookOpen, Trophy } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Learn English Through Listening',
    description: 'Master vocabulary with native audio and contextual chunks',
    icon: Headphones,
    color: 'from-purple-400 to-pink-400',
    image: 'https://images.unsplash.com/photo-1758521541246-128a548b7806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBsaXN0ZW5pbmclMjBoZWFkcGhvbmVzJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYyMjYyODgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Understand Real Context',
    description: 'See sentences, hear audio, and get instant translations',
    icon: BookOpen,
    color: 'from-blue-400 to-cyan-400',
    image: 'https://images.unsplash.com/photo-1673515334717-da4d85aaf38b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MjI2Mjg4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Track Your Progress',
    description: 'Build streaks, earn achievements, and stay motivated!',
    icon: Trophy,
    color: 'from-green-400 to-emerald-400',
    image: 'https://images.unsplash.com/photo-1758518731027-78a22c8852ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2hpZXZlbWVudCUyMHN1Y2Nlc3MlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NjIyNTgxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-6 py-8">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Icon/Image */}
          <div className="w-full max-w-xs aspect-square mb-8 rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Icon Badge */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Text */}
          <h1 className="text-gray-900 text-center mb-4">
            {slide.title}
          </h1>
          <p className="text-gray-600 text-center max-w-sm">
            {slide.description}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className={`w-full py-6 bg-gradient-to-r ${slide.color} hover:opacity-90 transition-opacity`}
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
}
