import React, { useState, useEffect } from 'react';
import { Settings, Edit3, Check, Tv, Wifi, WifiOff, Sun, CloudSun, CloudRain, Cloud } from 'lucide-react';
import { WeatherData } from '../../types/dashboard';

interface OneUIHeaderProps {
  userName?: string;
  subtitle?: string;
  weather?: WeatherData;
  activeDevicesCount: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'auth_failed';
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenSettings: () => void;
  isTV: boolean;
  onToggleTVMode: () => void;
}

export const OneUIHeader: React.FC<OneUIHeaderProps> = ({
  userName = 'Bruno',
  subtitle,
  weather,
  activeDevicesCount,
  connectionStatus,
  isEditMode,
  onToggleEditMode,
  onOpenSettings,
  isTV,
  onToggleTVMode,
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
    <header className="relative w-full pt-[calc(env(safe-area-inset-top,0px)+3.75rem)] pb-4 px-6 md:px-10 transition-all duration-300">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
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
          {/* TV Mode Toggle button */}
          <button
            onClick={onToggleTVMode}
            title={isTV ? "Modo TV Ativo (Navegação D-Pad)" : "Ativar Modo TV"}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isTV
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'oneui-glass text-slate-300 hover:text-white'
            }`}
          >
            <Tv size={18} />
          </button>

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

      {/* Large Reachability Samsung One UI Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2 pb-1">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold capitalize mb-1">
            {dateStr}
          </div>
          {/* Dynamic greeting with user's name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            {getGreeting()}
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1.5 font-normal">
            {subtitle || `${activeDevicesCount} aparelhos ativos no momento`}
          </p>
        </div>

        {/* Digital Clock Display */}
        <div className="hidden md:block text-right">
          <div className="text-3xl font-extralight text-white/90 tracking-wide">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
};
