import React from 'react';
import { Activity } from 'lucide-react';
import { HAEntityState } from '../../../types/homeAssistant';
import { WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';
import { DynamicIcon } from '../../oneui/DynamicIcon';

interface GnomeSensorCardProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeSensorCard: React.FC<GnomeSensorCardProps> = ({
  config,
  entity,
  isEditMode,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const name = config.customName || entity?.attributes?.friendly_name || 'Sensor';
  const state = entity?.state || '--';
  const unit = entity?.attributes?.unit_of_measurement || '';
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
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#3584e4]">
              {config.customIcon ? (
                <DynamicIcon name={config.customIcon} size={16} />
              ) : (
                <Activity size={16} />
              )}
            </div>
            <span className="text-[13px] font-medium text-white truncate">{name}</span>
          </div>

          <div className="px-2.5 py-1 rounded-md bg-white/10 text-white font-semibold text-xs shrink-0 font-mono">
            {state} {unit}
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
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3584e4]">
          {config.customIcon ? (
            <DynamicIcon name={config.customIcon} size={20} />
          ) : (
            <Activity size={20} />
          )}
        </div>

        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/60">
          Sensor
        </span>
      </div>

      <div className="mt-3 min-w-0">
        <div className="text-[22px] font-bold text-white tracking-tight leading-none font-mono">
          {state} <span className="text-sm font-normal text-white/60">{unit}</span>
        </div>
        <div className="text-[13px] font-medium text-white/80 mt-1 truncate">{name}</div>
      </div>
    </AdwCard>
  );
};
