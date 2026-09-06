import React, { useState, useEffect } from 'react';
import { Settings, Edit3, Check, Wifi, WifiOff, Sun, CloudSun, CloudRain, Cloud } from 'lucide-react';
import { WeatherData } from '../../types/dashboard';

interface OneUIHeaderProps {
  userName?: string;
  title?: string;
  subtitle?: string;
  weather?: WeatherData;
  activeDevicesCount: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'auth_failed';
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenSettings: () => void;
  isTV?: boolean;
  onToggleTVMode?: () => void;
}

export const OneUIHeader: React.FC<OneUIHeaderProps> = ({
  userName = 'Bruno',
  title,
  subtitle: _subtitle,
  weather,
  activeDevicesCount: _activeDevicesCount,
  connectionStatus,
  isEditMode,
  onToggleEditMode,
  onOpenSettings,
  isTV: _isTV,
  onToggleTVMode: _onToggleTVMode,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Bom dia, ${userName}!`;
    if (hour >= 12 && hour < 18) return `Boa tarde, ${userName}!`;
    return `Boa noite, ${userName}!`;
  };

  const getWeatherIcon = (code?: number) => {
    if (code === undefined || code === 0 || code === 1) return <Sun size={15} className="text-amber-400" />;
    if (code === 2) return <CloudSun size={15} className="text-amber-300" />;
    if (code >= 61) return <CloudRain size={15} className="text-blue-400" />;
    return <Cloud size={15} className="text-slate-300" />;
  };

  return (
    <>
      {/* Sticky Frosted Glass Top Bar (Protects Android status bar & icons when scrolling) */}
      <div className="sticky top-0 z-30 w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 px-6 md:px-10 backdrop-blur-2xl bg-[#0d0f12]/85 border-b border-white/5 transition-all duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Connection status + Weather Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full oneui-glass-pill text-xs font-medium">
              {connectionStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Wifi size={14} className="text-emerald-400" />
                  <span className="text-emerald-300">Online</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-300">Conectando...</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-rose-400" />
                  <span className="text-rose-300">Desconectado</span>
                </>
              )}
            </div>

            {weather && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full oneui-glass-pill text-xs font-medium text-slate-300">
                {getWeatherIcon(weather.conditionCode)}
                <span>{weather.temperature}°C</span>
                <span className="hidden sm:inline text-slate-400">• {weather.cityName}</span>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Edit Dashboard Button (Icon Only) */}
            <button
              onClick={onToggleEditMode}
              title={isEditMode ? 'Concluir edição' : 'Editar Dashboard'}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isEditMode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                  : 'oneui-glass text-slate-300 hover:text-white'
              }`}
            >
              {isEditMode ? <Check size={18} /> : <Edit3 size={18} />}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-full oneui-glass text-slate-300 hover:text-white transition-all duration-200 hover:rotate-45"
              title="Ajustes"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Clean One UI Greeting Area */}
      <header className="relative w-full pt-2 pb-1 px-6 md:px-10 max-w-7xl mx-auto transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          <div>
            {/* Dynamic greeting with user's name only */}
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              {title || getGreeting()}
            </h1>
          </div>

          {/* Digital Clock Display */}
          <div className="hidden sm:block text-right">
            <div className="text-2xl sm:text-3xl font-extralight text-white/90 tracking-wide">
              {time}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
