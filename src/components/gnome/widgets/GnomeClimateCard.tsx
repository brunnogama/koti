import React from 'react';
import { Thermometer, Plus, Minus } from 'lucide-react';
import { HAEntityState } from '../../../types/homeAssistant';
import { WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';

interface GnomeClimateCardProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onTemperatureChange: (val: number) => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeClimateCard: React.FC<GnomeClimateCardProps> = ({
  config,
  entity,
  isEditMode,
  onTemperatureChange,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const name = config.customName || entity?.attributes?.friendly_name || 'Termostato';
  const currentTemp = entity?.attributes?.current_temperature ?? 22;
  const targetTemp = entity?.attributes?.temperature ?? 21;
  const state = entity?.state || 'off';
  const isHeating = state === 'heat';
  const isCooling = state === 'cool';
  const isPill = config.size === 'pill';

  if (isPill) {
    return (
      <AdwCard
        size="pill"
        isActive={isHeating || isCooling}
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
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isHeating
                  ? 'bg-amber-500/20 text-amber-400'
                  : isCooling
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <Thermometer size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-white truncate">{name}</span>
              <span className="text-[11px] text-white/50 truncate">
                Atual: {currentTemp}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onTemperatureChange(targetTemp - 0.5)}
              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Minus size={13} />
            </button>
            <span className="text-xs font-bold font-mono px-1">{targetTemp}°</span>
            <button
              onClick={() => onTemperatureChange(targetTemp + 0.5)}
              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </AdwCard>
    );
  }

  return (
    <AdwCard
      size={config.size}
      isActive={isHeating || isCooling}
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
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isHeating
              ? 'bg-amber-500/20 text-amber-400'
              : isCooling
              ? 'bg-sky-500/20 text-sky-400'
              : 'bg-white/10 text-white/50'
          }`}
        >
          <Thermometer size={20} />
        </div>

        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/60 capitalize">
          {state}
        </span>
      </div>

      <div className="my-2 flex items-baseline justify-between">
        <div>
          <div className="text-[26px] font-bold text-white tracking-tight font-mono">
            {targetTemp}°C
          </div>
          <div className="text-[11px] text-white/60">Atual: {currentTemp}°C</div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onTemperatureChange(targetTemp - 0.5)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => onTemperatureChange(targetTemp + 0.5)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="text-[13px] font-medium text-white truncate">{name}</div>
    </AdwCard>
  );
};
