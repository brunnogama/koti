import React from 'react';
import { Power } from 'lucide-react';
import { HAEntityState } from '../../../types/homeAssistant';
import { WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';
import { AdwSwitch } from '../AdwSwitch';
import { DynamicIcon } from '../../oneui/DynamicIcon';

interface GnomeSwitchCardProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onToggle: () => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeSwitchCard: React.FC<GnomeSwitchCardProps> = ({
  config,
  entity,
  isEditMode,
  onToggle,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Tomada';
  const isPill = config.size === 'pill';

  if (isPill) {
    return (
      <AdwCard
        size="pill"
        isActive={isOn}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={!isEditMode ? onToggle : undefined}
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isOn ? 'bg-[#3584e4]/20 text-[#3584e4]' : 'bg-white/10 text-white/50'
              }`}
            >
              {config.customIcon ? (
                <DynamicIcon name={config.customIcon} size={16} />
              ) : (
                <Power size={16} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-white truncate">{name}</span>
              <span className="text-[11px] text-white/50 truncate">
                {isOn ? 'Ligado' : 'Desligado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <AdwSwitch checked={isOn} onChange={() => onToggle()} />
          </div>
        </div>
      </AdwCard>
    );
  }

  return (
    <AdwCard
      size={config.size}
      isActive={isOn}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={!isEditMode ? onToggle : undefined}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isOn
              ? 'bg-[#3584e4]/20 text-[#3584e4] shadow-[0_0_12px_rgba(53,132,228,0.3)]'
              : 'bg-white/10 text-white/50'
          }`}
        >
          {config.customIcon ? (
            <DynamicIcon name={config.customIcon} size={20} />
          ) : (
            <Power size={20} />
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <AdwSwitch checked={isOn} onChange={() => onToggle()} />
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <div className="text-[14px] font-medium text-white truncate leading-tight">{name}</div>
        <div className="text-[12px] text-white/60 mt-1">
          {isOn ? 'Ligado' : 'Desligado'}
        </div>
      </div>
    </AdwCard>
  );
};
