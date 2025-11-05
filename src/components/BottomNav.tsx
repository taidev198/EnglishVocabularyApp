import { Home, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'notebook', label: 'Notebook', icon: BookOpen },
  { id: 'ai', label: 'AI Helper', icon: Lightbulb },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 py-1 px-3 min-w-[60px] transition-colors"
              >
                <div className={`p-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' 
                    : 'bg-transparent'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`} 
                  />
                </div>
                <span className={`transition-colors ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
