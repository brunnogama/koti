import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { HAEntityState } from '../../../types/homeAssistant';
import { WidgetConfig } from '../../../types/dashboard';
import { AdwCard } from '../AdwCard';
import { AdwSwitch } from '../AdwSwitch';
import { AdwScale } from '../AdwScale';
import { DynamicIcon } from '../../oneui/DynamicIcon';

interface GnomeLightCardProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onToggle: () => void;
  onBrightnessChange: (val: number) => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const GnomeLightCard: React.FC<GnomeLightCardProps> = ({
  config,
  entity,
  isEditMode,
  onToggle,
  onBrightnessChange,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Luz';
  const rawBrightness = entity?.attributes?.brightness ?? (isOn ? 255 : 0);
  const serverBrightness = Math.round((rawBrightness / 255) * 100);

  const [localBrightness, setLocalBrightness] = useState(serverBrightness);

  useEffect(() => {
    setLocalBrightness(serverBrightness);
  }, [serverBrightness]);

  const handleBrightnessChange = (val: number) => {
    setLocalBrightness(val);
    onBrightnessChange(val);
  };

  const isPill = config.size === 'pill';

  // In Pill mode: compact Adwaita row
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
                isOn ? 'bg-[#e5a50a]/20 text-[#f6d32d]' : 'bg-white/10 text-white/50'
              }`}
            >
              {config.customIcon ? (
                <DynamicIcon name={config.customIcon} size={16} />
              ) : (
                <Lightbulb size={16} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-white truncate">{name}</span>
              <span className="text-[11px] text-white/50 truncate">
                {isOn ? `${localBrightness}%` : 'Desligada'}
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

  // 1x1, 2x1, 2x2 standard Adwaita Card
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
    >
      {/* Top row: Icon and GtkSwitch */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isEditMode) onToggle();
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isOn
              ? 'bg-[#e5a50a]/20 text-[#f6d32d] shadow-[0_0_12px_rgba(246,211,45,0.2)]'
              : 'bg-white/10 text-white/50 hover:bg-white/15'
          }`}
          title={isOn ? 'Desligar' : 'Ligar'}
        >
          {config.customIcon ? (
            <DynamicIcon name={config.customIcon} size={20} />
          ) : (
            <Lightbulb size={20} />
          )}
        </button>

        <div onClick={(e) => e.stopPropagation()}>
          <AdwSwitch checked={isOn} onChange={() => onToggle()} />
        </div>
      </div>

      {/* Middle: Title & Status */}
      <div className="my-2.5 min-w-0">
        <div className="text-[14px] font-medium text-white truncate leading-tight">{name}</div>
        <div className="text-[12px] text-white/60 mt-0.5">
          {isOn ? `${localBrightness}% • Ligada` : 'Desligada'}
        </div>
      </div>

      {/* Bottom: AdwScale dimmer */}
      <div className="w-full pt-1" onClick={(e) => e.stopPropagation()}>
        <AdwScale
          value={localBrightness}
          disabled={!isOn}
          accentColor="#e5a50a"
          onChange={handleBrightnessChange}
        />
      </div>
    </AdwCard>
  );
};
