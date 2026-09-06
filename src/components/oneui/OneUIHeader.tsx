import React, { useState, useEffect } from 'react';
import { Settings, Edit3, Check, Tv, Wifi, WifiOff } from 'lucide-react';

interface OneUIHeaderProps {
  title: string;
  subtitle?: string;
  activeDevicesCount: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'auth_failed';
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenSettings: () => void;
  isTV: boolean;
  onToggleTVMode: () => void;
}

export const OneUIHeader: React.FC<OneUIHeaderProps> = ({
  title,
  subtitle,
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

  return (
    <header className="relative w-full pt-8 pb-4 px-6 md:px-10 transition-all duration-300">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-4">
        {/* Connection status pill */}
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

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* TV Mode Toggle button (allows testing Android TV D-Pad experience anywhere) */}
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

          {/* Edit Dashboard Button */}
          <button
            onClick={onToggleEditMode}
            className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
              isEditMode
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                : 'oneui-glass text-slate-200 hover:text-white'
            }`}
          >
            {isEditMode ? (
              <>
                <Check size={14} />
                <span>Concluir</span>
              </>
            ) : (
              <>
                <Edit3 size={14} />
                <span>Editar</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full oneui-glass text-slate-300 hover:text-white transition-all duration-200 hover:rotate-45"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Large Reachability Samsung One UI Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold capitalize">
            {dateStr}
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mt-1">
            {title}
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1 font-normal">
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
