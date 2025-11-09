import { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { LessonScreen } from './components/LessonScreen';
import { ShadowingScreen } from './components/ShadowingScreen';
import { NotebookScreen } from './components/NotebookScreen';
import { QuizScreen } from './components/QuizScreen';
import { AIExplanationScreen } from './components/AIExplanationScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ListeningScreen } from './components/ListeningScreen';
import { TodaysChunksScreen } from './components/TodaysChunksScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { ListenTypeScreen } from './components/games/ListenTypeScreen';
import { FillInChunkScreen } from './components/games/FillInChunkScreen';
import { ChunkBuilderScreen } from './components/games/ChunkBuilderScreen';
import { MeaningMatchScreen } from './components/games/MeaningMatchScreen';
import { TranslateBackScreen } from './components/games/TranslateBackScreen';
import { ShadowChallengeScreen } from './components/games/ShadowChallengeScreen';
import { ContextQuizScreen } from './components/games/ContextQuizScreen';
import { QuickReviewFlashcardsScreen } from './components/games/QuickReviewFlashcardsScreen';
import { TimeAttackScreen } from './components/games/TimeAttackScreen';
import { StoryModeScreen } from './components/games/StoryModeScreen';
import { AISentenceBuilderScreen } from './components/games/AISentenceBuilderScreen';
import { PhonemeBackendTestScreen } from './components/games/PhonemeBackendTestScreen';
import { BottomNav } from './components/BottomNav';

type Screen = 
  | 'onboarding' 
  | 'home' 
  | 'lesson' 
  | 'shadowing' 
  | 'notebook' 
  | 'quiz' 
  | 'ai' 
  | 'progress'
  | 'listening'
  | 'todays-chunks'
  | 'review'
  | 'listen-type'
  | 'fill-in-chunk'
  | 'chunk-builder'
  | 'meaning-match'
  | 'translate-back'
  | 'shadow-challenge'
  | 'context-quiz'
  | 'quick-review'
  | 'time-attack'
  | 'story-mode'
  | 'ai-sentence-builder'
  | 'phoneme-backend-test';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding before
    const completed = localStorage.getItem('onboardingCompleted');
    if (completed === 'true') {
      setHasCompletedOnboarding(true);
      setCurrentScreen('home');
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: Screen | string) => {
    setCurrentScreen(screen as Screen);
  };

  const showBottomNav = hasCompletedOnboarding && 
    currentScreen !== 'onboarding' && 
    currentScreen !== 'lesson' && 
    currentScreen !== 'shadowing' &&
    currentScreen !== 'quiz' &&
    currentScreen !== 'listening' &&
    currentScreen !== 'todays-chunks' &&
    currentScreen !== 'review' &&
    currentScreen !== 'listen-type' &&
    currentScreen !== 'fill-in-chunk' &&
    currentScreen !== 'chunk-builder' &&
    currentScreen !== 'meaning-match' &&
    currentScreen !== 'translate-back' &&
    currentScreen !== 'shadow-challenge' &&
    currentScreen !== 'context-quiz' &&
    currentScreen !== 'quick-review' &&
    currentScreen !== 'time-attack' &&
    currentScreen !== 'story-mode' &&
    currentScreen !== 'ai-sentence-builder' &&
    currentScreen !== 'phoneme-backend-test';

  return (
    <div className="min-h-screen">
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'lesson' && (
        <LessonScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'shadowing' && (
        <ShadowingScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'notebook' && (
        <NotebookScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'quiz' && (
        <QuizScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'ai' && (
        <AIExplanationScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'progress' && (
        <ProgressScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'listening' && (
        <ListeningScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'todays-chunks' && (
        <TodaysChunksScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'review' && (
        <ReviewScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'listen-type' && (
        <ListenTypeScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'fill-in-chunk' && (
        <FillInChunkScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'chunk-builder' && (
        <ChunkBuilderScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'meaning-match' && (
        <MeaningMatchScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'translate-back' && (
        <TranslateBackScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'shadow-challenge' && (
        <ShadowChallengeScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'context-quiz' && (
        <ContextQuizScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'quick-review' && (
        <QuickReviewFlashcardsScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'time-attack' && (
        <TimeAttackScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'story-mode' && (
        <StoryModeScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'ai-sentence-builder' && (
        <AISentenceBuilderScreen onNavigate={handleNavigate} />
      )}

      {currentScreen === 'phoneme-backend-test' && (
        <PhonemeBackendTestScreen onNavigate={handleNavigate} />
      )}

      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
