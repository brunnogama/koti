import React, { useState } from 'react';
import { Zap, Check } from 'lucide-react';
import { HAEntityState } from '../../../types/homeAssistant';
import { WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';
import { DynamicIcon } from '../../oneui/DynamicIcon';

interface GnomeSceneCardProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onActivate: () => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeSceneCard: React.FC<GnomeSceneCardProps> = ({
  config,
  entity,
  isEditMode,
  onActivate,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const name = config.customName || entity?.attributes?.friendly_name || 'Cenário';
  const [justActivated, setJustActivated] = useState(false);
  const isPill = config.size === 'pill';

  const handleTrigger = () => {
    if (isEditMode) return;
    onActivate();
    setJustActivated(true);
    setTimeout(() => setJustActivated(false), 1600);
  };

  if (isPill) {
    return (
      <AdwCard
        size="pill"
        isActive={justActivated}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleTrigger}
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                justActivated
                  ? 'bg-[#2ec27e]/20 text-[#2ec27e]'
                  : 'bg-[#3584e4]/20 text-[#3584e4]'
              }`}
            >
              {justActivated ? (
                <Check size={16} />
              ) : config.customIcon ? (
                <DynamicIcon name={config.customIcon} size={16} />
              ) : (
                <Zap size={16} />
              )}
            </div>
            <span className="text-[13px] font-medium text-white truncate">{name}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTrigger();
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
              justActivated
                ? 'bg-[#2ec27e] text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {justActivated ? 'Executado' : 'Executar'}
          </button>
        </div>
      </AdwCard>
    );
  }

  return (
    <AdwCard
      size={config.size}
      isActive={justActivated}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleTrigger}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            justActivated
              ? 'bg-[#2ec27e]/20 text-[#2ec27e]'
              : 'bg-[#3584e4]/20 text-[#3584e4]'
          }`}
        >
          {justActivated ? (
            <Check size={20} />
          ) : config.customIcon ? (
            <DynamicIcon name={config.customIcon} size={20} />
          ) : (
            <Zap size={20} />
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTrigger();
          }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            justActivated
              ? 'bg-[#2ec27e] text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {justActivated ? 'Executado!' : 'Disparar'}
        </button>
      </div>

      <div className="mt-3 min-w-0">
        <div className="text-[14px] font-medium text-white truncate">{name}</div>
        <div className="text-[12px] text-white/60 mt-0.5">Cenário de Automação</div>
      </div>
    </AdwCard>
  );
};
