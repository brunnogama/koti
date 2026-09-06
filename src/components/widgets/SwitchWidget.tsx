import React from 'react';
import { Zap, Power } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { DynamicIcon } from '../oneui/DynamicIcon';

interface SwitchWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onToggle: () => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SwitchWidget: React.FC<SwitchWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onToggle,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Tomada';
  const accentColor = config.customColor || '#10B981';

  const isPill = config.size === 'pill';

  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    } catch (_) {}
  };

  const handleToggle = () => {
    triggerHaptic();
    onToggle();
  };

  if (isPill) {
    return (
      <OneUICard
        size={config.size}
        isActive={isOn}
        activeGlowColor={accentColor}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={handleToggle}
      >
        <div className="w-full h-full flex items-center justify-between gap-2.5">
          {/* Icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isOn ? 'shadow-md' : 'bg-white/5 text-slate-400'
            }`}
            style={
              isOn
                ? {
                    backgroundColor: `${accentColor}33`,
                    color: accentColor,
                  }
                : undefined
            }
          >
            <DynamicIcon name={config.customIcon} defaultIcon={Power} size={18} />
          </div>

          {/* Name and State */}
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-white truncate">{name}</span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isOn ? 'Ligado' : 'Desligado'}
            </span>
          </div>

          {/* One UI Toggle Pill */}
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
              isOn ? 'bg-emerald-500 justify-end' : 'bg-white/10 justify-start'
            }`}
            style={isOn ? { backgroundColor: accentColor } : undefined}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </OneUICard>
    );
  }

  return (
    <OneUICard
      size={config.size}
      isActive={isOn}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
      onClick={handleToggle}
    >
      <div className="w-full">
        {/* Top row: Icon on left, status badge on right */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
              isOn ? 'shadow-lg' : 'bg-white/5 text-slate-400'
            }`}
            style={
              isOn
                ? {
                    backgroundColor: `${accentColor}33`,
                    color: accentColor,
                    boxShadow: `0 0 16px ${accentColor}55`,
                  }
                : undefined
            }
          >
            <DynamicIcon name={config.customIcon} defaultIcon={Power} size={20} />
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              isOn ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
            }`}
          >
            {isOn ? 'Ligado' : 'Desligado'}
          </span>
        </div>

        {/* Device Name and State below the icon */}
        <div className="mt-2.5 min-w-0">
          <h3 className="font-medium text-sm sm:text-base text-white truncate leading-tight">{name}</h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {isOn ? 'Ligado' : 'Desligado'}
          </p>
        </div>
      </div>

      {config.size !== '1x1' && (
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Zap size={13} className={isOn ? 'text-amber-400' : 'text-slate-500'} />
            Consumo
          </span>
          <span className="text-white font-medium">{isOn ? '45W' : '0W'}</span>
        </div>
      )}
    </OneUICard>
  );
};
