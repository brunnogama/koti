import React from 'react';
import { CloudSun, Droplets, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherData, WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';

interface GnomeWeatherCardProps {
  config: WidgetConfig;
  weather: WeatherData;
  isEditMode: boolean;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeWeatherCard: React.FC<GnomeWeatherCardProps> = ({
  config,
  weather,
  isEditMode,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isPill = config.size === 'pill';

  if (isPill) {
    return (
      <AdwCard
        size="pill"
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <CloudSun size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-white truncate">{weather.cityName}</span>
              <span className="text-[11px] text-white/50 truncate">{weather.conditionText}</span>
            </div>
          </div>

          <div className="text-sm font-bold text-white font-mono shrink-0">
            {Math.round(weather.temperature)}°C
          </div>
        </div>
      </AdwCard>
    );
  }

  return (
    <AdwCard
      size={config.size}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
          <CloudSun size={22} />
        </div>

        <div className="text-right">
          <div className="text-[11px] text-white/60 uppercase tracking-wider font-semibold">
            {weather.cityName}
          </div>
          <div className="text-[11px] text-white/40">{weather.conditionText}</div>
        </div>
      </div>

      <div className="my-2 flex items-baseline justify-between">
        <div className="text-[28px] font-bold text-white tracking-tight font-mono">
          {Math.round(weather.temperature)}°
          <span className="text-base font-normal text-white/60">C</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="flex items-center gap-0.5 text-rose-300">
            <ArrowUp size={12} />
            {weather.tempMax !== undefined ? Math.round(weather.tempMax) : '--'}°
          </span>
          <span className="flex items-center gap-0.5 text-sky-300">
            <ArrowDown size={12} />
            {weather.tempMin !== undefined ? Math.round(weather.tempMin) : '--'}°
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-white/60">
        <span className="flex items-center gap-1">
          <Droplets size={12} className="text-sky-400" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind size={12} className="text-teal-400" />
          {weather.windSpeed} km/h
        </span>
      </div>
    </AdwCard>
  );
};
