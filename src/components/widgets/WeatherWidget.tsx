import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { WidgetConfig, WeatherData } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';

interface WeatherWidgetProps {
  config: WidgetConfig;
  weather: WeatherData;
  isEditMode: boolean;
  onRefresh?: () => void;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  config,
  weather,
  isEditMode,
  onRefresh,
  onResize,
  onMovePrev,
  onMoveNext,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const accentColor = config.customColor || '#06B6D4';

  const getWeatherIcon = (code: number, isDay = true) => {
    if (code === 0 || code === 1) {
      return <Sun size={28} className="text-amber-400 animate-spin-slow" />;
    }
    if (code === 2) {
      return <CloudSun size={28} className="text-amber-300" />;
    }
    if (code === 3) {
      return <Cloud size={28} className="text-slate-300" />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog size={28} className="text-slate-300" />;
    }
    if (code >= 51 && code <= 55) {
      return <CloudDrizzle size={28} className="text-cyan-300" />;
    }
    if (code >= 61 && code <= 82) {
      return <CloudRain size={28} className="text-blue-400" />;
    }
    if (code >= 95) {
      return <CloudLightning size={28} className="text-purple-400" />;
    }
    if (code >= 71 && code <= 75) {
      return <Snowflake size={28} className="text-cyan-200" />;
    }
    return <Sun size={28} className="text-amber-400" />;
  };

  return (
    <OneUICard
      size={config.size}
      isActive={false}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onMovePrev={onMovePrev}
      onMoveNext={onMoveNext}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div>
        {/* Top bar: Location + Weather Icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium truncate max-w-[70%]">
            <MapPin size={13} className="text-cyan-400 shrink-0" />
            <span className="truncate">{weather.cityName}</span>
          </div>

          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            {getWeatherIcon(weather.conditionCode, weather.isDay)}
          </div>
        </div>

        {/* Temperature and Condition */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              {weather.temperature}°
            </span>
            {weather.tempMax !== undefined && weather.tempMin !== undefined && (
              <span className="text-xs text-slate-400">
                {weather.tempMin}° / {weather.tempMax}°
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1 truncate">
            {weather.conditionText}
          </p>
        </div>
      </div>

      {/* Extended details for 2x1 and 2x2 cards */}
      {config.size !== '1x1' && (
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
          <div className="flex flex-col items-center min-w-0">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
              <Thermometer size={12} className="text-amber-400 shrink-0" />
              <span>Sensação</span>
            </span>
            <span className="text-white font-medium mt-0.5 truncate">
              {weather.apparentTemperature ?? weather.temperature}°C
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/10 min-w-0">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
              <Droplets size={12} className="text-cyan-400 shrink-0" />
              <span>Umidade</span>
            </span>
            <span className="text-white font-medium mt-0.5 truncate">{weather.humidity}%</span>
          </div>

          <div className="flex flex-col items-center min-w-0">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
              <Wind size={12} className="text-blue-400 shrink-0" />
              <span>Vento</span>
            </span>
            <span className="text-white font-medium mt-0.5 truncate">{weather.windSpeed} km/h</span>
          </div>
        </div>
      )}
    </OneUICard>
  );
};
