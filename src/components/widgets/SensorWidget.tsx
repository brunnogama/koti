import React from 'react';
import { Thermometer, Droplets, Activity, DoorClosed, DoorOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';

interface SensorWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SensorWidget: React.FC<SensorWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onResize,
  onMovePrev,
  onMoveNext,
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

  return (
    <OneUICard
      size={config.size}
      isActive={isAlert}
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
              backgroundColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            <Icon size={22} />
          </div>

          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-slate-300"
          >
            {statusText}
          </span>
        </div>

        <div className="mt-2">
          <div className="text-2xl font-light text-white tracking-tight">
            {displayValue}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{name}</p>
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
