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
  | 'listening';

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

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const showBottomNav = hasCompletedOnboarding && 
    currentScreen !== 'onboarding' && 
    currentScreen !== 'lesson' && 
    currentScreen !== 'shadowing' &&
    currentScreen !== 'quiz' &&
    currentScreen !== 'listening';

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

      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
