import React from 'react';
import { Home, Layers, Zap, Sliders } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'rooms' | 'automations' | 'settings';
  onSelectTab: (tab: 'home' | 'rooms' | 'automations' | 'settings') => void;
  accentColor?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  accentColor = '#2C75FF',
}) => {
  const tabs = [
    { id: 'home', label: 'Favoritos', icon: Home },
    { id: 'rooms', label: 'Cômodos', icon: Layers },
    { id: 'automations', label: 'Cenários', icon: Zap },
    { id: 'settings', label: 'Ajustes', icon: Sliders },
  ] as const;

  return (
    <nav className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] left-0 right-0 mx-auto w-fit max-w-[92vw] sm:max-w-md px-3 z-40">
      <div className="flex items-center justify-around gap-1 sm:gap-4 py-2.5 px-5 sm:px-6 rounded-full oneui-glass border border-white/15 shadow-2xl backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center gap-1 relative py-1 px-3 transition-all duration-200"
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${accentColor}33`,
                        color: accentColor,
                      }
                    : undefined
                }
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
