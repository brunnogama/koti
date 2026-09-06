import React from 'react';
import { Wind, Plus, Minus, Power } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';

interface ClimateWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onSetTemperature: (temp: number) => void;
  onTogglePower: () => void;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
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
  onMovePrev,
  onMoveNext,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isOff = entity?.state === 'off';
  const currentTemp = entity?.attributes?.current_temperature ?? 24;
  const targetTemp = entity?.attributes?.temperature ?? 22;
  const name = config.customName || entity?.attributes?.friendly_name || 'Climatização';
  const accentColor = config.customColor || '#06B6D4';

  return (
    <OneUICard
      size={config.size}
      isActive={!isOff}
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
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: !isOff ? `${accentColor}33` : 'rgba(255,255,255,0.05)',
              color: !isOff ? accentColor : '#94a3b8',
            }}
          >
            <Wind size={22} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePower();
            }}
            className={`p-2 rounded-full transition-colors ${
              !isOff ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500 hover:text-white'
            }`}
          >
            <Power size={16} />
          </button>
        </div>

        <div className="mt-1">
          <h3 className="font-medium text-base text-white truncate">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
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
