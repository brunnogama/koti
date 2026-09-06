import React, { useState } from 'react';
import { Play, Sparkles, Check } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { DynamicIcon } from '../oneui/DynamicIcon';

interface SceneWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onTrigger: () => void;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SceneWidget: React.FC<SceneWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onTrigger,
  onResize,
  onMovePrev,
  onMoveNext,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const [triggered, setTriggered] = useState(false);
  const name = config.customName || entity?.attributes?.friendly_name || 'Cenário';
  const accentColor = config.customColor || '#8B5CF6';

  const isPill = config.size === 'pill';

  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch (_) {}
  };

  const handleClick = () => {
    triggerHaptic();
    onTrigger();
    setTriggered(true);
    setTimeout(() => setTriggered(false), 2000);
  };

  if (isPill) {
    return (
      <OneUICard
        size={config.size}
        isActive={triggered}
        activeGlowColor={accentColor}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onMovePrev={onMovePrev}
        onMoveNext={onMoveNext}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={handleClick}
      >
        <div className="w-full h-full flex items-center justify-between gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              triggered ? 'scale-110 shadow-lg' : 'bg-white/5'
            }`}
            style={{
              backgroundColor: triggered ? accentColor : `${accentColor}25`,
              color: triggered ? '#FFFFFF' : accentColor,
            }}
          >
            {triggered ? (
              <Check size={18} />
            ) : (
              <DynamicIcon name={config.customIcon} defaultIcon={Sparkles} size={18} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-white truncate">{name}</span>
            <span className="block text-[10px] text-slate-400 truncate">
              {triggered ? 'Executado!' : 'Toque para acionar'}
            </span>
          </div>

          <span
            className="p-1.5 rounded-full bg-white/5 text-slate-400 shrink-0"
          >
            <Play size={12} fill="currentColor" />
          </span>
        </div>
      </OneUICard>
    );
  }

  return (
    <OneUICard
      size={config.size}
      isActive={triggered}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onMovePrev={onMovePrev}
      onMoveNext={onMoveNext}
      onEdit={onEdit}
      onDelete={onDelete}
      onClick={handleClick}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: `${accentColor}33`,
              color: accentColor,
              boxShadow: triggered ? `0 0 25px ${accentColor}` : undefined,
            }}
          >
            {triggered ? (
              <Check size={22} />
            ) : (
              <DynamicIcon name={config.customIcon} defaultIcon={Sparkles} size={22} />
            )}
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
            {triggered ? 'Executado!' : 'Cenário'}
          </span>
        </div>

        <div className="mt-2">
          <h3 className="font-medium text-base text-white truncate">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Toque para acionar</p>
        </div>
      </div>

      {config.size !== '1x1' && (
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Automação One UI</span>
          <span className="flex items-center gap-1 text-purple-400">
            <Play size={12} fill="currentColor" />
            Instantânea
          </span>
        </div>
      )}
    </OneUICard>
  );
};
