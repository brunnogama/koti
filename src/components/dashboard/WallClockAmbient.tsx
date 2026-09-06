import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sun, Lightbulb, Sparkles, CloudSun, CloudRain, Cloud } from 'lucide-react';
import { WeatherData } from '../../types/dashboard';

interface WallClockAmbientProps {
  onDismiss: () => void;
  activeLightsCount: number;
  weather?: WeatherData;
}

export const WallClockAmbient: React.FC<WallClockAmbientProps> = ({
  onDismiss,
  activeLightsCount,
  weather,
}) => {
  const [time, setTime] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSeconds(now.toLocaleTimeString([], { second: '2-digit' }));
      setDateStr(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col justify-between p-10 md:p-16 select-none cursor-pointer transition-opacity duration-700 animate-fadeIn"
    >
      {/* Top ambient status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full oneui-glass-pill text-xs text-slate-300 font-medium">
          <Sparkles size={16} className="text-blue-400" />
          <span>Koti Modo Ambiente</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            Casa Segura
          </span>
          <span className="flex items-center gap-1.5">
            <Sun size={16} className="text-amber-400" />
            {weather
              ? `${weather.temperature}°C ${weather.conditionText} • ${weather.cityName}`
              : '24°C Parcialmente Nublado'}
          </span>
        </div>
      </div>


      {/* Big Minimalist One UI Clock */}
      <div className="text-center my-auto">
        <div className="flex items-baseline justify-center">
          <span className="text-7xl md:text-9xl lg:text-[11rem] font-extralight text-white tracking-tighter">
            {time}
          </span>
          <span className="text-2xl md:text-4xl font-light text-blue-400/80 ml-2">
            {seconds}
          </span>
        </div>
        <p className="text-base md:text-xl font-light text-slate-400 capitalize mt-3 tracking-wide">
          {dateStr}
        </p>

        {/* Quick house summary badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full oneui-glass text-xs font-medium text-slate-200">
          <Lightbulb size={16} className={activeLightsCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
          <span>
            {activeLightsCount > 0
              ? `${activeLightsCount} luzes acesas no momento`
              : 'Todas as luzes apagadas'}
          </span>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-slate-500 font-light">
        Toque na tela ou pressione qualquer tecla para acordar o painel
      </div>
    </div>
  );
};
