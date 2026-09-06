import React, { useState, useEffect } from 'react';
import { Settings, Edit3, Check, Wifi, WifiOff, Sun, CloudSun, CloudRain, Cloud, ChevronLeft } from 'lucide-react';
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
  onBack?: () => void;
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
  onBack,
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
      {/* Top Bar with Welcome Greeting on the Left and Actions on the Right */}
      <div className="sticky top-0 z-30 w-full pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 px-6 md:px-10 lg:px-12 backdrop-blur-2xl bg-[#0d0f12]/85 border-b border-white/5 transition-all duration-300">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          {/* Left: Optional Back Button + Welcome Greeting + Weather underneath */}
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 -ml-1 rounded-full oneui-glass text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 border border-white/10"
                title="Voltar"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-white leading-tight truncate">
                {title || getGreeting()}
              </h1>
              {weather && (
                <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-300">
                  {getWeatherIcon(weather.conditionCode)}
                  <span>{weather.temperature}°C</span>
                  <span className="hidden sm:inline text-slate-400">• {weather.cityName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right controls: [Edit] [Online Status Icon] [Settings] */}
          <div className="flex items-center gap-2 shrink-0">
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

            {/* Online Status: apenas um ícone ao lado direito do botão de editar */}
            <div
              className="p-2.5 rounded-full oneui-glass transition-all duration-200 flex items-center justify-center cursor-default"
              title={
                connectionStatus === 'connected'
                  ? 'Home Assistant Conectado'
                  : connectionStatus === 'connecting'
                  ? 'Conectando ao Home Assistant...'
                  : 'Desconectado do Home Assistant'
              }
            >
              {connectionStatus === 'connected' ? (
                <Wifi size={18} className="text-emerald-400" />
              ) : connectionStatus === 'connecting' ? (
                <Wifi size={18} className="text-amber-400 animate-pulse" />
              ) : (
                <WifiOff size={18} className="text-rose-400" />
              )}
            </div>

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
    </>
  );
};
