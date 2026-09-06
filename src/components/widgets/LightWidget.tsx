import React, { useState, useEffect, useRef } from 'react';
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
  const serverBrightness = Math.round((rawBrightness / 255) * 100);
  const accentColor = config.customColor || '#FFB020';

  const [localBrightness, setLocalBrightness] = useState(serverBrightness);
  const [isDragging, setIsDragging] = useState(false);
  const lastVibratePct = useRef(serverBrightness);

  useEffect(() => {
    if (!isDragging) {
      setLocalBrightness(serverBrightness);
    }
  }, [serverBrightness, isDragging]);

  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(style === 'medium' ? 22 : 12);
      }
    } catch (_) {}
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    e.stopPropagation();
    const track = e.currentTarget;
    try {
      track.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(true);
    updateBrightnessFromPointer(e.clientX, track);
    triggerHaptic('light');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isEditMode) return;
    e.stopPropagation();
    updateBrightnessFromPointer(e.clientX, e.currentTarget);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
    triggerHaptic('medium');
  };

  const updateBrightnessFromPointer = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const rawPct = Math.round(((clientX - rect.left) / rect.width) * 100);
    const clamped = Math.max(1, Math.min(100, rawPct));
    setLocalBrightness(clamped);

    // Subtle haptic every 15% change during drag
    if (Math.abs(clamped - lastVibratePct.current) >= 15) {
      triggerHaptic('light');
      lastVibratePct.current = clamped;
    }

    onBrightnessChange(Math.round((clamped / 100) * 255));
  };

  const isPill = config.size === 'pill';
  const displayBrightness = isDragging ? localBrightness : (isOn ? localBrightness : 0);

  // PILL FORMAT: Ultra-compact One UI horizontal slider
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
        onMovePrev={onMovePrev}
        onMoveNext={onMoveNext}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-full flex items-center justify-between overflow-hidden cursor-ew-resize touch-none"
        >
          {/* Active Dimmer fill background inside pill */}
          {isOn && (
            <div
              className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-[18px] transition-[width] duration-75"
              style={{
                width: `${displayBrightness}%`,
                backgroundColor: `${accentColor}35`,
                borderRight: `2px solid ${accentColor}`,
              }}
            />
          )}

          {/* Left: Quick Toggle Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              triggerHaptic('medium');
            }}
            title={isOn ? 'Desligar' : 'Ligar'}
            className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isOn ? 'shadow-md' : 'bg-white/5 text-slate-400'
            }`}
            style={
              isOn
                ? {
                    backgroundColor: `${accentColor}44`,
                    color: accentColor,
                  }
                : undefined
            }
          >
            <DynamicIcon
              name={config.customIcon}
              defaultIcon={Lightbulb}
              size={18}
              className={isOn ? 'filter drop-shadow-[0_0_6px_currentColor]' : ''}
            />
          </button>

          {/* Center: Name */}
          <div className="relative z-10 flex-1 min-w-0 px-2.5">
            <span className="block text-xs font-medium text-white truncate">{name}</span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isOn ? 'Arraste para dimerizar' : 'Desligada'}
            </span>
          </div>

          {/* Right: Percent badge */}
          <span
            className={`relative z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              isOn ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
            }`}
          >
            {isOn ? `${displayBrightness}%` : '0%'}
          </span>
        </div>
      </OneUICard>
    );
  }

  // STANDARD CARD FORMAT (1x1, 2x1, 2x2)
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
      onClick={() => {
        onToggle();
        triggerHaptic('medium');
      }}
    >
      <div>
        {/* Header row: Icon (quick toggle) + Power Indicator */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              triggerHaptic('medium');
            }}
            title={isOn ? 'Desligar' : 'Ligar'}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isOn ? 'shadow-lg hover:scale-105' : 'bg-white/5 text-slate-400'
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
          </button>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isOn ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
            }`}
          >
            {isOn ? `${displayBrightness}%` : 'Desligada'}
          </span>
        </div>

        {/* Title and Status */}
        <div className="mt-2">
          <h3 className="font-medium text-base text-white truncate">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isOn ? 'Ligada' : 'Toque para ligar'}
          </p>
        </div>
      </div>

      {/* Direct Drag Dimmer on 1x1 cards */}
      {config.size === '1x1' && isOn && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="mt-3 pt-2 border-t border-white/10 touch-none cursor-ew-resize"
          title="Deslize horizontalmente para ajustar brilho"
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Dimmer</span>
            <span className="font-medium text-white">{displayBrightness}%</span>
          </div>
          <div className="relative w-full h-3.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-75"
              style={{
                width: `${displayBrightness}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}88`,
              }}
            />
          </div>
        </div>
      )}

      {/* Expanded Slider for 2x1 and 2x2 cards */}
      {config.size !== '1x1' && isOn && (
        <div className="mt-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
          <OneUISlider
            value={displayBrightness}
            onChange={(val) => {
              setLocalBrightness(val);
              onBrightnessChange(Math.round((val / 100) * 255));
            }}
            accentColor={accentColor}
            label="Intensidade"
          />
        </div>
      )}
    </OneUICard>
  );
};
