import React from 'react';
import { Thermometer, Droplets, Activity, DoorClosed, DoorOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { DynamicIcon } from '../oneui/DynamicIcon';

interface SensorWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SensorWidget: React.FC<SensorWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const deviceClass = entity?.attributes?.device_class || '';
  const isBinary = config.entityId.startsWith('binary_sensor.');
  const state = entity?.state ?? '--';
  const unit = entity?.attributes?.unit_of_measurement || '';
  const name = config.customName || entity?.attributes?.friendly_name || 'Sensor';

  let Icon = Activity;
  let isAlert = false;
  let displayValue = `${state} ${unit}`.trim();
  let statusText = 'Normal';
  let accentColor = config.customColor || '#3B82F6';

  if (deviceClass === 'temperature') {
    Icon = Thermometer;
    accentColor = '#F97316';
    statusText = 'Clima';
  } else if (deviceClass === 'humidity') {
    Icon = Droplets;
    accentColor = '#06B6D4';
    statusText = 'Umidade relativa';
  } else if (deviceClass === 'motion') {
    Icon = Activity;
    isAlert = state === 'on';
    accentColor = isAlert ? '#EF4444' : '#10B981';
    displayValue = isAlert ? 'Movimento' : 'Parado';
    statusText = isAlert ? 'Detectado agora' : 'Sem movimento';
  } else if (deviceClass === 'door') {
    isAlert = state === 'on';
    Icon = isAlert ? DoorOpen : DoorClosed;
    accentColor = isAlert ? '#EF4444' : '#10B981';
    displayValue = isAlert ? 'Aberta' : 'Fechada';
    statusText = isAlert ? 'Atenção' : 'Protegida';
  }

  const isPill = config.size === 'pill';

  if (isPill) {
    return (
      <OneUICard
        size={config.size}
        isActive={isAlert}
        activeGlowColor={accentColor}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        <div className="w-full h-full flex items-center justify-between gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            <DynamicIcon name={config.customIcon} defaultIcon={Icon} size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-white truncate">{name}</span>
            <span className="block text-[10px] text-slate-400 truncate">{statusText}</span>
          </div>

          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            {displayValue}
          </span>
        </div>
      </OneUICard>
    );
  }

  return (
    <OneUICard
      size={config.size}
      isActive={isAlert}
      activeGlowColor={accentColor}
      isEditMode={isEditMode}
      isFavorite={config.isFavorite}
      onToggleFavorite={onToggleFavorite}
      onResize={onResize}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0"
              style={{
                backgroundColor: `${accentColor}25`,
                color: accentColor,
              }}
            >
              <DynamicIcon name={config.customIcon} defaultIcon={Icon} size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm sm:text-base text-white truncate leading-tight">{name}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{statusText}</p>
            </div>
          </div>

          <span className="text-base font-medium text-white tracking-tight shrink-0 px-1">
            {displayValue}
          </span>
        </div>
      </div>

      {config.size !== '1x1' && (
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            {isAlert ? <ShieldAlert size={14} className="text-rose-400" /> : <ShieldCheck size={14} className="text-emerald-400" />}
            Status Zigbee
          </span>
          <span className="text-emerald-400 font-medium">Sinal Excelente</span>
        </div>
      )}
    </OneUICard>
  );
};
