import React from 'react';
import { Wind, Plus, Minus, Power } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { DynamicIcon } from '../oneui/DynamicIcon';

interface ClimateWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onSetTemperature: (temp: number) => void;
  onTogglePower: () => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ClimateWidget: React.FC<ClimateWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onSetTemperature,
  onTogglePower,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isOff = entity?.state === 'off';
  const currentTemp = entity?.attributes?.current_temperature ?? 24;
  const targetTemp = entity?.attributes?.temperature ?? 22;
  const name = config.customName || entity?.attributes?.friendly_name || 'Climatização';
  const accentColor = config.customColor || '#06B6D4';

  const isPill = config.size === 'pill';

  if (isPill) {
    return (
      <OneUICard
        size={config.size}
        isActive={!isOff}
        activeGlowColor={accentColor}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={onTogglePower}
      >
        <div className="w-full h-full flex items-center justify-between gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{
              backgroundColor: !isOff ? `${accentColor}33` : 'rgba(255,255,255,0.05)',
              color: !isOff ? accentColor : '#94A3B8',
            }}
          >
            <DynamicIcon name={config.customIcon} defaultIcon={Wind} size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-white truncate">{name}</span>
            <span className="block text-[10px] text-slate-400 truncate">
              {!isOff ? `Atual ${currentTemp}°C` : 'Desligado'}
            </span>
          </div>

          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={
              !isOff
                ? {
                    backgroundColor: `${accentColor}25`,
                    color: accentColor,
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#64748B',
                  }
            }
          >
            {!isOff ? `${targetTemp}°C` : 'Off'}
          </span>
        </div>
      </OneUICard>
    );
  }

  return (
    <OneUICard
      size={config.size}
      isActive={!isOff}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="w-full">
        {/* Top row: Icon on left, power button on right */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0"
            style={{
              backgroundColor: !isOff ? `${accentColor}33` : 'rgba(255,255,255,0.05)',
              color: !isOff ? accentColor : '#94a3b8',
            }}
          >
            <DynamicIcon name={config.customIcon} defaultIcon={Wind} size={20} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePower();
            }}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              !isOff ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500 hover:text-white'
            }`}
          >
            <Power size={16} />
          </button>
        </div>

        {/* Device Name and Ambient Temp below the icon */}
        <div className="mt-2.5 min-w-0">
          <h3 className="font-medium text-sm sm:text-base text-white truncate leading-tight">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {!isOff ? `Ambiente: ${currentTemp}°C` : 'Desligado'}
          </p>
        </div>
      </div>

      {/* Target temperature dial/controls */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-light text-white">{targetTemp}</span>
          <span className="text-sm text-slate-400">°C</span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSetTemperature(targetTemp - 1)}
            disabled={isOff || targetTemp <= 16}
            className="w-9 h-9 rounded-full oneui-glass-pill flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-30 active:scale-95 transition-all"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={() => onSetTemperature(targetTemp + 1)}
            disabled={isOff || targetTemp >= 30}
            className="w-9 h-9 rounded-full oneui-glass-pill flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-30 active:scale-95 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </OneUICard>
  );
};
