import React from 'react';
import { Lightbulb } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { OneUISlider } from '../oneui/OneUISlider';
import { DynamicIcon } from '../oneui/DynamicIcon';

interface LightWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onToggle: () => void;
  onBrightnessChange: (val: number) => void;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const LightWidget: React.FC<LightWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onToggle,
  onBrightnessChange,
  onResize,
  onMovePrev,
  onMoveNext,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Luz';
  const rawBrightness = entity?.attributes?.brightness ?? (isOn ? 255 : 0);
  const brightnessPercent = Math.round((rawBrightness / 255) * 100);
  const accentColor = config.customColor || '#FFB020';

  return (
    <OneUICard
      size={config.size}
      isActive={isOn}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onMovePrev={onMovePrev}
      onMoveNext={onMoveNext}
      onEdit={onEdit}
      onDelete={onDelete}
      onClick={onToggle}
    >
      <div>
        {/* Header row: Icon + Power Indicator */}
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isOn
                ? 'shadow-lg'
                : 'bg-white/5 text-slate-400'
            }`}
            style={
              isOn
                ? {
                    backgroundColor: `${accentColor}33`,
                    color: accentColor,
                    boxShadow: `0 0 20px ${accentColor}55`,
                  }
                : undefined
            }
          >
            <DynamicIcon
              name={config.customIcon}
              defaultIcon={Lightbulb}
              size={24}
              className={isOn ? 'filter drop-shadow-[0_0_8px_currentColor]' : ''}
            />
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isOn
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-500'
            }`}
          >
            {isOn ? `${brightnessPercent}%` : 'Desligada'}
          </span>
        </div>

        {/* Title and Room Name */}
        <div className="mt-2">
          <h3 className="font-medium text-base text-white truncate">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isOn ? 'Ligada' : 'Toque para ligar'}
          </p>
        </div>
      </div>

      {/* Expanded Slider for 2x1 and 2x2 cards */}
      {config.size !== '1x1' && isOn && (
        <div className="mt-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
          <OneUISlider
            value={brightnessPercent}
            onChange={onBrightnessChange}
            accentColor={accentColor}
            label="Intensidade"
          />
        </div>
      )}
    </OneUICard>
  );
};
